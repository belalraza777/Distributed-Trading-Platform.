import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import redisClient from '../config/redis';

type JwtUser = {
  id: number;
};

export const checkBannedUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const user = jwt.verify(token, jwtSecret) as JwtUser;
    const isBanned = await redisClient.exists(`banned:${user.id}`);

    if (isBanned) {
      return res.status(403).json({ message: 'User is banned' });
    }

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next();
    }

    return next(error);
  }
};
