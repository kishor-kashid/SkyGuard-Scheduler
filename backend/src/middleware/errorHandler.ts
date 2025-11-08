import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // If it's an operational error (AppError), use its status code
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message, // Also include at top level for easier frontend access
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  // Log unexpected errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Return generic error for non-operational errors
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  return res.status(500).json({
    success: false,
    message, // Also include at top level for easier frontend access
    error: {
      message,
      statusCode: 500,
    },
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
    },
  });
}

