import { Router } from 'express';
import { authMiddleware } from '../middleware/auth'
import { get_user, get_task } from '../controllers/get_system';
import { post_task } from '../controllers/post_system';
import { update_task } from '../controllers/update_system';
import { delete_task } from '../controllers/delete_system';

const router = Router();

router.get("/get_user", authMiddleware , get_user);

router.get("/get_task", authMiddleware, get_task);

router.post("/post_task", authMiddleware , post_task);

router.put("/put_task/:id", authMiddleware, update_task);

router.delete("/delete_task/:id", delete_task);

export default router;