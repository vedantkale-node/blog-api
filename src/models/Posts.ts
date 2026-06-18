import { Schema, model } from 'mongoose';
import { IPost } from '../interfaces/PostInterface.js';

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    author: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    editedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'createdTime', updatedAt: false },
  }
);

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    publishedAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

postSchema.index({ isPublished: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

const Post = model<IPost>('Post', postSchema);

export default Post;
