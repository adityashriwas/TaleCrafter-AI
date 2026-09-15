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

export const parseChoices = raw => {
  const parsed = JSON.parse(cleanJsonText(raw));
  const choices = Array.isArray(parsed?.choices) ? parsed.choices : [];
  return choices.slice(0, 2).filter(item => typeof item === 'string');
};

export const makePageContext = (pages, maxPages = 4) => {
  const recent = pages.slice(-maxPages);
  return recent
    .map((page, index) => `Page ${index + 1} | ${page.title}: ${page.text}`)
    .join('\n');
};
