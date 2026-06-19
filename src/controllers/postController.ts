import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Posts.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createCommentSchema,
  createPostSchema,
  paginationSchema,
  updateCommentSchema,
  updatePostSchema,
} from '../validators/post.validator.js';

const publicPostProjection = {
  title: 1,
  content: 1,
  author: 1,
  tags: 1,
  publishedAt: 1,
  views: 1,
  likes: 1,
  comments: 1,
};

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);
  const skip = (page - 1) * limit;

  const filter = { isPublished: true };

  const [posts, total] = await Promise.all([
    Post.find(filter, publicPostProjection)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  sendSuccess({
    res,
    data: {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findOneAndUpdate(
    { _id: id, isPublished: true },
    { $inc: { views: 1 } },
    { new: true, projection: publicPostProjection }
  ).lean();

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  sendSuccess({ res, data: post });
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const payload = createPostSchema.parse(req.body);

  const post = await Post.create({
    ...payload,
    author: req.session.fullName,
    publishedAt: new Date(),
    isPublished: true,
  });

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Post created successfully',
    data: post,
  });
});

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = updatePostSchema.parse(req.body);

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
    projection: publicPostProjection,
  }).lean();

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  sendSuccess({
    res,
    message: 'Post updated successfully',
    data: post,
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  sendSuccess({ res, message: 'Post deleted successfully' });
});

export const togglePostLike = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.session.userID;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const alreadyLiked = post.likedBy.some((likedId) => likedId.equals(userObjectId));

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((likedId) => !likedId.equals(userObjectId));
    post.likes = Math.max(0, post.likes - 1);
  } else {
    post.likedBy.push(userObjectId);
    post.likes += 1;
  }

  await post.save();

  sendSuccess({
    res,
    message: alreadyLiked ? 'Post unliked' : 'Post liked',
    data: {
      likes: post.likes,
      liked: !alreadyLiked,
    },
  });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text } = createCommentSchema.parse(req.body);

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = post.comments.create({
    text,
    author: req.session.user!,
    role: req.session.role as 'user' | 'admin',
    userId: new mongoose.Types.ObjectId(req.session.userID),
    editedAt: new Date(),
  });

  await post.save();

  sendSuccess({
    res,
    statusCode: 201,
    message: 'Comment added',
    data: comment,
  });
});

export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid post ID', 400);
  }

  const post = await Post.findById(id, { comments: 1, title: 1 }).lean();

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  sendSuccess({
    res,
    data: {
      postId: post._id,
      title: post.title,
      comments: post.comments,
    },
  });
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const { text } = updateCommentSchema.parse(req.body);

  if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
    throw new AppError('Invalid post or comment ID', 400);
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (comment.userId.toString() !== req.session.userID) {
    throw new AppError('You can only edit your own comments', 403);
  }

  comment.text = text;
  comment.editedAt = new Date();
  await post.save();

  sendSuccess({
    res,
    message: 'Comment updated',
    data: comment,
  });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;

  if (!mongoose.isValidObjectId(postId) || !mongoose.isValidObjectId(commentId)) {
    throw new AppError('Invalid post or comment ID', 400);
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  const isOwner = comment.userId.toString() === req.session.userID;
  const isAdmin = req.session.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to delete this comment', 403);
  }

  comment.deleteOne();
  await post.save();

  sendSuccess({ res, message: 'Comment deleted' });
});
