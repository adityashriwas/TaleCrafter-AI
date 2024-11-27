import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./config/schema.tsx",  
  dialect: "postgresql",
  dbCredentials:{
    url: "postgresql://StoryBookDB_owner:Zia3LW5TYNts@ep-lucky-tooth-a54i94mf.us-east-2.aws.neon.tech/StoryBookDB?sslmode=require",
  },
  verbose: true,
  strict: true,
});
