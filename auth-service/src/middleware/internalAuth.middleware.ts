import { Request, Response, NextFunction } from 'express';

const INTERNAL_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'internal-secret';

// blocks any request that doesn't carry the correct internal secret
export function internalAuth(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-internal-secret'] !== INTERNAL_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
}