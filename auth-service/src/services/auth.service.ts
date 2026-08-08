import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { Role } from '@prisma/client/wasm';
import crypto from 'crypto';
import { ApiError } from '../middleware/error.middleware';

// Load JWT secret and Generate token function
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
const accessTokenExpiresIn = '15m';
const refreshTokenExpiresInDays = 7;

const generateAccessToken = (user: {
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
      expiresIn: accessTokenExpiresIn,
    }
  );
};

const generateRefreshToken = async (userId: number) => {
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);

  await prisma.refreshToken.create({
    data: {
      token_hash: hashedToken,
      userId: userId,
      expires_at: expiresAt,
    },
  });

  return refreshToken;
}

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
    throw new ApiError(400,'User already exists');
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
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);
  
  return { user, accessToken, refreshToken };
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
    throw new ApiError(401, 'Invalid email or password');
  }
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);
  
  return {
    accessToken,
    refreshToken,
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
export const logoutUser = async (refreshToken?: string) => {
  if (refreshToken) {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.refreshToken.deleteMany({
      where: { token_hash: hashedToken },
    });
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const existingToken = await prisma.refreshToken.findUnique({
    where: { token_hash: hashedToken },
    include: { user: true },
  });

  if (!existingToken || existingToken.expires_at < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  // Rotate token: invalidate old, create new
  await prisma.refreshToken.delete({
    where: { id: existingToken.id },
  });

  const newAccessToken = generateAccessToken(existingToken.user);
  const newRefreshToken = await generateRefreshToken(existingToken.userId);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}


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
    throw new ApiError(404, 'User not found');
  }
  return user;
};

// GET /:id — called by other services, not by frontend
export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, created_at: true },
  });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
}
