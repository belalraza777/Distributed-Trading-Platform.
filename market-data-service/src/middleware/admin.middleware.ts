import { NextFunction, Request, Response } from "express";

type AuthRequest = Request & {
  user?: {
    id: number;
    role: "USER" | "ADMIN";
  };
};

// Allow access only to ADMIN users
export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Ensure the authenticated user has admin privileges
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};