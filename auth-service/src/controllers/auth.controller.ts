import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../types/auth.types';

const jwtSecret = process.env.JWT_SECRET || 'change-me';

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });

  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });

  return res.status(201).json({ token, user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.token;

  if (token) {
    await prisma.blacklistedToken.upsert({
      where: { token },
      update: {},
      create: { token },
    });
  }

  res.clearCookie('token');
  return res.json({ message: 'User logged out successfully' });
};

export const profile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.status(200).json(user);
};
