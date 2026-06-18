import { Response } from 'express';

interface ApiSuccessOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message,
  data,
}: ApiSuccessOptions<T>) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};
