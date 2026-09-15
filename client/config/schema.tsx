import { index, json, pgTable, serial, text, uniqueIndex, varchar, integer } from "drizzle-orm/pg-core";

export const StoryData = pgTable('storyData', {
    id:serial('id').primaryKey(),
    storyId: varchar('storyId'),
    slug: varchar('slug', { length: 90 }),
    storySubject: text('storySubject'),
    storyType: varchar('storyType'),
    ageGroup: varchar('ageGroup'),
    imageStyle: varchar('imageStyle'),
    coverImage: varchar('coverImage'),
    output: json('output'),
    userName: varchar('userName'),
    userImage: varchar('userImage'),
    userEmail: varchar('userEmail'),
}, (table) => ({
    storyIdIdx: index('story_data_story_id_idx').on(table.storyId),
    slugIdx: index('story_data_slug_idx').on(table.slug),
    slugUniqueIdx: uniqueIndex('story_data_slug_unique_idx').on(table.slug),
})) 

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    userName : varchar('userName'),
    userEmail : varchar('userEmail'),
    userImage : varchar('userImage'),
    credit : integer('credit').default(5),
})
