import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

import {
  getAllPost,
  getOnePost,
  createPost,
  editPost,
  deletePost,
  likePost,
  createPostComment,
  getPostComment,
  editPostComment,
  deletePostComment,
  notFound,
} from '../controllers/postController.js';

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Please log in to continue" });
  }
};

router.get("/", getAllPost);

router.get("/:post", getOnePost);

router.post("/", checkAuth, createPost);

router.put("/:post", checkAuth, editPost);

router.put("/:post/like", checkAuth, likePost);

router.delete("/:post", checkAuth, deletePost);

router.post("/:post/comments", checkAuth, createPostComment);

router.get("/:post/comments", checkAuth, getPostComment);

router.put("/:postId/:commentId", checkAuth, editPostComment);

router.delete("/:postId/:commentId", checkAuth, deletePostComment);

router.get("*", notFound);

export default router;
