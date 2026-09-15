import { Router } from 'express';
import {
  createPollinationsImageUrl,
  persistImage,
} from '../controllers/image.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.post('/pollinations-url', requireAuth, createPollinationsImageUrl);
router.post('/persist', requireAuth, persistImage);

export default router;
