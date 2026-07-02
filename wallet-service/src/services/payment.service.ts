// Switch provider: set PAYMENT_PROVIDER=RAZORPAY in .env when ready
const PROVIDER = process.env.PAYMENT_PROVIDER || "INTERNAL";

interface ProviderResult {
  success: boolean;
  provider: "INTERNAL" | "RAZORPAY";
  reference_id?: string;
  provider_order_id?: string;
  provider_payment_id?: string;
}

// ── Internal (demo money) ─────────────────────
const internal = {
  async deposit(amount: number): Promise<ProviderResult> {
    return { success: true, provider: "INTERNAL", reference_id: `INT-${Date.now()}` };
  },
  async withdraw(amount: number): Promise<ProviderResult> {
    return { success: true, provider: "INTERNAL", reference_id: `INT-${Date.now()}` };
  },
};

// ── Razorpay (Phase 2) ────────────────────────
// TODO: npm install razorpay  +  add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env
const razorpay = {
  async deposit(amount: number): Promise<ProviderResult> {
    // const Razorpay = require("razorpay");
    // const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await rz.orders.create({ amount: amount * 100, currency: "INR", receipt: `rcpt_${Date.now()}` });
    // return { success: true, provider: "RAZORPAY", provider_order_id: order.id, reference_id: order.receipt };
    throw new Error("Razorpay not enabled yet");
  },
  async withdraw(amount: number): Promise<ProviderResult> {
    // Razorpay payout via Razorpay X — implement when needed
    throw new Error("Razorpay not enabled yet");
  },
};

function getProvider() {
  return PROVIDER === "RAZORPAY" ? razorpay : internal;
}

export const paymentService = {
  async processDeposit(amount: number): Promise<ProviderResult> {
    return getProvider().deposit(amount);
  },
  async processWithdraw(amount: number): Promise<ProviderResult> {
    return getProvider().withdraw(amount);
  },
};