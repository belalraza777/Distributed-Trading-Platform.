import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

// Custom error class to represent API errors
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Middleware to handle 404 Not Found errors
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(
    new ApiError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

// Middleware to handle errors and send appropriate responses
export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  const isApiError = err instanceof ApiError;

  const statusCode = isApiError ? err.statusCode : 500;

  const message = isApiError
    ? err.message
    : "Internal server error";

  // Log actual error on server
  console.error("ERROR:", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err instanceof Error ? err.message : err,
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" &&
      err instanceof Error && {
        stack: err.stack,
      }),
  });
};