import {
  index,
  integer,
  json,
  timestamp,
  pgTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const StoryData = pgTable(
  'storyData',
  {
    id: serial('id').primaryKey(),
    storyId: varchar('storyId').notNull(),
    slug: varchar('slug', { length: 90 }).notNull(),
    storySubject: text('storySubject'),
    storyType: varchar('storyType'),
    ageGroup: varchar('ageGroup'),
    imageStyle: varchar('imageStyle'),
    coverImage: varchar('coverImage'),
    output: json('output'),
    userName: varchar('userName'),
    userImage: varchar('userImage'),
    userEmail: varchar('userEmail').notNull(),
  },
  table => ({
    storyIdIdx: index('story_data_story_id_idx').on(table.storyId),
    storyIdUniqueIdx: uniqueIndex('story_data_story_id_unique_idx').on(
      table.storyId
    ),
    slugIdx: index('story_data_slug_idx').on(table.slug),
    slugUniqueIdx: uniqueIndex('story_data_slug_unique_idx').on(table.slug),
  })
);

export const Users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    userName: varchar('userName'),
    userEmail: varchar('userEmail').notNull(),
    userImage: varchar('userImage'),
    credit: integer('credit').default(5).notNull(),
  },
  table => ({
    userEmailUniqueIdx: uniqueIndex('users_user_email_unique_idx').on(
      table.userEmail
    ),
  })
);

export const Payments = pgTable(
  'payments',
  {
    id: serial('id').primaryKey(),
    provider: varchar('provider', { length: 40 }).notNull().default('stripe'),
    providerSessionId: varchar('providerSessionId', { length: 255 }).notNull(),
    providerPaymentIntentId: varchar('providerPaymentIntentId', {
      length: 255,
    }),
    userEmail: varchar('userEmail').notNull(),
    planId: varchar('planId', { length: 80 }).notNull(),
    amountCents: integer('amountCents').notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('usd'),
    credits: integer('credits').notNull(),
    status: varchar('status', { length: 40 }).notNull().default('pending'),
    rawEvent: json('rawEvent'),
    fulfilledAt: timestamp('fulfilledAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  },
  table => ({
    providerSessionUniqueIdx: uniqueIndex(
      'payments_provider_session_unique_idx'
    ).on(table.providerSessionId),
    userEmailIdx: index('payments_user_email_idx').on(table.userEmail),
    statusIdx: index('payments_status_idx').on(table.status),
  })
);
