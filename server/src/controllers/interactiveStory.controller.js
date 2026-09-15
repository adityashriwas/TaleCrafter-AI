import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createInteractiveStarter } from '../services/interactiveStory.service.js';

export const createInteractiveStory = asyncHandler(async (req, res) => {
  const story = await createInteractiveStarter({
    userId: req.auth.userId,
    payload: req.body ?? {},
  });

  return res.status(201).json(new ApiResponse(201, story, 'Interactive story created'));
});
