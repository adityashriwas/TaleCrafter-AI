import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  decrementUserCredits,
  syncUserFromClerk,
} from '../services/user.service.js';

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await syncUserFromClerk(req.auth.userId);
  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user fetched successfully'));
});

export const decrementCurrentUserCredits = asyncHandler(async (req, res) => {
  const amount = req.validated.body?.amount ?? 1;
  const user = await decrementUserCredits(req.auth.userId, amount);

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Credits updated successfully'));
});
