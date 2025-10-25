import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
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

// Type exports for use in application
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
export type BowelMovement = typeof bowelMovements.$inferSelect;
export type NewBowelMovement = typeof bowelMovements.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;