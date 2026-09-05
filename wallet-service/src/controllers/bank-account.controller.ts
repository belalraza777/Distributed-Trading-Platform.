import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import * as bankAccountService from "../services/bank-account.service";

// POST /api/v1/wallet/bank-account
export const createBankAccount = async (
    req: AuthRequest,
    res: Response
) => {

    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Invalid request body",
        });
    }

    const data = await bankAccountService.createBankAccount(
        req.user.id,
        {
            name: req.user.name || req.body.account_holder,
            email: req.user.email || "",
            phone: req.user.phone || "",
        },
        req.body
    );

    res.status(201).json({
        success: true,
        message: "Bank account added successfully",
        data,
    });
};

// GET /api/v1/wallet/bank-account
export const getBankAccount = async (
    req: AuthRequest,
    res: Response
) => {
    const data = await bankAccountService.getBankAccount(
        req.user.id
    );

    res.json({
        success: true,
        data,
        message: data ? "Bank account retrieved successfully" : "No bank account found",
    });
};

// PUT /api/v1/wallet/bank-account
export const updateBankAccount = async (
    req: AuthRequest,
    res: Response
) => {
    const data = await bankAccountService.updateBankAccount(
        req.user.id,
        req.body
    );

    res.json({
        success: true,
        message: "Bank account updated successfully",
        data,
    });
};

// DELETE /api/v1/wallet/bank-account
export const deleteBankAccount = async (
    req: AuthRequest,
    res: Response
) => {
    const data = await bankAccountService.deleteBankAccount(
        req.user.id
    );

    res.json({
        success: true,
        ...data,
    });
};