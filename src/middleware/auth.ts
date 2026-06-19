import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.session?.userID) {
    return next(new AppError('Authentication required', 401));
  }
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.session?.userID) {
    return next(new AppError('Authentication required', 401));
  }
  if (req.session.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};
