import { NextFunction, Request, Response, Router } from 'express';

import {
  getUserControl,
  createUserControl,
  getOneUserControl,
  editUserControl,
  deleteUserControl,
  auth,
  logout,
  notFound,
} from '../controllers/userController.js';

const router = Router();

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ message: "Please log in to continue" });
  }
};

router.get("/", checkAuth, getUserControl);

router.post("/", createUserControl);

router.get("/:id", checkAuth, getOneUserControl);

router.put("/:id", checkAuth, editUserControl);

router.delete("/:id", checkAuth, deleteUserControl);

router.post("/auth", auth);

router.post("/logout", logout);

router.get("*", notFound);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    return res.status(401).json({ message: "Unauthorized User!" });
  }
  next();
});

export default router;
