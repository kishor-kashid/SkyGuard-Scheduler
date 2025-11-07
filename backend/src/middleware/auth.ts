import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../services/authService';
import { JWTPayload, UserRole, AppError } from '../types';
import prisma from '../config/database';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    
    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Attach user payload to request
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError('Invalid or expired token', 401));
  }
}

/**
 * Middleware to authorize based on user roles
 */
export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = [authenticateToken, authorizeRoles(UserRole.ADMIN)];

/**
 * Middleware to check if user is instructor or admin
 */
export const requireInstructorOrAdmin = [
  authenticateToken,
  authorizeRoles(UserRole.INSTRUCTOR, UserRole.ADMIN),
];

/**
 * Middleware to check if user is student, instructor, or admin
 */
export const requireAuthenticated = [authenticateToken];

