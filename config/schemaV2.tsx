import { boolean, integer, json, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const InteractiveStories = pgTable("interactiveStories_v2", {
  id: serial("id").primaryKey(),
  storyId: varchar("storyId"),
  userEmail: varchar("userEmail"),
  userName: varchar("userName"),
  userImage: varchar("userImage"),
  title: text("title"),
  storySubject: text("storySubject"),
  storyType: varchar("storyType"),
  ageGroup: varchar("ageGroup"),
  imageStyle: varchar("imageStyle"),
  status: varchar("status").default("draft"),
  rootNodeId: varchar("rootNodeId"),
  currentNodeId: varchar("currentNodeId"),
  totalPages: integer("totalPages").default(0),
  compiledPages: json("compiledPages"),
  coverImage: varchar("coverImage"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const InteractiveStoryNodes = pgTable("interactiveStoryNodes_v2", {
  id: serial("id").primaryKey(),
  nodeId: varchar("nodeId"),
  storyId: varchar("storyId"),
  parentNodeId: varchar("parentNodeId"),
  depth: integer("depth").default(0),
  choiceTaken: text("choiceTaken"),
  choices: json("choices"),
  selectedChoice: text("selectedChoice"),
  pages: json("pages"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});
