import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Enums for type safety
export const entryTypeEnum = ['bowel_movement', 'note'] as const;
export const noteCategoryEnum = ['food', 'exercise', 'medication', 'other'] as const;

export type EntryType = typeof entryTypeEnum[number];
export type NoteCategory = typeof noteCategoryEnum[number];

// Base Entry Table
export const entries = sqliteTable('entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: entryTypeEnum }).notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time').notNull(), // HH:MM
  timestamp: text('timestamp').notNull(), // ISO string for sorting
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Bowel Movement Data
export const bowelMovements = sqliteTable('bowel_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  consistency: integer('consistency').notNull(), // 1-7 Bristol scale
  urgency: integer('urgency').notNull(), // 1-4 urgency scale
  notes: text('notes'),
});

// Note Data
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  category: text('category', { enum: noteCategoryEnum }).notNull(),
  content: text('content').notNull(),
  tags: text('tags'), // Comma-separated
});

// Day Tags
export const dayTags = sqliteTable('day_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // Normalized lowercase
  displayName: text('display_name').notNull(), // Original capitalization
  description: text('description'), // Optional description/notes about the tag
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
}, (table) => ({
  nameIdx: index('idx_day_tags_name').on(table.name),
}));

// Day Tag Associations (many-to-many: tags ↔ dates)
export const dayTagAssociations = sqliteTable('day_tag_associations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tagId: integer('tag_id').notNull().references(() => dayTags.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  dateIdx: index('idx_day_tag_assoc_date').on(table.date),
  tagIdIdx: index('idx_day_tag_assoc_tag_id').on(table.tagId),
  uniqueTagDate: unique('idx_unique_tag_date').on(table.tagId, table.date),
}));

// Type exports for use in application
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type BowelMovement = typeof bowelMovements.$inferSelect;
export type NewBowelMovement = typeof bowelMovements.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type DayTag = typeof dayTags.$inferSelect;
export type NewDayTag = typeof dayTags.$inferInsert;
export type DayTagAssociation = typeof dayTagAssociations.$inferSelect;
export type NewDayTagAssociation = typeof dayTagAssociations.$inferInsert;