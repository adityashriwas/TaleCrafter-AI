export type InteractivePage = {
  pageNumber: number;
  title: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
};

const cleanJsonText = (raw: string) =>
  raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

export const buildChoicePrompt = (recentText: string) => `
You are continuing an interactive story.
Based on this latest story context:\n${recentText}\n
Return ONLY valid JSON in this exact format:
{
  "choices": ["choice 1", "choice 2"]
}
Rules:
- Exactly 2 choices
- Each choice between 6 and 14 words
- Choices must feel meaningful and branch-worthy
- No title, no recap, no explanation
`;

export const buildContinuationPrompt = ({
  title,
  selectedChoice,
  context,
  minPages,
  maxPages,
  finalResolution = false,
}: {
  title: string;
  selectedChoice: string;
  context: string;
  minPages: number;
  maxPages: number;
  finalResolution?: boolean;
}) => `
Continue the same story world and characters.
Story title: ${title}
Chosen path: ${selectedChoice}
Existing context:\n${context}\n
Return ONLY valid JSON in this exact format:
{
  "pages": [
    {
      "pageNumber": 1,
      "title": "Short page title",
      "text": "Narrative text for this page",
      "imagePrompt": "Detailed visual prompt for this page image"
    }
  ],
  "choices": ["choice 1", "choice 2"]
}
Rules:
- Output ${minPages} to ${maxPages} pages
- This is a continuation, not a restart
- Do not add global title, no recap, no meta commentary
- Keep narrative coherent with previous context
- Make each page substantial, not one-liners
${
  finalResolution
    ? "- This is the final resolution arc: close major threads with an emotionally satisfying ending\n- For final resolution, return choices as an empty array"
    : "- Leave room for the next choice at the end\n- Include exactly 2 meaningful choices for the next branch"
}
`;

export const parseChoices = (raw: string): string[] => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const choices = Array.isArray(parsed?.choices) ? parsed.choices : [];
  return choices
    .slice(0, 2)
    .filter((item: unknown): item is string => typeof item === "string");
};

export const parsePages = (raw: string): InteractivePage[] => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];

  return pages
    .map((page: any, index: number) => ({
      pageNumber: Number(page?.pageNumber ?? index + 1),
      title: String(page?.title ?? `Page ${index + 1}`),
      text: String(page?.text ?? ""),
      imagePrompt: String(page?.imagePrompt ?? "").trim(),
    }))
    .filter((page: InteractivePage) => page.text.length > 0);
};

export const parseContinuationPayload = (raw: string): {
  pages: InteractivePage[];
  choices: string[];
} => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const pages = parsePages(raw);
  const choices = Array.isArray(parsed?.choices)
    ? parsed.choices
        .slice(0, 2)
        .filter((item: unknown): item is string => typeof item === "string")
    : [];

  return {
    pages,
    choices,
  };
};

export const createUniqueImageUrl = (prompt: string, seed: string | number) => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://gen.pollinations.ai/image/${encodedPrompt}?model=${process.env.NEXT_PUBLIC_POLLINATIONS_AI_MODEL}&enhance=false&negative_prompt=worst+quality%2C+blurry&safe=false&seed=${seed}&key=${process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY}`;
};

export const makePageContext = (pages: InteractivePage[], maxPages = 4) => {
  const recent = pages.slice(-maxPages);
  return recent
    .map((page, index) => `Page ${index + 1} | ${page.title}: ${page.text}`)
    .join("\n");
};
