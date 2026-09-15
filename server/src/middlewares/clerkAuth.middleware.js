import { getAuth } from '@clerk/express';
import ApiError from '../utils/ApiError.js';

export const requireAuth = (req, _res, next) => {
  const auth = getAuth(req);

  if (!auth.isAuthenticated) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  req.auth = auth;
  return next();
};

export const requireAdmin = (req, _res, next) => {
  const auth = getAuth(req);

  if (!auth.isAuthenticated) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = auth.sessionClaims?.email?.toLowerCase();
  const primaryEmail = auth.sessionClaims?.primary_email_address?.toLowerCase();

  if (!adminEmail || (userEmail !== adminEmail && primaryEmail !== adminEmail)) {
    return next(new ApiError(403, 'Forbidden'));
  }

  req.auth = auth;
  return next();
};
