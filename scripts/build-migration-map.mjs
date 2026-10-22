import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";

// Operator-only script: use the adjacent current app's tooling, never deploy-time credentials.
const require = createRequire(
  new URL("../../server/package.json", import.meta.url),
);
const { neon } = require("@neondatabase/serverless");
const { parse } = require("dotenv");
const env = parse(
  await readFile(new URL("../../server/.env", import.meta.url)),
);
if (!env.LEGACY_DATABASE_URL || !env.PRODUCTION_DATABASE_URL)
  throw new Error("Legacy and production database URLs are required.");
const source = neon(env.LEGACY_DATABASE_URL);
const target = neon(env.PRODUCTION_DATABASE_URL);
const old =
  await source`SELECT "storyId" AS id, slug, 'classic' AS kind FROM public."storyData" UNION ALL SELECT "storyId", slug, 'interactive' FROM public."interactiveStories_v2"`;
const current =
  await target`SELECT public_id, slug FROM app.stories WHERE status = 'published'`;
const slugs = new Map(
  current.map((story) => [String(story.public_id), story.slug]),
);
const redirects = {};
let matched = 0;
for (const story of old) {
  const slug = slugs.get(String(story.id));
  if (!slug) continue;
  const destination = `/story/${encodeURIComponent(slug)}`;
  const paths = [`/view-story/${encodeURIComponent(story.id)}`];
  if (story.slug) paths.push(`/story/${encodeURIComponent(story.slug)}`);
  if (story.kind === "interactive")
    paths.push(`/interactive-story/${encodeURIComponent(story.id)}`);
  for (const path of paths) {
    if (redirects[path] && redirects[path] !== destination)
      throw new Error(
        "Conflicting legacy story paths; resolve before deployment.",
      );
    redirects[path] = destination;
  }
  matched++;
}
if (!matched)
  throw new Error("No matching published stories; refusing an empty map.");
await writeFile(
  new URL("../lib/story-redirects.json", import.meta.url),
  `${JSON.stringify(redirects, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    matchedStories: matched,
    unmatchedStories: old.length - matched,
    redirects: Object.keys(redirects).length,
  }),
);
