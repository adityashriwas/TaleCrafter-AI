import { Router } from 'express';
import {
  backfillAdminStorySlugs,
  getAdminStories,
  getAdminUsers,
  removeAdminStory,
  removeAdminUser,
  setAdminUserCredit,
} from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/clerkAuth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  adminBackfillSlugsSchema,
  adminStoryIdParamSchema,
  adminUpdateUserCreditSchema,
  adminUserEmailParamSchema,
} from '../validations/admin.validation.js';

const router = Router();

router.use(requireAdmin);

router.get('/stories', getAdminStories);
router.get('/users', getAdminUsers);
router.post(
  '/stories/backfill-slugs',
  validate(adminBackfillSlugsSchema),
  backfillAdminStorySlugs
);
router.delete(
  '/stories/:storyId',
  validate(adminStoryIdParamSchema),
  removeAdminStory
);
router.delete(
  '/users/:userEmail',
  validate(adminUserEmailParamSchema),
  removeAdminUser
);
router.patch(
  '/users/:userEmail/credit',
  validate(adminUpdateUserCreditSchema),
  setAdminUserCredit
);

export default router;
