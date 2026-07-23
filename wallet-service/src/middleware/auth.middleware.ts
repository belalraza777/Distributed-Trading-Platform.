import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtUser = {
  id: number;
  role: "USER" | "ADMIN";
};

const jwtSecret = process.env.JWT_SECRET!;

// Authenticate user by validating JWT from cookie or Authorization header
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Support both browser (cookies) and API clients (Bearer token)
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    // Verify JWT and attach user payload to request
    const decoded = jwt.verify(token, jwtSecret) as JwtUser;
    (req as Request & { user: JwtUser }).user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};