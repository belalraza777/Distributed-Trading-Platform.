import prisma from "../config/db";
import { paymentService } from "./payment.service";

 
// Find wallet or create one if user is new
async function findOrCreateWallet(userId: number) {
    let wallet = await prisma.wallet.findUnique({ where: { user_id: userId } });
    if (!wallet) {
        wallet = await prisma.wallet.create({ data: { user_id: userId } });
    }
    return wallet;
}

// GET balance
export async function getBalance(userId: number) {
    const wallet = await findOrCreateWallet(userId);
    return { wallet_id: wallet.id, user_id: wallet.user_id, balance: wallet.balance };
}

// POST deposit
export async function deposit(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    const wallet = await findOrCreateWallet(userId);

    // Calls INTERNAL now, RAZORPAY later — no change needed here
    const result = await paymentService.processDeposit(amount);
    if(!result.success) {
        throw new Error("Deposit failed");
    }
    const updated = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
    });

    const transaction = await prisma.walletTransaction.create({
        data: {
            wallet_id: wallet.id,
            type: "DEPOSIT",
            provider: result.provider,
            amount,
            status: "COMPLETED",
            reference_id: result.reference_id ?? null,
            provider_order_id: result.provider_order_id ?? null,
            provider_payment_id: result.provider_payment_id ?? null,
            description: description ?? "Deposit",
        },
    });

    return { balance: updated.balance, transaction };
}

// Internal deposit from RabbitMQ without external payment processing
export async function internalDeposit(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    const wallet = await findOrCreateWallet(userId);

    const updated = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
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

    return { balance: updated.balance, transaction };
}

// POST withdraw
export async function withdraw(userId: number, amount: number, description?: string) {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    const wallet = await findOrCreateWallet(userId);

    if (Number(wallet.balance) < amount) throw new Error("Insufficient balance");

    const result = await paymentService.processWithdraw(amount);

    const updated = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
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

    return { balance: updated.balance, transaction };
}

// GET transactions (paginated)
export async function getTransactions(userId: number, page = 1, limit = 20) {
    const wallet = await findOrCreateWallet(userId);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
        prisma.walletTransaction.findMany({
            where: { wallet_id: wallet.id },
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
        }),
        prisma.walletTransaction.count({ where: { wallet_id: wallet.id } }),
    ]);

    return { transactions, total, page, limit };
}