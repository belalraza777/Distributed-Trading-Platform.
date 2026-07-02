import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

type JwtUser = {
  id: number;
};

const jwtSecret = process.env.JWT_SECRET || 'change-me';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtUser;
    (req as Request & { user?: JwtUser }).user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
