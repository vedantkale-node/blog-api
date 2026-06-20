import { Router } from 'express';
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getComments,
  getPostById,
  getPosts,
  togglePostLike,
  updateComment,
  updatePost,
} from '../controllers/postController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', getPostById);

router.post('/', requireAuth, requireAdmin, createPost);
router.patch('/:id', requireAuth, requireAdmin, updatePost);
router.delete('/:id', requireAuth, requireAdmin, deletePost);

router.put('/:id/like', requireAuth, togglePostLike);

router.get('/:id/comments', getComments);
router.post('/:id/comments', requireAuth, createComment);
router.patch('/:id/comments/:commentId', requireAuth, updateComment);
router.delete('/:id/comments/:commentId', requireAuth, deleteComment);

export default router;
