import { Router } from 'express';
import { authMiddleware } from '../middleware/auth'
import { get_user, get_task, get_note } from '../controllers/get_system';
import { post_task, post_note } from '../controllers/post_system';
import { update_task, update_note } from '../controllers/update_system';
import { delete_task, delete_note } from '../controllers/delete_system';

const router = Router();

router.get("/get_user", authMiddleware , get_user);

router.get("/get_task", authMiddleware, get_task);

router.get("/get_note", authMiddleware, get_note);

router.post("/post_task", authMiddleware , post_task);

router.post("/post_note", authMiddleware, post_note);

router.put("/put_task/:id", authMiddleware, update_task);

router.put("/put_note/:id", update_note)

router.delete("/delete_task/:id", delete_task);

router.delete("/delete_note/:id", delete_note);

export default router;