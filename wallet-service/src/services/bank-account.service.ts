import prisma from "../config/db";
import { ApiError } from "../middleware/error.middleware";
import { paymentService } from "./payment.service";

// Create bank account
export async function createBankAccount(
  userId: number,
  userDetails: {
    name: string;
    email: string;
    phone: string;
  },
  data: {
    account_holder: string;
    account_number: string;
    ifsc_code: string;
    bank_name?: string;
  }
) {
  const existingAccount = await prisma.bankAccount.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (existingAccount) {
    throw new ApiError(
      400,
      "Bank account already exists. Please update the existing account or Delete it before creating a new one."
    );
  }

  let razorpayContactId: string | null = null;
  let razorpayFundAccountId: string | null = null;

  if (process.env.PAYMENT_PROVIDER === "RAZORPAY") {
    const razorpayAccount = await paymentService.setupBankAccount({
      name: userDetails?.name,
      email: userDetails?.email,
      phone: userDetails?.phone,
      accountHolder: data.account_holder,
      accountNumber: data.account_number,
      ifscCode: data.ifsc_code,
    });

    razorpayContactId = razorpayAccount.contactId;
    razorpayFundAccountId = razorpayAccount.fundAccountId;
  }

  const bankAccount = await prisma.bankAccount.create({
    data: {
      user_id: userId,
      account_holder: data.account_holder,
      account_number: data.account_number,
      ifsc_code: data.ifsc_code,
      bank_name: data.bank_name || null,
      razorpay_contact_id: razorpayContactId,
      razorpay_fund_account_id: razorpayFundAccountId,
    },
  });

  return formatBankAccount(bankAccount);
}

// Get user's bank account
export async function getBankAccount(userId: number) {
  const bankAccount = await prisma.bankAccount.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!bankAccount) {
    throw new ApiError(
      404,
      "Bank account not found. Please Add a bank account first."
    );
  }

  return formatBankAccount(bankAccount);
}

// Update bank account
export async function updateBankAccount(
  userId: number,
  data: {
    account_holder: string;
    account_number: string;
    ifsc_code: string;
    bank_name?: string;
  }
) {
  const existingAccount = await prisma.bankAccount.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!existingAccount) {
    throw new ApiError(
      404,
      "Bank account not found. Please Add a bank account first."
    );
  }

  let razorpayFundAccountId = existingAccount.razorpay_fund_account_id;

  if (process.env.PAYMENT_PROVIDER === "RAZORPAY") {
    if (!existingAccount.razorpay_contact_id) {
      throw new ApiError(
        400,
        "Razorpay Contact not found. Please recreate the bank account."
      );
    }
    // Update fund account in Razorpay
    razorpayFundAccountId = await paymentService.createFundAccount({
      contactId: existingAccount.razorpay_contact_id,
      accountHolder: data.account_holder,
      accountNumber: data.account_number,
      ifscCode: data.ifsc_code,
    });
  }

  const bankAccount = await prisma.bankAccount.update({
    where: {
      user_id: userId,
    },
    data: {
      account_holder: data.account_holder,
      account_number: data.account_number,
      ifsc_code: data.ifsc_code,
      bank_name: data.bank_name || null,
      razorpay_fund_account_id: razorpayFundAccountId,
    },
  });

  return formatBankAccount(bankAccount);
}

// Delete bank account

export async function deleteBankAccount(userId: number) {
  const existingAccount = await prisma.bankAccount.findUnique({
    where: {
      user_id: userId,
    },
  });

  if (!existingAccount) {
    throw new ApiError(
      404,
      "Bank account not found. Please Add a bank account first."
    );
  }

  await prisma.bankAccount.delete({
    where: {
      user_id: userId,
    },
  });

  return {
    message: "Bank account deleted successfully",
  };
}

// Hide sensitive account number

function formatBankAccount(bankAccount: any) {
  return {
    id: bankAccount.id,
    account_holder: bankAccount.account_holder,
    account_number: maskAccountNumber(bankAccount.account_number),
    ifsc_code: bankAccount.ifsc_code,
    bank_name: bankAccount.bank_name,
    created_at: bankAccount.created_at,
    updated_at: bankAccount.updated_at,
  };
}

function maskAccountNumber(accountNumber: string) {
  return `******${accountNumber.slice(-4)}`;
}
