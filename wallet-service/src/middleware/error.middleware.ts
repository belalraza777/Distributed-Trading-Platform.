import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = (err as { statusCode?: number }).statusCode ?? (err instanceof Error ? 400 : 500);
  const message = err instanceof Error ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err instanceof Error ? err.stack : undefined,
  });
};