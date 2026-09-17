import { asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { db, dbV2 } from '../db/index.js';
import { StoryData, Users } from '../db/schema.js';
import { InteractiveStories, InteractiveStoryNodes } from '../db/schemaV2.js';
import ApiError from '../utils/ApiError.js';
import { extractStoryTitle, generateUniqueStorySlug } from './story.service.js';

const DEFAULT_BACKFILL_LIMIT = 200;
const MAX_BACKFILL_LIMIT = 1000;

const clampBackfillLimit = value => {
  const limit = Number(value ?? DEFAULT_BACKFILL_LIMIT);
  if (!Number.isFinite(limit)) return DEFAULT_BACKFILL_LIMIT;
  return Math.min(MAX_BACKFILL_LIMIT, Math.max(1, Math.floor(limit)));
};

export const listAdminStories = async () => {
  return db.select().from(StoryData).orderBy(asc(StoryData.id));
};

export const listAdminUsers = async () => {
  return db.select().from(Users).orderBy(desc(Users.id));
};

export const deleteAdminStory = async storyId => {
  const safeStoryId = String(storyId ?? '').trim();
  if (!safeStoryId) throw new ApiError(400, 'Story ID is required');

  const deleted = await db
    .delete(StoryData)
    .where(eq(StoryData.storyId, safeStoryId))
    .returning({ storyId: StoryData.storyId });

  if (!deleted[0]) throw new ApiError(404, 'Story not found');

  await dbV2
    .delete(InteractiveStoryNodes)
    .where(eq(InteractiveStoryNodes.storyId, safeStoryId));

  await dbV2
    .delete(InteractiveStories)
    .where(eq(InteractiveStories.storyId, safeStoryId));

  return deleted[0];
};

export const deleteAdminUser = async userEmail => {
  const safeEmail = String(userEmail ?? '')
    .trim()
    .toLowerCase();
  if (!safeEmail) throw new ApiError(400, 'User email is required');

  const deleted = await db
    .delete(Users)
    .where(eq(Users.userEmail, safeEmail))
    .returning({ userEmail: Users.userEmail });

  if (!deleted[0]) throw new ApiError(404, 'User not found');
  return deleted[0];
};

export const updateAdminUserCredit = async ({ userEmail, credit }) => {
  const safeEmail = String(userEmail ?? '')
    .trim()
    .toLowerCase();
  const safeCredit = Number(credit);

  if (!safeEmail) throw new ApiError(400, 'User email is required');
  if (!Number.isInteger(safeCredit) || safeCredit < 0) {
    throw new ApiError(400, 'Credit must be a non-negative integer');
  }

  const updated = await db
    .update(Users)
    .set({ credit: safeCredit })
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

export const backfillStorySlugs = async ({ limit }) => {
  const safeLimit = clampBackfillLimit(limit);
  const targets = await db
    .select()
    .from(StoryData)
    .where(isNull(StoryData.slug))
    .orderBy(asc(StoryData.id))
    .limit(safeLimit);

  let updated = 0;

  for (const story of targets) {
    const title = extractStoryTitle(story);
    const slug = await generateUniqueStorySlug(title, {
      excludeStoryId: story.storyId,
    });

    await db.update(StoryData).set({ slug }).where(eq(StoryData.id, story.id));

    updated += 1;
  }

  const remainingRows = await db
    .select({ count: sql`count(*)` })
    .from(StoryData)
    .where(isNull(StoryData.slug));

  return {
    scanned: targets.length,
    updated,
    remaining: Number(remainingRows?.[0]?.count ?? 0),
  };
};
