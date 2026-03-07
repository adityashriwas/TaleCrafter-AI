ALTER TABLE "storyData" ADD COLUMN IF NOT EXISTS "slug" varchar(90);

CREATE INDEX IF NOT EXISTS "story_data_story_id_idx" ON "storyData" ("storyId");
CREATE INDEX IF NOT EXISTS "story_data_slug_idx" ON "storyData" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "story_data_slug_unique_idx" ON "storyData" ("slug");
