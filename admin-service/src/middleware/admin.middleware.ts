import { NextFunction, Request, Response } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as Request & { user?: { role?: string } }).user;

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};