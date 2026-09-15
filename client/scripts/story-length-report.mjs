import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
if (!connectionString) {
  console.error("NO_DB_URL");
  process.exit(2);
}

const sql = neon(connectionString);

const clean = (value = "") =>
  String(value)
    .replace(/\{[^}]*\}/g, " ")
    .replace(
      /(Water ?Color|Watercolor|Anime( style)?|3D ?Cartoon|Oil (Paint|painting)|Comic( book)?|Paper ?Cut|Papercut|Pixel ?Art)[\s\S]*/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();

const toOutput = (raw) => {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
};

const countWords = (text) => {
  const matches = String(text).match(/\b[\p{L}\p{N}']+\b/gu);
  return matches ? matches.length : 0;
};

const getStoryText = (output) => {
  const chapters = Array.isArray(output?.chapters) ? output.chapters : [];
  return chapters
    .map((chapter) => clean(chapter?.textPrompt || ""))
    .join(" ")
    .trim();
};

const rows = await sql('select "storyId", "slug", "output" from "storyData"');

const perStory = rows.map((row) => {
  const output = toOutput(row.output);
  const text = getStoryText(output);
  const words = countWords(text);
  const chars = text.length;

  return {
    storyId: String(row.storyId || ""),
    slug: String(row.slug || ""),
    words,
    chars,
  };
});

const total = perStory.length;
const totals = perStory.reduce(
  (acc, item) => {
    acc.words += item.words;
    acc.chars += item.chars;
    return acc;
  },
  { words: 0, chars: 0 }
);

const withAtLeast = (n) => perStory.filter((item) => item.words >= n).length;

const result = {
  totalStories: total,
  averageWords: total ? Math.round(totals.words / total) : 0,
  averageChars: total ? Math.round(totals.chars / total) : 0,
  minWords: total ? Math.min(...perStory.map((s) => s.words)) : 0,
  maxWords: total ? Math.max(...perStory.map((s) => s.words)) : 0,
  atLeast500Words: withAtLeast(500),
  atLeast700Words: withAtLeast(700),
  atLeast1000Words: withAtLeast(1000),
  pctAtLeast500: total ? Number(((withAtLeast(500) * 100) / total).toFixed(1)) : 0,
  pctAtLeast700: total ? Number(((withAtLeast(700) * 100) / total).toFixed(1)) : 0,
  pctAtLeast1000: total ? Number(((withAtLeast(1000) * 100) / total).toFixed(1)) : 0,
  lowestStories: perStory
    .filter((item) => item.words < 500)
    .sort((a, b) => a.words - b.words)
    .slice(0, 20),
};

console.log(JSON.stringify(result, null, 2));
