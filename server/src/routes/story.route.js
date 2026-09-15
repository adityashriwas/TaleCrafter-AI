import { Router } from 'express';
import {
  deleteStory,
  getCurrentUserStories,
  getPublicStories,
  getRelatedStoryList,
  getStoryIdDetail,
  getStorySitemapEntries,
  getStorySlugDetail,
} from '../controllers/story.controller.js';
import { requireAuth } from '../middlewares/clerkAuth.middleware.js';

const router = Router();

router.get('/', getPublicStories);
router.get('/me', requireAuth, getCurrentUserStories);
router.get('/sitemap', getStorySitemapEntries);
router.get('/slug/:slug', getStorySlugDetail);
router.get('/id/:storyId', getStoryIdDetail);
router.get('/:storyId/related', getRelatedStoryList);
router.delete('/:storyId', requireAuth, deleteStory);

export default router;
