ALTER TABLE "interactiveStories_v2" ADD COLUMN IF NOT EXISTS "slug" varchar(90);

CREATE INDEX IF NOT EXISTS "interactive_stories_story_id_idx" ON "interactiveStories_v2" ("storyId");
CREATE INDEX IF NOT EXISTS "interactive_stories_slug_idx" ON "interactiveStories_v2" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "interactive_stories_slug_unique_idx" ON "interactiveStories_v2" ("slug");
