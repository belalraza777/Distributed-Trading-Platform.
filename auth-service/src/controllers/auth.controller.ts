import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  getUserById,
} from '../services/auth.service';

// POST /register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: 'name, email, phone and password are required' });
    }

    const { user, token } = await registerUser(name, email, phone, password);
    if (!user || !token) {
      return res.status(400).json({ message: 'User registration failed' });
    }

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message,
    });
  }
};

//post /login
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

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 ,});

    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message,
    });
  }
};

// POST /logout
export const logout = async (req: Request, res: Response) => {
  await logoutUser(req.cookies?.token);

  res.clearCookie('token');

  return res.json({
    message: 'User logged out successfully',
  });
};

// GET /profile
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

// GET /:id — called by other services, not by frontend
export const getUser = async (req: Request, res: Response) => {
  const {id} = req.params;
  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  const user = await getUserById(Number(id));
  res.status(200).json({ success: true, data: user });
};