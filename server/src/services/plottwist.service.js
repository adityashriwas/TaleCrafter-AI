const cleanJsonText = raw =>
  String(raw ?? '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

export const buildChoicePrompt = recentText =>
  [
    'You are continuing an interactive story.',
    `Based on this latest story context:\n${recentText}\n`,
    'Return ONLY valid JSON in this exact format:',
    '{',
    '  "choices": ["choice 1", "choice 2"]',
    '}',
    'Rules:',
    '- Exactly 2 choices',
    '- Each choice between 6 and 14 words',
    '- Choices must feel meaningful and branch-worthy',
    '- No title, no recap, no explanation',
  ].join('\n');

export const buildContinuationPrompt = ({
  title,
  selectedChoice,
  context,
  minPages,
  maxPages,
  finalResolution = false,
}) =>
  [
    'Continue the same story world and characters.',
    `Story title: ${title}`,
    `Chosen path: ${selectedChoice}`,
    `Existing context:\n${context}\n`,
    'Return ONLY valid JSON in this exact format:',
    '{',
    '  "pages": [',
    '    {',
    '      "pageNumber": 1,',
    '      "title": "Short page title",',
    '      "text": "Narrative text for this page",',
    '      "imagePrompt": "Detailed visual prompt for this page image"',
    '    }',
    '  ],',
    '  "choices": ["choice 1", "choice 2"]',
    '}',
    'Rules:',
    `- Output ${minPages} to ${maxPages} pages`,
    '- This is a continuation, not a restart',
    '- Do not add global title, no recap, no meta commentary',
    '- Keep narrative coherent with previous context',
    '- Make each page substantial, not one-liners',
    finalResolution
      ? '- This is the final resolution arc: close major threads with an emotionally satisfying ending\n- For final resolution, return choices as an empty array'
      : '- Leave room for the next choice at the end\n- Include exactly 2 meaningful choices for the next branch',
  ].join('\n');

export const parseChoices = raw => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const choices = Array.isArray(parsed?.choices) ? parsed.choices : [];
  return choices.slice(0, 2).filter(item => typeof item === 'string');
};

export const parsePages = raw => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const pages = Array.isArray(parsed?.pages) ? parsed.pages : [];

  return pages
    .map((page, index) => ({
      pageNumber: Number(page?.pageNumber ?? index + 1),
      title: String(page?.title ?? `Page ${index + 1}`),
      text: String(page?.text ?? ''),
      imagePrompt: String(page?.imagePrompt ?? '').trim(),
    }))
    .filter(page => page.text.length > 0);
};

export const parseContinuationPayload = raw => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const pages = parsePages(raw);
  const choices = Array.isArray(parsed?.choices)
    ? parsed.choices.slice(0, 2).filter(item => typeof item === 'string')
    : [];

  return { pages, choices };
};

export const makePageContext = (pages, maxPages = 4) => {
  const recent = pages.slice(-maxPages);
  return recent
    .map((page, index) => `Page ${index + 1} | ${page.title}: ${page.text}`)
    .join('\n');
};
