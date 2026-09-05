import prisma from "../config/db";
import { publishPaymentNotification } from "../messaging/publisher";

// Handle Razorpay deposit
async function handleDepositWebhook(event: any) {
  const payment = event.payload.payment.entity;

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      provider_order_id: payment.order_id,
      provider: "RAZORPAY",
      type: "DEPOSIT",
    },
  });

  if (!transaction) {
    console.log("Deposit transaction not found");
    return;
  }

  // Ignore duplicate webhook
  if (transaction.status === "COMPLETED") {
    return;
  }

  // Credit wallet and complete transaction atomically
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

  if (!wallet) return;

  await publishPaymentNotification({
    type: "DEPOSIT",
    status: "COMPLETED",
    amount: Number(transaction.amount),
    provider: "RAZORPAY",
    userId: wallet.user_id,
  });
}

// Handle successful payout
async function handlePayoutProcessedWebhook(event: any) {
  const payout = event.payload.payout.entity;

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      provider_payout_id: payout.id,
      provider: "RAZORPAY",
      type: "WITHDRAW",
    },
  });

  if (!transaction) {
    console.log("Withdrawal transaction not found");
    return;
  }

  // Ignore duplicate webhook
  if (transaction.status === "COMPLETED") {
    return;
  }

  if (transaction.status !== "PENDING") {
    return;
  }

  await prisma.walletTransaction.update({
    where: {
      id: transaction.id,
    },
    data: {
      status: "COMPLETED",
    },
  });

  const wallet = await prisma.wallet.findUnique({
    where: {
      id: transaction.wallet_id,
    },
  });

  if (!wallet) return;

  await publishPaymentNotification({
    type: "WITHDRAW",
    status: "COMPLETED",
    amount: Number(transaction.amount),
    provider: "RAZORPAY",
    userId: wallet.user_id,
  });
}

// Handle reversed payout
async function handlePayoutReversedWebhook(event: any) {
  const payout = event.payload.payout.entity;

  const transaction = await prisma.walletTransaction.findFirst({
    where: {
      provider_payout_id: payout.id,
      provider: "RAZORPAY",
      type: "WITHDRAW",
    },
  });

  if (!transaction) {
    console.log("Withdrawal transaction not found");
    return;
  }

  // Ignore duplicate webhook
  if (transaction.status === "FAILED") {
    return;
  }

  // Already completed but later reversed -> refund
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
        status: "FAILED",
      },
    });
  });

  const wallet = await prisma.wallet.findUnique({
    where: {
      id: transaction.wallet_id,
    },
  });

  if (!wallet) return;

  await publishPaymentNotification({
    type: "WITHDRAW",
    status: "FAILED",
    amount: Number(transaction.amount),
    provider: "RAZORPAY",
    userId: wallet.user_id,
  });
}

// Main webhook dispatcher
export async function handleWebhook(event: any) {
  switch (event.event) {
    // Razorpay Payments
    case "payment.captured":
      return handleDepositWebhook(event);

    // RazorpayX Payouts
    case "payout.processed":
      return handlePayoutProcessedWebhook(event);

    case "payout.reversed":
      return handlePayoutReversedWebhook(event);

    default:
      console.log(`Ignoring webhook event: ${event.event}`);
      return;
  }
}