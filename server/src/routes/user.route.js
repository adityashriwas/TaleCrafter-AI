import { Router } from 'express';
import {
  decrementCurrentUserCredits,
  getCurrentUser,
} from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { decrementCreditsSchema } from '../validations/user.validation.js';

const router = Router();

router.get('/me', requireAuth, getCurrentUser);
router.post(
  '/me/credits/decrement',
  requireAuth,
  validate(decrementCreditsSchema),
  decrementCurrentUserCredits
);

export default router;
