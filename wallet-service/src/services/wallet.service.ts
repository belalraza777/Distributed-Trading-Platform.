import prisma from "../config/db";
import { paymentService } from "./payment.service";
import { publishPaymentNotification } from "../messaging/publisher";
import { ApiError } from "../middleware/error.middleware";

// read once — avoids repeated process.env access throughout the file
const PROVIDER = process.env.PAYMENT_PROVIDER || "INTERNAL"
const IS_RAZORPAY = PROVIDER === "RAZORPAY"

// helper — find or create wallet for a user
async function findOrCreateWallet(userId: number) {
  let wallet = await prisma.wallet.findUnique({ where: { user_id: userId } })
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { user_id: userId } })
  }
  return wallet
}

// GET BALANCE
export async function getBalance(userId: number) {
  const wallet = await findOrCreateWallet(userId)
  return {
    wallet_id: wallet.id,
    user_id: wallet.user_id,
    balance: wallet.balance,
  }
}

// DEPOSIT
export async function deposit(userId: number, amount: number, description?: string) {
  if (amount <= 0) throw new ApiError(400, "Amount must be greater than 0")

  const wallet = await findOrCreateWallet(userId)
  const result = await paymentService.createDepositOrder(amount)

  // INTERNAL — credit immediately
  if (result.provider === "INTERNAL") {
    const { updated, transaction } = await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      })
      const transaction = await tx.walletTransaction.create({
        data: {
          wallet_id: wallet.id,
          type: "DEPOSIT",
          provider: "INTERNAL",
          amount,
          status: "COMPLETED",
          reference_id: result.reference_id ?? null,
          description: description ?? "Deposit",
        },
      })
      return { updated, transaction }
    })

    await publishPaymentNotification({
      type: "DEPOSIT", status: "COMPLETED", amount, provider: "INTERNAL", userId,
    })

    return { balance: updated.balance, transaction }
  }

  // RAZORPAY — create pending transaction, wait for webhook
  const transaction = await prisma.walletTransaction.create({
    data: {
      wallet_id: wallet.id,
      type: "DEPOSIT",
      provider: "RAZORPAY",
      amount,
      status: "PENDING",
      provider_order_id: result.provider_order_id!,
      reference_id: result.reference_id!,
      description: description ?? "Wallet Deposit",
    },
  })

  return {
    transaction,
    order: {
      orderId: result.provider_order_id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: result.amount,
      currency: result.currency,
    },
  }
}

// VERIFY PAYMENT
export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  const verified = paymentService.verifyPayment(
    razorpay_order_id, razorpay_payment_id, razorpay_signature
  )
  if (!verified) throw new ApiError(400, "Payment verification failed")

  const transaction = await prisma.walletTransaction.findFirst({
    where: { provider_order_id: razorpay_order_id, provider: "RAZORPAY" },
  })
  if (!transaction) throw new ApiError(404, "Transaction not found")

  await prisma.walletTransaction.update({
    where: { id: transaction.id },
    data: { provider_payment_id: razorpay_payment_id },
  })

  return { success: true, message: "Payment verified. Waiting for webhook." }
}

// INTERNAL DEPOSIT — RabbitMQ / order refunds / admin
export async function internalDeposit(userId: number, amount: number, description?: string) {
  if (amount <= 0) throw new ApiError(400, "Amount must be greater than 0")

  const wallet = await findOrCreateWallet(userId)

  const { updated, transaction } = await prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    })
    const transaction = await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: "DEPOSIT",
        provider: "INTERNAL",
        amount,
        status: "COMPLETED",
        description: description ?? "Internal Deposit",
      },
    })
    return { updated, transaction }
  })

  return { balance: updated.balance, transaction }
}

// WITHDRAW
// INTERNAL  → deducts balance + COMPLETED immediately
// RAZORPAY  → deducts balance + PENDING → webhook confirms later

export async function withdraw(userId: number, amount: number, description?: string) {
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0")
  }

  const wallet = await findOrCreateWallet(userId)

  if (Number(wallet.balance) < amount) {
    throw new ApiError(400, "Insufficient balance")
  }

  // Bank account required for Razorpay payouts
  let fundAccountId: string | null = null

  if (IS_RAZORPAY) {
    const razorpayAccountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER?.trim()

    if (!razorpayAccountNumber || razorpayAccountNumber === "not set yet") {
      throw new ApiError(
        503,
        "RazorpayX payout account is not configured"
      )
    }

    const bankAccount = await prisma.bankAccount.findUnique({
      where: { user_id: userId },
    })

    if (!bankAccount) {
      throw new ApiError(400, "Please add a bank account before withdrawing")
    }

    if (!bankAccount.razorpay_fund_account_id) {
      throw new ApiError(400, "Bank account is not ready for withdrawal")
    }

    fundAccountId = bankAccount.razorpay_fund_account_id
  }

  // Deduct balance + create transaction
  const { updated, transaction } = await prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
      },
    })

    const transaction = await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: "WITHDRAW",
        provider: IS_RAZORPAY ? "RAZORPAY" : "INTERNAL",
        amount,
        status: IS_RAZORPAY ? "PENDING" : "COMPLETED",
        description: description ?? "Withdrawal",
      },
    })

    return { updated, transaction }
  })

  // RazorpayX payout
  if (IS_RAZORPAY && fundAccountId) {
    try {
      const payoutId = await paymentService.createPayout({
        fundAccountId,
        amount,
        referenceId: `WALLET-${transaction.id}`,
      })

      const updatedTransaction = await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          provider_payout_id: payoutId,
        },
      })

      return {
        balance: updated.balance,
        transaction: updatedTransaction,
      }
    } catch (error) {
      // Refund wallet if RazorpayX payout creation fails
      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
          },
        }),

        prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: {
            status: "FAILED",
          },
        }),
      ])

      throw new ApiError(500, "Unable to process withdrawal")
    }
  }

  // INTERNAL withdrawal
  await publishPaymentNotification({
    type: "WITHDRAW",
    status: "COMPLETED",
    amount,
    provider: "INTERNAL",
    userId,
  })

  return {
    balance: updated.balance,
    transaction,
  }
}


// INTERNAL WITHDRAW — used by order-service to lock funds for BUY orders
export async function internalWithdraw(userId: number, amount: number) {
  if (amount <= 0) throw new ApiError(400, "Amount must be greater than 0")

  const wallet = await findOrCreateWallet(userId)

  if (Number(wallet.balance) < amount) throw new ApiError(400, "Insufficient balance")

  const { updated, transaction } = await prisma.$transaction(async (tx) => {
    const updated = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    })
    const transaction = await tx.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: "WITHDRAW",
        provider: "INTERNAL",
        amount,
        status: "COMPLETED",
        description: "Internal Withdrawal - Order Fund Lock",
      },
    })
    return { updated, transaction }
  })

  return { balance: updated.balance, transaction }
}

// GET TRANSACTIONS — paginated
export async function getTransactions(userId: number, page = 1, limit = 20) {
  const wallet = await findOrCreateWallet(userId)
  const skip = (page - 1) * limit

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { wallet_id: wallet.id },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.walletTransaction.count({ where: { wallet_id: wallet.id } }),
  ])

  return { transactions, total, page, limit }
}