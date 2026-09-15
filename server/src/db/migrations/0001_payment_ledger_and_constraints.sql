-- Payment ledger and baseline production constraints.
-- Run after verifying there are no duplicate story/user identifiers in existing data.

CREATE TABLE IF NOT EXISTS payments (
  id serial PRIMARY KEY,
  provider varchar(40) NOT NULL DEFAULT 'stripe',
  "providerSessionId" varchar(255) NOT NULL,
  "providerPaymentIntentId" varchar(255),
  "userEmail" varchar NOT NULL,
  "planId" varchar(80) NOT NULL,
  "amountCents" integer NOT NULL,
  currency varchar(10) NOT NULL DEFAULT 'usd',
  credits integer NOT NULL,
  status varchar(40) NOT NULL DEFAULT 'pending',
  "rawEvent" json,
  "fulfilledAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_session_unique_idx
  ON payments ("providerSessionId");
CREATE INDEX IF NOT EXISTS payments_user_email_idx ON payments ("userEmail");
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);

ALTER TABLE "storyData" ALTER COLUMN "storyId" SET NOT NULL;
ALTER TABLE "storyData" ALTER COLUMN slug SET NOT NULL;
ALTER TABLE "storyData" ALTER COLUMN "userEmail" SET NOT NULL;
ALTER TABLE users ALTER COLUMN "userEmail" SET NOT NULL;
ALTER TABLE users ALTER COLUMN credit SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS story_data_story_id_unique_idx ON "storyData" ("storyId");
CREATE UNIQUE INDEX IF NOT EXISTS users_user_email_unique_idx ON users ("userEmail");

ALTER TABLE "interactiveStories_v2" ALTER COLUMN "storyId" SET NOT NULL;
ALTER TABLE "interactiveStories_v2" ALTER COLUMN "userEmail" SET NOT NULL;
ALTER TABLE "interactiveStories_v2" ALTER COLUMN status SET NOT NULL;
ALTER TABLE "interactiveStories_v2" ALTER COLUMN "rootNodeId" SET NOT NULL;
ALTER TABLE "interactiveStories_v2" ALTER COLUMN "currentNodeId" SET NOT NULL;
ALTER TABLE "interactiveStories_v2" ALTER COLUMN "totalPages" SET NOT NULL;
ALTER TABLE "interactiveStoryNodes_v2" ALTER COLUMN "nodeId" SET NOT NULL;
ALTER TABLE "interactiveStoryNodes_v2" ALTER COLUMN "storyId" SET NOT NULL;
ALTER TABLE "interactiveStoryNodes_v2" ALTER COLUMN depth SET NOT NULL;
ALTER TABLE "interactiveStoryNodes_v2" ALTER COLUMN "isActive" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS interactive_stories_story_id_unique_idx
  ON "interactiveStories_v2" ("storyId");
CREATE UNIQUE INDEX IF NOT EXISTS interactive_story_nodes_node_id_unique_idx
  ON "interactiveStoryNodes_v2" ("nodeId");
