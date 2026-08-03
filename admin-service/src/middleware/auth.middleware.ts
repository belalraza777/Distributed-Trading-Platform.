import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtUser = {
  id: number;
  role: "USER" | "ADMIN";
};

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

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, jwtSecret) as JwtUser;
    (req as Request & { user: JwtUser }).user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
