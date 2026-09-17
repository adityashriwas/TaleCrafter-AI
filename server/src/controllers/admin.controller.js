import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  backfillStorySlugs,
  deleteAdminStory,
  deleteAdminUser,
  listAdminStories,
  listAdminUsers,
  updateAdminUserCredit,
} from '../services/admin.service.js';

export const getAdminStories = asyncHandler(async (_req, res) => {
  const stories = await listAdminStories();
  return res.status(200).json(new ApiResponse(200, stories, 'Stories fetched'));
});

export const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await listAdminUsers();
  return res.status(200).json(new ApiResponse(200, users, 'Users fetched'));
});

export const removeAdminStory = asyncHandler(async (req, res) => {
  const story = await deleteAdminStory(req.validated.params.storyId);
  return res.status(200).json(new ApiResponse(200, story, 'Story deleted'));
});

export const removeAdminUser = asyncHandler(async (req, res) => {
  const user = await deleteAdminUser(req.validated.params.userEmail);
  return res.status(200).json(new ApiResponse(200, user, 'User deleted'));
});

export const setAdminUserCredit = asyncHandler(async (req, res) => {
  const user = await updateAdminUserCredit({
    userEmail: req.validated.params.userEmail,
    credit: req.validated.body.credit,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'User credit updated'));
});

export const backfillAdminStorySlugs = asyncHandler(async (req, res) => {
  const result = await backfillStorySlugs({
    limit: req.validated.body?.limit,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Story slugs backfilled'));
});
