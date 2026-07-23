import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { Role } from '@prisma/client/wasm';

// Load JWT secret and Generate token function
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';

const generateToken = (user: {
  id: number;
  email: string;
  role: "USER" | "ADMIN";
}) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "72h",
    }
  );
};

// POST /register
export const registerUser = async (
  name: string,
  email: string,
  phone: string,
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
      phone,
      password_hash: passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      created_at: true,
    },
  });
  const token = generateToken(user);
  return { user, token };
};

// POST /login
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
  const token = generateToken(user);
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      created_at: user.created_at,
    },
  };
};

// POST /logout
export const logoutUser = async (token?: string) => {
  if (token) {
    await prisma.blacklistedToken.upsert({
      where: { token },
      update: {},
      create: { token },
    });
  }
};

// GET /profile 
export const getProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      created_at: true,
    },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// GET /:id — called by other services, not by frontend
export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, created_at: true },
  });
  if (!user) throw new Error('User not found');
  return user;
}
