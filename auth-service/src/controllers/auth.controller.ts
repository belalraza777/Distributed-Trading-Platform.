import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
} from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'name, email and password are required' });
    }

    const { user, token } = await registerUser(name, email, password);
    if (!user || !token) {
      return res.status(400).json({ message: 'User registration failed' });
    }

    res.cookie('token', token, { httpOnly: true });

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'email and password are required' });
    }

    const { token, user } = await loginUser(email, password);
    if (!user || !token) {
      return res.status(400).json({ message: 'User login failed' });
    }

    res.cookie('token', token, { httpOnly: true });

    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  await logoutUser(req.cookies?.token);

  res.clearCookie('token');

  return res.json({
    message: 'User logged out successfully',
  });
};

export const profile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getProfile(req.user.id);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(404).json({
      message: (error as Error).message,
    });
  }
};