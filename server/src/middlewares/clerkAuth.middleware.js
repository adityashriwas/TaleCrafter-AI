import { clerkClient, getAuth } from '@clerk/express';
import ApiError from '../utils/ApiError.js';

export const requireAuth = (req, _res, next) => {
  const auth = getAuth(req);

  if (!auth.isAuthenticated) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  req.auth = auth;
  return next();
};

export const requireAdmin = async (req, _res, next) => {
  const auth = getAuth(req);

  if (!auth.isAuthenticated) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    let userEmail = String(
      auth.sessionClaims?.email ??
        auth.sessionClaims?.primary_email_address ??
        ''
    )
      .trim()
      .toLowerCase();

    if (!userEmail && auth.userId) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      userEmail =
        clerkUser.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
    }

    if (!adminEmail || userEmail !== adminEmail) {
      return next(new ApiError(403, 'Forbidden'));
    }

    req.auth = auth;
    return next();
  } catch (error) {
    return next(error);
  }
};
