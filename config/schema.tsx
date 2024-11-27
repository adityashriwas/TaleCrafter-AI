import { pgTable, text, serial, varchar, json } from "drizzle-orm/pg-core";

export const StoryData = pgTable('storyData', {
    id:serial('id'),
    storyId: varchar('storyId'),
    storySubject: text('storySubject'),
    storyType: varchar('storyType'),
    ageGroup: varchar('ageGroup'),
    imageStyle: varchar('imageStyle'),
    coverImage: varchar('coverImage'),
    output: json('output'),
}) 