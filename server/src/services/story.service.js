import { randomUUID } from 'node:crypto';
import { and, desc, eq, isNotNull, like, ne, sql } from 'drizzle-orm';
import { db, dbV2 } from '../db/index.js';
import { StoryData } from '../db/schema.js';
import { InteractiveStories, InteractiveStoryNodes } from '../db/schemaV2.js';
import ApiError from '../utils/ApiError.js';
import {
  decrementUserCredits,
  incrementUserCreditsByEmail,
  syncUserFromClerk,
} from './user.service.js';
import {
  buildPollinationsImageUrl,
  uploadImageToCloudinary,
} from './image.service.js';
import { generateStoryJson } from './gemini.service.js';

const MAX_BASE_SLUG_LENGTH = 70;

const clampLimit = value => {
  const limit = Number(value ?? 12);
  if (!Number.isFinite(limit)) return 12;
  return Math.min(50, Math.max(1, Math.floor(limit)));
};

const normalizeOffset = value => {
  const offset = Number(value ?? 0);
  if (!Number.isFinite(offset)) return 0;
  return Math.max(0, Math.floor(offset));
};

export const slugifyStoryTitle = title => {
  const normalized = String(title ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_BASE_SLUG_LENGTH)
    .replace(/-+$/g, '');

  return normalized || 'story';
};

export const extractStoryTitle = story => {
  const output = story?.output;
  const title = String(output?.title ?? '').trim();
  if (title) return title;

  const subject = String(story?.storySubject ?? '').trim();
  if (subject) return subject;

  return 'AI Generated Story';
};

const buildSlugFilter = (baseSlug, excludeStoryId) => {
  if (!excludeStoryId) {
    return like(StoryData.slug, `${baseSlug}%`);
  }

  return and(
    like(StoryData.slug, `${baseSlug}%`),
    ne(StoryData.storyId, excludeStoryId)
  );
};

export const generateUniqueStorySlug = async (title, opts = {}) => {
  const baseSlug = slugifyStoryTitle(title);
  const rows = await db
    .select({ slug: StoryData.slug })
    .from(StoryData)
    .where(buildSlugFilter(baseSlug, opts.excludeStoryId));

  const used = new Set(
    rows.map(row => String(row.slug ?? '').trim()).filter(Boolean)
  );

  if (!used.has(baseSlug)) return baseSlug;

  let maxSuffix = 1;
  for (const slug of used) {
    const match = slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value > maxSuffix) {
      maxSuffix = value;
    }
  }

  return `${baseSlug}-${maxSuffix + 1}`;
};

export const listPublicStories = async ({ limit, offset }) => {
  return db
    .select()
    .from(StoryData)
    .orderBy(desc(StoryData.id))
    .limit(clampLimit(limit))
    .offset(normalizeOffset(offset));
};

export const listCurrentUserStories = async ({ userId, limit, offset }) => {
  const user = await syncUserFromClerk(userId);

  return db
    .select()
    .from(StoryData)
    .where(eq(StoryData.userEmail, user.userEmail))
    .orderBy(desc(StoryData.id))
    .limit(clampLimit(limit))
    .offset(normalizeOffset(offset));
};

export const getStoryBySlug = async slug => {
  const safeSlug = String(slug ?? '').trim();
  if (!safeSlug) throw new ApiError(400, 'Story slug is required');

  const result = await db
    .select()
    .from(StoryData)
    .where(eq(StoryData.slug, safeSlug))
    .limit(1);

  return result[0] ?? null;
};

export const getStoryByStoryId = async storyId => {
  const safeStoryId = String(storyId ?? '').trim();
  if (!safeStoryId) throw new ApiError(400, 'Story ID is required');

  const result = await db
    .select()
    .from(StoryData)
    .where(eq(StoryData.storyId, safeStoryId))
    .limit(1);

  return result[0] ?? null;
};

export const listStorySitemapPage = async ({ limit, offset }) => {
  return db
    .select({ slug: StoryData.slug })
    .from(StoryData)
    .where(isNotNull(StoryData.slug))
    .orderBy(desc(StoryData.id))
    .limit(clampLimit(limit))
    .offset(normalizeOffset(offset));
};

export const listStorySitemapEntries = async () => {
  return db
    .select({
      storyId: StoryData.storyId,
      slug: StoryData.slug,
    })
    .from(StoryData)
    .orderBy(desc(StoryData.id));
};

export const listRelatedStories = async ({
  storyId,
  storyType,
  limit,
  offset,
}) => {
  const safeStoryId = String(storyId ?? '').trim();
  if (!safeStoryId) throw new ApiError(400, 'Story ID is required');

  const baseFilter = ne(StoryData.storyId, safeStoryId);
  const orderClause = storyType
    ? sql`CASE WHEN ${StoryData.storyType} = ${String(storyType).trim()} THEN 0 ELSE 1 END, RANDOM()`
    : sql`RANDOM()`;

  const [stories, totalResult] = await Promise.all([
    db
      .select()
      .from(StoryData)
      .where(baseFilter)
      .orderBy(orderClause)
      .limit(clampLimit(limit))
      .offset(normalizeOffset(offset)),
    db
      .select({ count: sql`count(*)` })
      .from(StoryData)
      .where(baseFilter),
  ]);

  return {
    stories,
    totalCount: Number(totalResult?.[0]?.count ?? 0),
  };
};

const persistImageWithFallback = async imageUrl => {
  try {
    const result = await uploadImageToCloudinary(imageUrl);
    return result.secureUrl || imageUrl;
  } catch {
    return imageUrl;
  }
};

const mapWithConcurrency = async (items, concurrency, mapper) => {
  const results = new Array(items.length);
  let cursor = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, Math.max(1, items.length)) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await mapper(items[index], index);
      }
    }
  );

  await Promise.all(workers);
  return results;
};

const prepareClassicStoryImages = async ({ output, imageStyle }) => {
  const story = output ?? {};
  const title = String(story?.title ?? 'Story');
  const chapters = Array.isArray(story?.chapters) ? story.chapters : [];
  const coverPromptSource = String(
    story?.coverImagePrompt ??
      `${title} ${imageStyle ?? 'illustration'} book cover`
  );
  const coverPrompt = `Add-title-"${title.replace(/\s+/g, '-')}"-in-bold-text-for-book-cover-image,-${coverPromptSource.replace(/\s+/g, '-')}`;
  const coverUrl = buildPollinationsImageUrl(coverPrompt, {
    width: 410,
    height: 630,
    seed: Date.now(),
  });

  const [coverImage, persistedChapters] = await Promise.all([
    persistImageWithFallback(coverUrl),
    mapWithConcurrency(chapters, 3, async (chapter, index) => {
      const sourcePrompt = String(
        chapter?.imagePrompt ?? chapter?.textPrompt ?? `${title} illustration`
      ).trim();
      const generatedImageUrl = buildPollinationsImageUrl(sourcePrompt, {
        seed: `${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
      });

      return {
        ...chapter,
        chapterNumber: Number(chapter?.chapterNumber ?? index + 1),
        imagePrompt: sourcePrompt,
        imageUrl: await persistImageWithFallback(generatedImageUrl),
      };
    }),
  ]);

  return {
    output: {
      ...story,
      chapters: persistedChapters,
    },
    coverImage,
  };
};

export const createClassicStory = async ({ userId, payload }) => {
  const reservedUser = await decrementUserCredits(userId, 1);

  try {
    const storyId = randomUUID();
    const generatedStory = await generateStoryJson({ formData: payload });
    const prepared = await prepareClassicStoryImages({
      output: generatedStory,
      imageStyle: payload?.imageStyle,
    });
    const title = extractStoryTitle({
      output: prepared.output,
      storySubject: payload?.storySubject,
    });
    const slug = await generateUniqueStorySlug(title);

    const inserted = await db
      .insert(StoryData)
      .values({
        storyId,
        slug,
        ageGroup: payload?.ageGroup,
        storyType: payload?.storyType,
        storySubject: payload?.storySubject,
        imageStyle: payload?.imageStyle,
        output: prepared.output,
        coverImage: prepared.coverImage,
        userEmail: reservedUser.userEmail,
        userName: reservedUser.userName,
        userImage: reservedUser.userImage,
      })
      .returning({ storyId: StoryData.storyId, slug: StoryData.slug });

    return {
      ...inserted[0],
      user: reservedUser,
    };
  } catch (error) {
    await incrementUserCreditsByEmail(reservedUser.userEmail, 1);
    throw error;
  }
};

export const deleteCurrentUserStory = async ({ userId, storyId }) => {
  const user = await syncUserFromClerk(userId);
  const safeStoryId = String(storyId ?? '').trim();

  if (!safeStoryId) throw new ApiError(400, 'Story ID is required');

  const deleted = await db
    .delete(StoryData)
    .where(
      and(
        eq(StoryData.storyId, safeStoryId),
        eq(StoryData.userEmail, user.userEmail)
      )
    )
    .returning({ storyId: StoryData.storyId });

  if (!deleted[0]) {
    throw new ApiError(404, 'Story not found or you do not have access');
  }

  await dbV2
    .delete(InteractiveStoryNodes)
    .where(eq(InteractiveStoryNodes.storyId, safeStoryId));

  await dbV2
    .delete(InteractiveStories)
    .where(
      and(
        eq(InteractiveStories.storyId, safeStoryId),
        eq(InteractiveStories.userEmail, user.userEmail)
      )
    );

  return deleted[0];
};
