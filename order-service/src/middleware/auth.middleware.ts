import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

type JwtUser = {
  id: number;
};

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

// check both Authorization header and cookies for token
const extractToken = (req: Request) => {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  return cookieToken || bearerToken || null;
};

// create middleware that checks for token and verifies it, but allows certain public paths to bypass auth
export const createRequireAuth = (publicPaths: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (publicPaths.includes(req.path)) {
        return next();
      }

      const token = extractToken(req);

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Verify token and attach user info to request
      const decoded = jwt.verify(token, jwtSecret) as JwtUser;
      (req as Request & { user?: JwtUser }).user = { id: decoded.id };
      (req as Request & { token?: string }).token = token;

      return next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

export const requireAuth = createRequireAuth();
