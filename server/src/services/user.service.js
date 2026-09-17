import { clerkClient } from '@clerk/express';
import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { Users } from '../db/schema.js';
import ApiError from '../utils/ApiError.js';

const getPrimaryEmail = clerkUser => {
  return (
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses?.[0]?.emailAddress ||
    ''
  )
    .trim()
    .toLowerCase();
};

const getDisplayName = clerkUser => {
  return (
    clerkUser.fullName ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    getPrimaryEmail(clerkUser)
  ).trim();
};

export const getCurrentClerkUser = async userId => {
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  return clerkClient.users.getUser(userId);
};

export const syncUserFromClerk = async userId => {
  const clerkUser = await getCurrentClerkUser(userId);
  const userEmail = getPrimaryEmail(clerkUser);

  if (!userEmail) {
    throw new ApiError(400, 'Authenticated Clerk user has no email address');
  }

  const userName = getDisplayName(clerkUser);
  const userImage = clerkUser.imageUrl || '';

  const existing = await db
    .select()
    .from(Users)
    .where(eq(Users.userEmail, userEmail))
    .limit(1);

  if (!existing[0]) {
    const inserted = await db
      .insert(Users)
      .values({ userEmail, userName, userImage })
      .returning({
        id: Users.id,
        userEmail: Users.userEmail,
        userName: Users.userName,
        userImage: Users.userImage,
        credit: Users.credit,
      });

    return inserted[0];
  }

  const currentUser = existing[0];
  const shouldUpdateProfile =
    currentUser.userName !== userName || currentUser.userImage !== userImage;

  if (!shouldUpdateProfile) {
    return currentUser;
  }

  const updated = await db
    .update(Users)
    .set({ userName, userImage })
    .where(eq(Users.userEmail, userEmail))
    .returning({
      id: Users.id,
      userEmail: Users.userEmail,
      userName: Users.userName,
      userImage: Users.userImage,
      credit: Users.credit,
    });

  return updated[0] ?? currentUser;
};

export const incrementUserCreditsByEmail = async (userEmail, amount = 1) => {
  const safeAmount = Number(amount);
  const safeEmail = String(userEmail ?? '')
    .trim()
    .toLowerCase();

  if (!safeEmail) throw new ApiError(400, 'User email is required');
  if (!Number.isInteger(safeAmount) || safeAmount <= 0) {
    throw new ApiError(400, 'Credit amount must be a positive integer');
  }

  const updated = await db
    .update(Users)
    .set({ credit: sql`${Users.credit} + ${safeAmount}` })
    .where(eq(Users.userEmail, safeEmail))
    .returning({
      id: Users.id,
      userEmail: Users.userEmail,
      userName: Users.userName,
      userImage: Users.userImage,
      credit: Users.credit,
    });

  if (!updated[0]) throw new ApiError(404, 'User not found');
  return updated[0];
};

export const incrementUserCredits = async (userId, amount = 1) => {
  const currentUser = await syncUserFromClerk(userId);
  return incrementUserCreditsByEmail(currentUser.userEmail, amount);
};

export const decrementUserCredits = async (userId, amount = 1) => {
  const safeAmount = Number(amount);

  if (!Number.isInteger(safeAmount) || safeAmount <= 0) {
    throw new ApiError(400, 'Credit amount must be a positive integer');
  }

  const currentUser = await syncUserFromClerk(userId);

  const updated = await db
    .update(Users)
    .set({ credit: sql`${Users.credit} - ${safeAmount}` })
    .where(
      and(
        eq(Users.userEmail, currentUser.userEmail),
        gte(Users.credit, safeAmount)
      )
    )
    .returning({
      id: Users.id,
      userEmail: Users.userEmail,
      userName: Users.userName,
      userImage: Users.userImage,
      credit: Users.credit,
    });

  if (!updated[0]) {
    throw new ApiError(402, 'Insufficient credits');
  }

  return updated[0];
};
