import { Router } from 'express';
import {
  createPollinationsImageUrl,
  persistImage,
} from '../controllers/image.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  persistImageSchema,
  pollinationsImageUrlSchema,
} from '../validations/image.validation.js';

const router = Router();

router.post(
  '/pollinations-url',
  requireAuth,
  validate(pollinationsImageUrlSchema),
  createPollinationsImageUrl
);
router.post(
  '/persist',
  requireAuth,
  validate(persistImageSchema),
  persistImage
);

export default router;
