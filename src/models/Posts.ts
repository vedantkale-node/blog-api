import { Schema, model } from "mongoose";
import { IPost } from "../interfaces/PostInterface.js";

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true,
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
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
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
    type: [String],
    default: [],
  },
  comments: [
    {
      _id: {
        type: String
      },
      text: { type: String,
              required: true 
            },
      author: {
        type: String,
        required: true,
      },
      role: {
        type: String
      },
      createdTime: {
        type: Date,
        default: Date.now()
      },
      userId: {
        type: String,
      },
      editedAt: {
        type: Date,
        default: Date.now()
      }
    },
  ],
});

const Post = model<IPost>('Post', postSchema);

export default Post;
