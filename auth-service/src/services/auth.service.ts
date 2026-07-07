import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
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

  const token = jwt.sign({ id: user.id }, jwtSecret, {
    expiresIn: '1h',
  });

  return { user, token };
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id }, jwtSecret, {
    expiresIn: '1h',
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
    },
  };
};

export const logoutUser = async (token?: string) => {
  if (token) {
    await prisma.blacklistedToken.upsert({
      where: { token },
      update: {},
      create: { token },
    });
  }
};

export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};