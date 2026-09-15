import { Router } from 'express';
import { getCurrentUser } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getCurrentUser);

export default router;
