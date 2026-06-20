import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  deleteUser,
  getCurrentUser,
  getUserById,
  getUsers,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
});

router.post('/register', registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', requireAuth, logoutUser);
router.get('/me', requireAuth, getCurrentUser);

router.get('/', requireAuth, getUsers);
router.get('/:id', requireAuth, getUserById);
router.patch('/:id', requireAuth, updateUser);
router.delete('/:id', requireAuth, deleteUser);

export default router;
