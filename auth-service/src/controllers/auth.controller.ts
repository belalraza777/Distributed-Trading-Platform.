import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  getUserById,
  refreshAccessToken,
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

    const { user, accessToken, refreshToken } = await registerUser(name, email, phone, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({ accessToken, user });
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

    const { accessToken, refreshToken, user } = await loginUser(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ accessToken, user });
  } catch (error) {
    return res.status(400).json({
      message: (error as Error).message,
    });
  }
};

// POST /logout
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  await logoutUser(refreshToken);

  res.clearCookie('refreshToken');

  return res.json({
    message: 'User logged out successfully',
  });
};

// POST /refresh
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: oldRefreshToken } = req.cookies as { refreshToken?: string };

  if (!oldRefreshToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(oldRefreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 20 * 24 * 60 * 60 * 1000, // 20 days
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: (error as Error).message });
  }
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