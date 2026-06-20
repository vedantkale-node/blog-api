import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/Users.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from '../validators/user.validator.js';

const publicUserProjection = {
  firstName: 1,
  lastName: 1,
  username: 1,
};

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find({}, publicUserProjection).lean();

  if (users.length === 0) {
    throw new AppError('No users found', 404);
  }

  sendSuccess({ res, data: users });
});

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerUserSchema.parse(req.body);

  const user = await User.create(payload);

  sendSuccess({
    res,
    statusCode: 201,
    message: `User ${user.username} has been created`,
    data: {
      id: user._id,
      username: user.username,
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid user ID', 400);
  }

  const user = await User.findById(id, publicUserProjection).lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess({ res, data: user });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = updateUserSchema.parse(req.body);

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid user ID', 400);
  }

  if (req.session.role !== 'admin' && req.session.userID !== id) {
    throw new AppError('You do not have permission to update this user', 403);
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
    projection: publicUserProjection,
  }).lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess({
    res,
    message: 'User updated successfully',
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid user ID', 400);
  }

  if (req.session.role !== 'admin' && req.session.userID !== id) {
    throw new AppError('You do not have permission to delete this user', 403);
  }

  const deletedUser = await User.findByIdAndDelete(id);

  if (!deletedUser) {
    throw new AppError('User not found', 404);
  }

  if (req.session.userID === id) {
    return new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          reject(new AppError('User deleted, but logout failed', 500));
          return;
        }
        sendSuccess({ res, message: 'User deleted and session cleared' });
        resolve();
      });
    });
  }

  sendSuccess({ res, message: 'User deleted successfully' });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = loginUserSchema.parse(req.body);

  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    throw new AppError('Invalid username or password', 401);
  }

  if (user.loginAttempts >= 10) {
    throw new AppError(
      'Account locked after too many failed attempts. Contact support.',
      423
    );
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    user.loginAttempts += 1;
    await user.save();
    throw new AppError('Invalid username or password', 401);
  }

  user.loginAttempts = 0;
  await user.save();

  req.session.userID = user._id.toString();
  req.session.role = user.role;
  req.session.user = user.username;
  req.session.fullName = `${user.firstName} ${user.lastName}`;

  sendSuccess({
    res,
    message: `Logged in successfully. Hello ${user.username}`,
    data: {
      username: user.username,
      role: user.role,
    },
  });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  return new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        reject(new AppError('Unable to log out', 500));
        return;
      }
      sendSuccess({ res, message: 'Logged out successfully' });
      resolve();
    });
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.session.userID, publicUserProjection).lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess({
    res,
    data: {
      ...user,
      role: req.session.role,
    },
  });
});
