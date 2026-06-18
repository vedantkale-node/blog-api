import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  loginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export type PublicUser = Pick<IUser, 'firstName' | 'lastName' | 'username' | '_id'>;
