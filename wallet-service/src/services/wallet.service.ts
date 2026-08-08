import prisma from "../config/db";
import { paymentService } from "./payment.service";
import { publishPaymentNotification } from "../messaging/publisher";
import { ApiError } from "../middleware/error.middleware";

//Helper function to find or create a wallet for a user
async function findOrCreateWallet(userId: number) {
  let wallet = await prisma.wallet.findUnique({
    where: { user_id: userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { user_id: userId },
    });
  }

  return wallet;
}

// _____GET BALANCE_____
export async function getBalance(userId: number) {
  const wallet = await findOrCreateWallet(userId);

  return {
    wallet_id: wallet.id,
    user_id: wallet.user_id,
    balance: wallet.balance,
  };
}

// ____DEPOSIT_____
export async function deposit(
  userId: number,
  amount: number,
  description?: string
) {
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const wallet = await findOrCreateWallet(userId);

  const result = await paymentService.createDepositOrder(amount);

  // INTERNAL provider
  if (result.provider === "INTERNAL") {
    const updated = await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const transaction = await prisma.walletTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: "DEPOSIT",
        provider: "INTERNAL",
        amount,
        status: "COMPLETED",
        reference_id: result.reference_id ?? null,
        description: description ?? "Deposit",
      },
    });

    await publishPaymentNotification({
      type: "DEPOSIT",
      status: "COMPLETED",
      amount,
      provider: "INTERNAL",
      userId,
    });

    return {
      balance: updated.balance,
      transaction,
    };
  }

  // Razorpay provider
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
  });

  return {
    transaction,
    order: {
      orderId: result.provider_order_id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: result.amount,
      currency: result.currency,
    },
  };
}

// ____VERIFY PAYMENT_____
export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  const verified = paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!verified) {
    throw new ApiError(400, "Payment verification failed");
  }

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      provider_order_id: razorpay_order_id,
      provider: "RAZORPAY",
    },
  });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  await prisma.walletTransaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      provider_payment_id: razorpay_payment_id,
    },
  });

  return {
    success: true,
    message: "Payment verified successfully. Waiting for webhook.",
  };
}

// ____HANDLE WEBHOOK for Razorpay_____
export async function handleWebhook(event: any) {
  // Ignore other events
  if (event.event !== "payment.captured") {
    return;
  }

  const payment = event.payload.payment.entity;

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      provider_order_id: payment.order_id,
      provider: "RAZORPAY",
    },
  });

  if (!transaction) {
    console.log("Transaction not found");
    return;
  }

  // Webhook retry protection
  if (transaction.status === "COMPLETED") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: {
        id: transaction.wallet_id,
      },
      data: {
        balance: {
          increment: transaction.amount,
        },
      },
    });

    await tx.walletTransaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: "COMPLETED",
        provider_payment_id: payment.id,
      },
    });
  });

  const wallet = await prisma.wallet.findUnique({
    where: {
      id: transaction.wallet_id,
    },
  });

  if (wallet) {
    await publishPaymentNotification({
      type: "DEPOSIT",
      status: "COMPLETED",
      amount: Number(transaction.amount),
      provider: "RAZORPAY",
      userId: wallet.user_id,
    });
  }

}

// ____INTERNAL DEPOSIT____ (RabbitMQ / Admin / Testing)
export async function internalDeposit(
  userId: number,
  amount: number,
  description?: string
) {
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const wallet = await findOrCreateWallet(userId);

  const updated = await prisma.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  const transaction = await prisma.walletTransaction.create({
    data: {
      wallet_id: wallet.id,
      type: "DEPOSIT",
      provider: "INTERNAL",
      amount,
      status: "COMPLETED",
      description: description ?? "Internal Deposit",
    },
  });

  return {
    balance: updated.balance,
    transaction,
  };
}

// ____WITHDRAW_____
export async function withdraw(
  userId: number,
  amount: number,
  description?: string
) {
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const wallet = await findOrCreateWallet(userId);

  if (Number(wallet.balance) < amount) {
    throw new ApiError(400, "Insufficient balance");
  }

  const result = await paymentService.processWithdraw(amount);

  if (!result.success) {
    throw new ApiError(500, "Withdrawal failed");
  }

  const updated = await prisma.wallet.update({
    where: {
      id: wallet.id,
    },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  const transaction = await prisma.walletTransaction.create({
    data: {
      wallet_id: wallet.id,
      type: "WITHDRAW",
      provider: result.provider,
      amount,
      status: "COMPLETED",
      reference_id: result.reference_id ?? null,
      provider_order_id: result.provider_order_id ?? null,
      provider_payment_id: result.provider_payment_id ?? null,
      description: description ?? "Withdrawal",
    },
  });

  await publishPaymentNotification({
    type: "WITHDRAW",
    status: "COMPLETED",
    amount,
    provider: result.provider,
    userId,
  });

  return {
    balance: updated.balance,
    transaction,
  };
}

// ____GET TRANSACTIONS_____ [with pagination]
export async function getTransactions(
  userId: number,
  page = 1,
  limit = 20
) {
  const wallet = await findOrCreateWallet(userId);

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: {
        wallet_id: wallet.id,
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.walletTransaction.count({
      where: {
        wallet_id: wallet.id,
      },
    }),
  ]);

  return {
    transactions,
    total,
    page,
    limit,
  };
}