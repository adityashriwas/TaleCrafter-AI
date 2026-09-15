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
  const model = genAI.getGenerativeModel({ model: modelName ?? getModelName() });

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

  if (mode === 'image-analysis') {
    const apiKey =
      process.env.GEMINI_API_KEY_IMAGE_ANALYSIS ?? process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new ApiError(500, 'Gemini image analysis key is not configured');
    }

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

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ApiError(500, 'Gemini API key is not configured');
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
