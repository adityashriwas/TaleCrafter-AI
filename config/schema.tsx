import { user } from "@nextui-org/theme";
import { pgTable, text, serial, varchar, json, integer } from "drizzle-orm/pg-core";

export const StoryData = pgTable('storyData', {
    id:serial('id').primaryKey(),
    storyId: varchar('storyId'),
    storySubject: text('storySubject'),
    storyType: varchar('storyType'),
    ageGroup: varchar('ageGroup'),
    imageStyle: varchar('imageStyle'),
    coverImage: varchar('coverImage'),
    output: json('output'),
    userName: varchar('userName'),
    userImage: varchar('userImage'),
    userEmail: varchar('userEmail'),
}) 

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    userName : varchar('userName'),
    userEmail : varchar('userEmail'),
    userImage : varchar('userImage'),
    credit : integer('credit').default(5),
})