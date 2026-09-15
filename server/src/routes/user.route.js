import { Router } from 'express';
import {
  decrementCurrentUserCredits,
  getCurrentUser,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getCurrentUser);
router.post('/me/credits/decrement', requireAuth, decrementCurrentUserCredits);

export default router;
