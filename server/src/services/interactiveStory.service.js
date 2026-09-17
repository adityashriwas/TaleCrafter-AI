import { randomUUID } from 'node:crypto';
import { asc, eq } from 'drizzle-orm';
import { db, dbV2 } from '../db/index.js';
import { StoryData } from '../db/schema.js';
import { InteractiveStories, InteractiveStoryNodes } from '../db/schemaV2.js';
import ApiError from '../utils/ApiError.js';
import {
  buildPollinationsImageUrl,
  uploadImageToCloudinary,
} from './image.service.js';
import { generateGeminiText, generateStoryJson } from './gemini.service.js';
import { generateUniqueStorySlug } from './story.service.js';
import {
  decrementUserCredits,
  incrementUserCreditsByEmail,
  syncUserFromClerk,
} from './user.service.js';
import {
  buildChoicePrompt,
  buildContinuationPrompt,
  makePageContext,
  parseChoices,
  parseContinuationPayload,
  parsePages,
} from './plottwist.service.js';

const MIN_STARTER_PAGES = 5;
const MAX_DEPTH = 7;
const CONTINUATION_FALLBACK_CHOICES = [
  'Take the hopeful next step',
  'Risk a bold unknown path',
];
const STARTER_FALLBACK_CHOICES = [
  'Follow the hopeful path',
  'Explore the unknown path',
];

const persistWithFallback = async imageUrl => {
  try {
    const result = await uploadImageToCloudinary(imageUrl);
    return result.secureUrl || imageUrl;
  } catch {
    return imageUrl;
  }
};

const mapStoryNode = item => ({
  nodeId: String(item.nodeId),
  storyId: String(item.storyId),
  parentNodeId: item.parentNodeId ? String(item.parentNodeId) : null,
  depth: Number(item.depth ?? 0),
  choiceTaken: item.choiceTaken ? String(item.choiceTaken) : null,
  choices: Array.isArray(item.choices) ? item.choices : null,
  selectedChoice: item.selectedChoice ? String(item.selectedChoice) : null,
  pages: Array.isArray(item.pages) ? item.pages : [],
  isActive: Boolean(item.isActive),
});

const ensureOwnedStory = async ({ userId, storyId }) => {
  const user = await syncUserFromClerk(userId);
  const safeStoryId = String(storyId ?? '').trim();

  if (!safeStoryId) throw new ApiError(400, 'Interactive story ID is required');

  const storyRows = await dbV2
    .select()
    .from(InteractiveStories)
    .where(eq(InteractiveStories.storyId, safeStoryId))
    .limit(1);
  const story = storyRows[0] ?? null;

  if (!story) throw new ApiError(404, 'Interactive story not found');
  if (story.userEmail !== user.userEmail) {
    throw new ApiError(403, 'You do not have access to this interactive story');
  }

  return { user, story };
};

const listStoryNodes = async storyId => {
  const rows = await dbV2
    .select()
    .from(InteractiveStoryNodes)
    .where(eq(InteractiveStoryNodes.storyId, storyId))
    .orderBy(asc(InteractiveStoryNodes.id));

  return rows.map(mapStoryNode);
};

const getActiveNode = nodes =>
  nodes.find(node => node.isActive) ?? nodes[nodes.length - 1] ?? null;

const getLinearNodes = ({ activeNode, nodes }) => {
  if (!activeNode) return [];

  const nodeMap = new Map(nodes.map(node => [node.nodeId, node]));
  const chain = [];
  let cursor = activeNode;

  while (cursor) {
    chain.push(cursor);
    if (!cursor.parentNodeId) break;
    cursor = nodeMap.get(cursor.parentNodeId);
  }

  return chain.reverse();
};

const mapGeneratedPages = async ({ pages, pageOffset, seedPrefix }) => {
  const mappedPages = await Promise.all(
    pages.map(async (page, index) => {
      const prompt = String(
        page.imagePrompt || page.text || 'Story illustration'
      );
      const imageUrl = buildPollinationsImageUrl(prompt, {
        seed: `${Date.now()}_${seedPrefix}_${index}_${Math.floor(Math.random() * 100000)}`,
      });

      return {
        ...page,
        pageNumber: pageOffset + index + 1,
        imagePrompt: prompt,
        imageUrl: await persistWithFallback(imageUrl),
      };
    })
  );

  return mappedPages;
};

const getCompletedStorySlug = async storyId => {
  const existing = await db
    .select({ slug: StoryData.slug })
    .from(StoryData)
    .where(eq(StoryData.storyId, storyId))
    .limit(1);

  return String(existing[0]?.slug ?? '').trim() || null;
};

const getInteractiveState = async story => {
  const nodes = await listStoryNodes(story.storyId);
  const completedSlug =
    story.status === 'completed'
      ? await getCompletedStorySlug(story.storyId)
      : null;

  return {
    story,
    nodes,
    ...(completedSlug ? { completedSlug } : {}),
  };
};

const saveCompletedToClassicStory = async ({ story, pages, finalTitle }) => {
  const existing = await db
    .select()
    .from(StoryData)
    .where(eq(StoryData.storyId, story.storyId))
    .limit(1);

  const classicOutput = {
    title: finalTitle,
    chapters: pages.map((page, index) => ({
      chapterNumber: index + 1,
      title: page.title,
      textPrompt: page.text,
      imagePrompt: page.imagePrompt,
      imageUrl: page.imageUrl,
    })),
  };

  if (!existing[0]) {
    const slug = await generateUniqueStorySlug(
      finalTitle || story.title || 'Interactive Story'
    );
    await db.insert(StoryData).values({
      storyId: story.storyId,
      slug,
      storySubject: story.storySubject,
      storyType: story.storyType,
      ageGroup: story.ageGroup,
      imageStyle: story.imageStyle,
      coverImage: pages[0]?.imageUrl ?? story.coverImage,
      output: classicOutput,
      userEmail: story.userEmail,
      userName: story.userName,
      userImage: story.userImage,
    });
    return slug;
  }

  let slug = String(existing[0].slug ?? '').trim();
  if (!slug) {
    slug = await generateUniqueStorySlug(
      finalTitle || story.title || 'Interactive Story',
      {
        excludeStoryId: story.storyId,
      }
    );
  }

  await db
    .update(StoryData)
    .set({
      slug,
      output: classicOutput,
      coverImage: pages[0]?.imageUrl ?? story.coverImage,
    })
    .where(eq(StoryData.storyId, story.storyId));

  return slug;
};

export const createInteractiveStarter = async ({ userId, payload }) => {
  const reservedUser = await decrementUserCredits(userId, 1);
  const formData = payload ?? {};
  const storyId = randomUUID();
  const rootNodeId = randomUUID();

  try {
    const story = await generateStoryJson({ formData, interactive: true });
    const interactiveTitle = String(story?.title ?? 'Interactive Story');
    const slug = await generateUniqueStorySlug(interactiveTitle);
    const chapters = Array.isArray(story?.chapters) ? story.chapters : [];

    const starterPages = await Promise.all(
      chapters.map(async (chapter, index) => {
        const prompt = String(
          chapter?.imagePrompt ?? chapter?.textPrompt ?? 'Story illustration'
        );
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
    const coverTitle = String(story?.title ?? 'Interactive Story').replace(
      /\s+/g,
      '-'
    );
    const coverPrompt = coverPromptSource.replace(/\s+/g, '-');
    const defaultStyleCoverPrompt = `Add-title-"${coverTitle}"-in-bold-text-for-book-cover-image,-${coverPrompt}`;
    const coverSeed = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const coverImageUrl = buildPollinationsImageUrl(defaultStyleCoverPrompt, {
      width: 410,
      height: 630,
      seed: coverSeed,
    });
    const persistedCoverImageUrl = await persistWithFallback(coverImageUrl);

    let starterChoices = STARTER_FALLBACK_CHOICES;
    try {
      const starterChoiceText = await generateGeminiText({
        prompt: buildChoicePrompt(makePageContext(starterPages, 4)),
        mode: 'text',
      });
      const parsedChoices = parseChoices(starterChoiceText);
      if (parsedChoices.length >= 2) starterChoices = parsedChoices;
    } catch {
      starterChoices = STARTER_FALLBACK_CHOICES;
    }

    const now = new Date();

    await dbV2.insert(InteractiveStories).values({
      storyId,
      slug,
      userEmail: reservedUser.userEmail,
      userName: reservedUser.userName,
      userImage: reservedUser.userImage,
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

    return { storyId, user: reservedUser };
  } catch (error) {
    await dbV2
      .delete(InteractiveStoryNodes)
      .where(eq(InteractiveStoryNodes.storyId, storyId));
    await dbV2
      .delete(InteractiveStories)
      .where(eq(InteractiveStories.storyId, storyId));
    await incrementUserCreditsByEmail(reservedUser.userEmail, 1);
    throw error;
  }
};

export const listCurrentUserInteractiveStories = async ({ userId }) => {
  const user = await syncUserFromClerk(userId);

  return dbV2
    .select()
    .from(InteractiveStories)
    .where(eq(InteractiveStories.userEmail, user.userEmail))
    .orderBy(asc(InteractiveStories.id));
};

export const getCurrentUserInteractiveStory = async ({ userId, storyId }) => {
  const { story } = await ensureOwnedStory({ userId, storyId });
  return getInteractiveState(story);
};

export const deleteCurrentUserInteractiveStory = async ({
  userId,
  storyId,
}) => {
  const { story } = await ensureOwnedStory({ userId, storyId });

  await dbV2
    .delete(InteractiveStoryNodes)
    .where(eq(InteractiveStoryNodes.storyId, story.storyId));

  await db.delete(StoryData).where(eq(StoryData.storyId, story.storyId));

  const deleted = await dbV2
    .delete(InteractiveStories)
    .where(eq(InteractiveStories.storyId, story.storyId))
    .returning({ storyId: InteractiveStories.storyId });

  return deleted[0] ?? { storyId: story.storyId };
};

export const completeInteractiveStory = async ({
  userId,
  storyId,
  selectedChoice = 'End Story',
}) => {
  const { story } = await ensureOwnedStory({ userId, storyId });
  if (story.status === 'completed') {
    const completedSlug = await getCompletedStorySlug(story.storyId);
    return {
      completedSlug: completedSlug || story.storyId,
      ...(await getInteractiveState(story)),
    };
  }

  const nodes = await listStoryNodes(story.storyId);
  const activeNode = getActiveNode(nodes);
  if (!activeNode) throw new ApiError(404, 'Active story node not found');
  if (activeNode.selectedChoice)
    throw new ApiError(409, 'This branch is already locked');

  const linearNodes = getLinearNodes({ activeNode, nodes });
  const linearPages = linearNodes.flatMap(node => node.pages ?? []);
  const finalPrompt = buildContinuationPrompt({
    title: story.title,
    selectedChoice,
    context: makePageContext(linearPages, 6),
    minPages: 3,
    maxPages: 5,
    finalResolution: true,
  });
  const finalText = await generateGeminiText({
    prompt: finalPrompt,
    mode: 'text',
  });
  const resolutionPages = parsePages(finalText).slice(0, 5);

  if (resolutionPages.length < 3) {
    throw new ApiError(502, 'Final resolution must have at least 3 pages');
  }

  const finalNodeId = randomUUID();
  const persistedResolution = await mapGeneratedPages({
    pages: resolutionPages,
    pageOffset: linearPages.length,
    seedPrefix: 'final',
  });

  await dbV2
    .update(InteractiveStoryNodes)
    .set({ isActive: false, selectedChoice })
    .where(eq(InteractiveStoryNodes.nodeId, activeNode.nodeId));

  await dbV2.insert(InteractiveStoryNodes).values({
    nodeId: finalNodeId,
    storyId: story.storyId,
    parentNodeId: activeNode.nodeId,
    depth: Math.min(MAX_DEPTH, Number(activeNode.depth ?? 0) + 1),
    choiceTaken: selectedChoice,
    choices: null,
    selectedChoice: null,
    pages: persistedResolution,
    isActive: false,
    createdAt: new Date(),
  });

  const refreshedNodes = await listStoryNodes(story.storyId);
  const finalNode = refreshedNodes.find(node => node.nodeId === finalNodeId);
  const chain = getLinearNodes({
    activeNode: finalNode,
    nodes: refreshedNodes,
  });
  const compiledPages = chain.flatMap(node => node.pages ?? []);

  await dbV2
    .update(InteractiveStories)
    .set({
      status: 'completed',
      currentNodeId: finalNodeId,
      totalPages: compiledPages.length,
      compiledPages,
      updatedAt: new Date(),
    })
    .where(eq(InteractiveStories.storyId, story.storyId));

  const finalSlug = await saveCompletedToClassicStory({
    story,
    pages: compiledPages,
    finalTitle: story.title,
  });

  return {
    completedSlug: finalSlug,
    story: {
      ...story,
      status: 'completed',
      currentNodeId: finalNodeId,
      totalPages: compiledPages.length,
      compiledPages,
    },
    nodes: refreshedNodes,
  };
};

export const continueInteractiveStory = async ({
  userId,
  storyId,
  selectedChoice,
}) => {
  const safeChoice = String(selectedChoice ?? '').trim();
  if (!safeChoice) throw new ApiError(400, 'Selected choice is required');

  const { story } = await ensureOwnedStory({ userId, storyId });
  if (story.status === 'completed')
    throw new ApiError(409, 'Story is already completed');

  const nodes = await listStoryNodes(story.storyId);
  const activeNode = getActiveNode(nodes);
  if (!activeNode) throw new ApiError(404, 'Active story node not found');
  if (activeNode.selectedChoice)
    throw new ApiError(409, 'This branch is already locked');

  if (Number(activeNode.depth ?? 0) >= MAX_DEPTH) {
    return completeInteractiveStory({
      userId,
      storyId,
      selectedChoice: safeChoice,
    });
  }

  const linearNodes = getLinearNodes({ activeNode, nodes });
  const linearPages = linearNodes.flatMap(node => node.pages ?? []);
  const continuationPrompt = buildContinuationPrompt({
    title: story.title,
    selectedChoice: safeChoice,
    context: makePageContext(linearPages, 6),
    minPages: 3,
    maxPages: 6,
  });

  const continuationText = await generateGeminiText({
    prompt: continuationPrompt,
    mode: 'text',
  });
  const payload = parseContinuationPayload(continuationText);
  const pages = payload.pages.slice(0, 6);
  const choices =
    payload.choices.length >= 2
      ? payload.choices.slice(0, 2)
      : CONTINUATION_FALLBACK_CHOICES;

  if (pages.length < 3) {
    throw new ApiError(502, 'Each continuation must have minimum 3 pages');
  }

  const nextNodeId = randomUUID();
  const persistedPages = await mapGeneratedPages({
    pages,
    pageOffset: linearPages.length,
    seedPrefix: 'branch',
  });

  await dbV2
    .update(InteractiveStoryNodes)
    .set({ isActive: false, selectedChoice: safeChoice })
    .where(eq(InteractiveStoryNodes.nodeId, activeNode.nodeId));

  await dbV2.insert(InteractiveStoryNodes).values({
    nodeId: nextNodeId,
    storyId: story.storyId,
    parentNodeId: activeNode.nodeId,
    depth: Number(activeNode.depth ?? 0) + 1,
    choiceTaken: safeChoice,
    choices,
    selectedChoice: null,
    pages: persistedPages,
    isActive: true,
    createdAt: new Date(),
  });

  await dbV2
    .update(InteractiveStories)
    .set({
      currentNodeId: nextNodeId,
      totalPages: linearPages.length + persistedPages.length,
      updatedAt: new Date(),
    })
    .where(eq(InteractiveStories.storyId, story.storyId));

  const refreshedStory = {
    ...story,
    currentNodeId: nextNodeId,
    totalPages: linearPages.length + persistedPages.length,
  };
  return getInteractiveState(refreshedStory);
};
