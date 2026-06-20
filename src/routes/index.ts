import { Router } from 'express';
import postsRouter from './posts.js';
import usersRouter from './users.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/posts', postsRouter);

export default router;
