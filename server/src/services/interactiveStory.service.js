import { randomUUID } from 'node:crypto';
import { dbV2 } from '../db/index.js';
import { InteractiveStories, InteractiveStoryNodes } from '../db/schemaV2.js';
import ApiError from '../utils/ApiError.js';
import { buildPollinationsImageUrl, uploadImageToCloudinary } from './image.service.js';
import { generateGeminiText } from './gemini.service.js';
import { generateUniqueStorySlug } from './story.service.js';
import { syncUserFromClerk } from './user.service.js';
import { buildChoicePrompt, makePageContext, parseChoices } from './plottwist.service.js';

const MIN_STARTER_PAGES = 5;

const persistWithFallback = async imageUrl => {
  try {
    const result = await uploadImageToCloudinary(imageUrl);
    return result.secureUrl || imageUrl;
  } catch {
    return imageUrl;
  }
};

export const createInteractiveStarter = async ({ userId, payload }) => {
  const user = await syncUserFromClerk(userId);
  const story = payload?.story ?? {};
  const formData = payload?.formData ?? {};
  const storyId = randomUUID();
  const rootNodeId = randomUUID();
  const interactiveTitle = String(story?.title ?? 'Interactive Story');
  const slug = await generateUniqueStorySlug(interactiveTitle);
  const chapters = Array.isArray(story?.chapters) ? story.chapters : [];

  const starterPages = await Promise.all(
    chapters.map(async (chapter, index) => {
      const prompt = String(chapter?.imagePrompt ?? chapter?.textPrompt ?? 'Story illustration');
      const seed = `${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`;
      const pollinationsUrl = buildPollinationsImageUrl(prompt, { seed });
      return {
        pageNumber: index + 1,
        title: String(chapter?.title ?? `Chapter ${index + 1}`),
        text: String(chapter?.textPrompt ?? ''),
        imagePrompt: prompt,
        imageUrl: await persistWithFallback(pollinationsUrl),
      };
    })
  );

  if (starterPages.length < MIN_STARTER_PAGES) {
    throw new ApiError(400, 'Starter story must have at least 5 pages');
  }

  const coverPromptSource = String(
    story?.coverImagePrompt ||
      `${story?.title ?? 'Interactive story'} cinematic book cover, ${formData?.imageStyle ?? 'illustration'}`
  );
  const coverTitle = String(story?.title ?? 'Interactive Story').replace(/\s+/g, '-');
  const coverPrompt = coverPromptSource.replace(/\s+/g, '-');
  const defaultStyleCoverPrompt = `Add-title-"${coverTitle}"-in-bold-text-for-book-cover-image,-${coverPrompt}`;
  const coverSeed = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const coverImageUrl = buildPollinationsImageUrl(defaultStyleCoverPrompt, {
    width: 410,
    height: 630,
    seed: coverSeed,
  });
  const persistedCoverImageUrl = await persistWithFallback(coverImageUrl);

  const fallbackChoices = ['Follow the hopeful path', 'Explore the unknown path'];
  const starterContext = makePageContext(starterPages, 4);
  let starterChoices = fallbackChoices;

  try {
    const starterChoiceText = await generateGeminiText({
      prompt: buildChoicePrompt(starterContext),
      mode: 'text',
    });
    const parsedChoices = parseChoices(starterChoiceText);
    if (parsedChoices.length >= 2) {
      starterChoices = parsedChoices;
    }
  } catch {
    starterChoices = fallbackChoices;
  }

  const now = new Date();

  await dbV2.insert(InteractiveStories).values({
    storyId,
    slug,
    userEmail: user.userEmail,
    userName: user.userName,
    userImage: user.userImage,
    title: interactiveTitle,
    storySubject: formData?.storySubject,
    storyType: formData?.storyType,
    ageGroup: formData?.ageGroup,
    imageStyle: formData?.imageStyle,
    status: 'draft',
    rootNodeId,
    currentNodeId: rootNodeId,
    totalPages: starterPages.length,
    coverImage: persistedCoverImageUrl,
    createdAt: now,
    updatedAt: now,
  });

  await dbV2.insert(InteractiveStoryNodes).values({
    nodeId: rootNodeId,
    storyId,
    parentNodeId: null,
    depth: 0,
    choiceTaken: null,
    choices: starterChoices,
    selectedChoice: null,
    pages: starterPages,
    isActive: true,
    createdAt: now,
  });

  return { storyId };
};
