import { Document, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  author: string;
  role: 'user' | 'admin';
  createdTime: Date;
  userId: Types.ObjectId;
  editedAt: Date;
}

export interface IPost extends Document {
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
  views: number;
  likes: number;
  likedBy: Types.ObjectId[];
  comments: Types.DocumentArray<IComment>;
}
