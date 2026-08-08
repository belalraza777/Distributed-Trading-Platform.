import Razorpay from "razorpay";
import crypto from "crypto";
import { ApiError } from "../middleware/error.middleware";

// Switch provider
const PROVIDER = process.env.PAYMENT_PROVIDER || "INTERNAL";

// ───────────────── TYPES ─────────────────
interface ProviderResult {
  success: boolean;
  provider: "INTERNAL" | "RAZORPAY";

  reference_id?: string;
  provider_order_id?: string;
  provider_payment_id?: string;

  // Add these
  amount?: number | string;
  currency?: string;
  key?: string;
}

//───────────────── RAZORPAY CONFIG ─────────────────
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ───────────────── INTERNAL ─────────────────

const internal = {
  async deposit(amount: number): Promise<ProviderResult> {
    return {
      success: true,
      provider: "INTERNAL",
      reference_id: `INT-${Date.now()}`,
    };
  },

  async withdraw(amount: number): Promise<ProviderResult> {
    return {
      success: true,
      provider: "INTERNAL",
      reference_id: `INT-${Date.now()}`,
    };
  },
};

// ───────────────── RAZORPAY ─────────────────

const razorpay = {
  // Create order for Razorpay deposit
  async createOrder(amount: number) {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `wallet_${Date.now()}`,
    });

    return {
      success: true,
      provider: "RAZORPAY" as const,
      provider_order_id: order.id,
      reference_id: order.receipt,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    };
  },

  // Verify payment after frontend checkout
  verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    return generatedSignature === razorpay_signature;
  },

  // Verify webhook signature for Razorpay
  verifyWebhook(body: Buffer, signature: string) {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    return generatedSignature === signature;
  },

  // Handle withdraw for Razorpay
  async withdraw(amount: number) {
    throw new ApiError(501, "Withdraw not implemented");
  },
};

// ───────────────── EXPORT ─────────────────

export const paymentService = {
  // Create deposit order based on provider
  async createDepositOrder(amount: number) {
    if (PROVIDER === "RAZORPAY") {
      return razorpay.createOrder(amount);
    }

    return internal.deposit(amount);
  },

  // Verify payment based on provider
  verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ) {
    if (PROVIDER !== "RAZORPAY") return true;

    return razorpay.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
  },

  // Verify webhook signature based on provider
  verifyWebhook(body: Buffer, signature: string) {
    if (PROVIDER !== "RAZORPAY") return true;

    return razorpay.verifyWebhook(body, signature);
  },

  // Process withdraw based on provider
  async processWithdraw(amount: number) {
    if (PROVIDER === "RAZORPAY") {
      return razorpay.withdraw(amount);
    }
    return internal.withdraw(amount);
  },
};