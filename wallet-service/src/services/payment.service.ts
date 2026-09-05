
import Razorpay from "razorpay"
import axios from "axios"
import crypto from "crypto"
import { ApiError } from "../middleware/error.middleware"

const PROVIDER = process.env.PAYMENT_PROVIDER || "INTERNAL"

interface ProviderResult {
  success: boolean
  provider: "INTERNAL" | "RAZORPAY"
  reference_id?: string
  provider_order_id?: string
  provider_payment_id?: string
  amount?: number | string
  currency?: string
  key?: string
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// ── RAZORPAYX CONFIG ────────────────────────────────────────────────────────

const razorpayXHeaders = {
  Authorization:
    "Basic " +
    Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64"),
  "Content-Type": "application/json",
}

const RAZORPAYX_URL = "https://api.razorpay.com/v1"

// ── INTERNAL ────────────────────────────────────────────────────────────────

const internal = {
  async deposit(amount: number): Promise<ProviderResult> {
    return {
      success: true,
      provider: "INTERNAL",
      reference_id: `INT-${Date.now()}`,
    }
  },
}

// ── RAZORPAY ────────────────────────────────────────────────────────────────

const razorpay = {
  // Create Razorpay order for deposit
  async createOrder(amount: number): Promise<ProviderResult> {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `wallet_${Date.now()}`,
    })

    return {
      success: true,
      provider: "RAZORPAY",
      provider_order_id: order.id,
      reference_id: order.receipt ?? undefined,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    }
  },

  // ── RAZORPAYX CONTACT ────────────────────────────────────────────────────
 // Create contact for bank account setup
  async createContact(data: {
    name: string
    email: string
    phone: string
  }): Promise<string> {
    const res = await axios.post(
      `${RAZORPAYX_URL}/contacts`,
      {
        name: data.name,
        email: data.email,
        contact: data.phone,
        type: "customer",
      },
      {
        headers: razorpayXHeaders,
      }
    )

    return res.data.id
  },

  // ── RAZORPAYX FUND ACCOUNT ──────────────────────────────────────────────
 // Create fund account for bank account setup
  async createFundAccount(data: {
    contactId: string
    accountHolder: string
    accountNumber: string
    ifscCode: string
  }): Promise<string> {
    const res = await axios.post(
      `${RAZORPAYX_URL}/fund_accounts`,
      {
        contact_id: data.contactId,
        account_type: "bank_account",
        bank_account: {
          name: data.accountHolder,
          ifsc: data.ifscCode,
          account_number: data.accountNumber,
        },
      },
      {
        headers: razorpayXHeaders,
      }
    )

    return res.data.id
  },

  // ── RAZORPAYX PAYOUT ────────────────────────────────────────────────────
 // Create payout for fund account 
  async createPayout(data: {
    fundAccountId: string
    amount: number
    referenceId: string
  }): Promise<string> {
    const accountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER

    if (!accountNumber || accountNumber.trim() === "not set yet") {
      throw new Error("RAZORPAY_ACCOUNT_NUMBER is not configured")
    }

    const res = await axios.post(
      `${RAZORPAYX_URL}/payouts`,
      {
        account_number: accountNumber,
        fund_account_id: data.fundAccountId,
        amount: data.amount * 100,
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        reference_id: data.referenceId,
        narration: "TradePro Withdrawal",
      },
      {
        headers: razorpayXHeaders,
      }
    )

    return res.data.id
  },

  // ── SETUP BANK ACCOUNT ──────────────────────────────────────────────────
  // Create Contact + Fund Account 
  async setupBankAccount(data: {
    name: string
    email: string
    phone: string
    accountHolder: string
    accountNumber: string
    ifscCode: string
  }): Promise<{
    contactId: string
    fundAccountId: string
  }> {
    const contactId = await this.createContact({
      name: data.name,
      email: data.email,
      phone: data.phone,
    })

    const fundAccountId = await this.createFundAccount({
      contactId,
      accountHolder: data.accountHolder,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
    })

    return {
      contactId,
      fundAccountId,
    }
  },

  // ── VERIFY PAYMENT ──────────────────────────────────────────────────────

  verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): boolean {
    const generated = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET!
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex")

    return generated === razorpay_signature
  },

  // ── VERIFY WEBHOOK ───────────────────────────────────────────────────────

  verifyWebhook(
    body: Buffer,
    signature: string
  ): boolean {
    const generated = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET!
      )
      .update(body)
      .digest("hex")

    return generated === signature
  },
}

// ── EXPORT ───────────────────────────────────────────────────────────────────

export const paymentService = {
  // Create deposit order
  // INTERNAL returns reference
  // RAZORPAY returns order

  async createDepositOrder(
    amount: number
  ): Promise<ProviderResult> {
    if (PROVIDER === "RAZORPAY") {
      return razorpay.createOrder(amount)
    }

    return internal.deposit(amount)
  },

  // ── SETUP RAZORPAY BANK ACCOUNT ──────────────────────────────────────────

  async setupBankAccount(data: {
    name: string
    email: string
    phone: string
    accountHolder: string
    accountNumber: string
    ifscCode: string
  }): Promise<{
    contactId: string
    fundAccountId: string
  }> {
    if (PROVIDER !== "RAZORPAY") {
      return {
        contactId: "",
        fundAccountId: "",
      }
    }

    return razorpay.setupBankAccount(data)
  },

  async createFundAccount(data: {
    contactId: string
    accountHolder: string
    accountNumber: string
    ifscCode: string
  }): Promise<string> {
    if (PROVIDER !== "RAZORPAY") {
      return ""
    }

    return razorpay.createFundAccount(data)
  },

  // ── CREATE RAZORPAYX PAYOUT ─────────────────────────────────────────────

  async createPayout(data: {
    fundAccountId: string
    amount: number
    referenceId: string
  }): Promise<string> {
    if (PROVIDER !== "RAZORPAY") {
      return ""
    }

    return razorpay.createPayout(data)
  },

  // Verify Razorpay payment signature
  // Always true for INTERNAL

  verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
  ): boolean {
    if (PROVIDER !== "RAZORPAY") {
      return true
    }

    return razorpay.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )
  },

  // Verify Razorpay webhook signature
  // Always true for INTERNAL

  verifyWebhook(
    body: Buffer,
    signature: string
  ): boolean {
    if (PROVIDER !== "RAZORPAY") {
      return true
    }

    return razorpay.verifyWebhook(
      body,
      signature
    )
  },
}

