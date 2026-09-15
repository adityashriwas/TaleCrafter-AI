import { GoogleGenerativeAI, type Content, type GenerationConfig } from "@google/generative-ai";

type StoryChatOptions = {
  apiKey: string;
  modelName?: string;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

export const storyGenerationConfig: GenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Few-shot history keeps the output structure stable for classic story generation.
const storyHistory: Content[] = [
  {
    role: "user",
    parts: [
      {
        text: `Create a story in strict JSON with this shape:
{
  "title": "Story title",
  "coverImagePrompt": "cover prompt",
  "characterDescriptions": {
    "character1": "name and visual details"
  },
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "chapter title",
      "textPrompt": "chapter narrative",
      "imagePrompt": "image prompt with spaces replaced by hyphens"
    }
  ]
}
Rules:
- Return only valid JSON.
- No markdown wrappers.
- Keep character descriptions consistent across chapters.
- Keep chapterNumber sequential.
- Keep imagePrompt URL-safe style with hyphen-separated words.`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify(
          {
            title: "The Cursed Academy",
            coverImagePrompt:
              "anime-style-dark-horror-book-cover-young-boy-before-gothic-school-with-glowing-symbols",
            characterDescriptions: {
              character1:
                "Yuki - A 16-year-old boy with short messy black hair, blue eyes, dark school uniform and a glowing wrist scar.",
              character2:
                "Akari - A girl with long crimson hair, red eyes, gothic uniform and a spirit lantern.",
            },
            chapters: [
              {
                chapterNumber: 1,
                title: "Arrival at the Haunted School",
                textPrompt:
                  "Yuki arrives at Kuroyami Academy where strange whispers echo in the halls and Akari warns him about hidden dangers.",
                imagePrompt:
                  "yuki-akari-anime-style-dark-horror-illustration-gothic-school-glowing-cursed-symbols-shadow-figures",
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

export const createStoryChatSession = ({ apiKey, modelName }: StoryChatOptions) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
  });

  return model.startChat({
    generationConfig: storyGenerationConfig,
    history: storyHistory,
  });
};
