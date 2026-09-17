import { GoogleGenerativeAI } from '@google/generative-ai';
import ApiError from '../utils/ApiError.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export const storyGenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

const storyShapePrompt = [
  'Create a story in strict JSON with this shape:',
  '{',
  '  "title": "Story title",',
  '  "coverImagePrompt": "cover prompt",',
  '  "characterDescriptions": {',
  '    "character1": "name and visual details"',
  '  },',
  '  "chapters": [',
  '    {',
  '      "chapterNumber": 1,',
  '      "title": "chapter title",',
  '      "textPrompt": "chapter narrative",',
  '      "imagePrompt": "image prompt with spaces replaced by hyphens"',
  '    }',
  '  ]',
  '}',
  'Rules:',
  '- Return only valid JSON.',
  '- No markdown wrappers.',
  '- Keep character descriptions consistent across chapters.',
  '- Keep chapterNumber sequential.',
  '- Keep imagePrompt URL-safe style with hyphen-separated words.',
].join('\n');

const storyHistory = [
  {
    role: 'user',
    parts: [{ text: storyShapePrompt }],
  },
  {
    role: 'model',
    parts: [
      {
        text: JSON.stringify(
          {
            title: 'The Cursed Academy',
            coverImagePrompt:
              'anime-style-dark-horror-book-cover-young-boy-before-gothic-school-with-glowing-symbols',
            characterDescriptions: {
              character1:
                'Yuki - A 16-year-old boy with short messy black hair, blue eyes, dark school uniform and a glowing wrist scar.',
              character2:
                'Akari - A girl with long crimson hair, red eyes, gothic uniform and a spirit lantern.',
            },
            chapters: [
              {
                chapterNumber: 1,
                title: 'Arrival at the Haunted School',
                textPrompt:
                  'Yuki arrives at Kuroyami Academy where strange whispers echo in the halls and Akari warns him about hidden dangers.',
                imagePrompt:
                  'yuki-akari-anime-style-dark-horror-illustration-gothic-school-glowing-cursed-symbols-shadow-figures',
              },
            ],
          },
          null,
          2
        ),
      },
    ],
  },
];

const getModelName = () => process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

const createStoryChatSession = ({ apiKey, modelName }) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  return model.startChat({
    generationConfig: storyGenerationConfig,
    history: storyHistory,
  });
};

export const generateGeminiText = async ({
  prompt,
  mode = 'text',
  imageBase64,
  mimeType,
}) => {
  const safePrompt = String(prompt ?? '').trim();

  if (!safePrompt) {
    throw new ApiError(400, 'Prompt is required');
  }

  const modelName = getModelName();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiError(500, 'Gemini API key is not configured');
  }

  if (mode === 'image-analysis') {
    if (!imageBase64) {
      throw new ApiError(400, 'Image data is required for image analysis');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent([
      safePrompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType ?? 'image/jpeg',
        },
      },
    ]);

    return result.response.text();
  }

  if (mode === 'story-generation') {
    const storyChat = createStoryChatSession({ apiKey, modelName });
    const result = await storyChat.sendMessage(safePrompt);
    return result.response.text();
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: storyGenerationConfig,
  });
  const result = await model.generateContent(safePrompt);

  return result.response.text();
};

const DEFAULT_CREATE_STORY_PROMPT = [
  'Generate a story for {ageGroup} age group.',
  'Story type: {storyType}.',
  'Story subject: {storySubject}.',
  'Image style: {imageStyle}.',
  'Return only strict JSON with title, coverImagePrompt, characterDescriptions, and chapters.',
].join('\n');

export const buildStoryPrompt = ({
  ageGroup,
  storyType,
  storySubject,
  imageStyle,
}) => {
  const template =
    process.env.CREATE_STORY_PROMPT ||
    process.env.NEXT_PUBLIC_CREATE_STORY_PROMPT ||
    DEFAULT_CREATE_STORY_PROMPT;
  return template
    .replaceAll('{ageGroup}', String(ageGroup ?? ''))
    .replaceAll('{storyType}', String(storyType ?? ''))
    .replaceAll('{storySubject}', String(storySubject ?? ''))
    .replaceAll('{imageStyle}', String(imageStyle ?? ''));
};

const cleanJsonText = raw =>
  String(raw ?? '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

const normalizeJsonCandidate = raw =>
  String(raw ?? '')
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

export const tryParseGeminiJson = raw => {
  const cleaned = cleanJsonText(raw);
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const candidates = [
    cleaned,
    firstBrace >= 0 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : '',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      return JSON.parse(normalizeJsonCandidate(candidate));
    } catch {
      // Try the next candidate.
    }
  }

  return null;
};

const buildJsonRepairPrompt = brokenJson => `
You are a strict JSON repair assistant.
Fix the JSON below so it is syntactically valid while preserving the original meaning and fields.
Return ONLY valid JSON. No markdown fences. No explanation.

${brokenJson}
`;

export const generateStoryJson = async ({ formData, interactive = false }) => {
  const basePrompt = buildStoryPrompt(formData);
  const prompt = interactive
    ? `${basePrompt}\n\nFor interactive story starter, return 6 to 8 chapters minimum in consistent JSON format. No markdown wrappers.`
    : basePrompt;
  const outputText = await generateGeminiText({
    prompt,
    mode: 'story-generation',
  });
  let story = tryParseGeminiJson(outputText);

  if (!story && interactive) {
    const repairedText = await generateGeminiText({
      prompt: buildJsonRepairPrompt(cleanJsonText(outputText)),
      mode: 'text',
    });
    story = tryParseGeminiJson(repairedText);
  }

  if (!story) {
    throw new ApiError(502, 'Gemini response is not valid story JSON');
  }

  if (!Array.isArray(story?.chapters) || story.chapters.length === 0) {
    throw new ApiError(502, 'Generated story does not contain chapters');
  }

  return story;
};
