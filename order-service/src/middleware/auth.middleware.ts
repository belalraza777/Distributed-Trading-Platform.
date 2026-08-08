import { NextFunction, Request, Response } from "express";
import {AuthRequest} from "../types/auth.types";
import jwt from "jsonwebtoken";

type JwtUser = {
  id: number;
  role: "USER" | "ADMIN";
};

const jwtSecret = process.env.JWT_SECRET!;

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ||
    req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  (req as AuthRequest).token = token;

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtUser;

    (req as AuthRequest).user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};