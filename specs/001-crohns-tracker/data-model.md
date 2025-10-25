# Data Model: Crohns Symptom Tracker

**Date**: 2025-10-25
**Feature**: Crohns Symptom Tracker
**Phase**: Data Model Design

## Core Entities

### Entry (Base Entity)
Base record for all user-logged data with common attributes.

**Fields**:
- `id`: Unique identifier (Primary Key, Auto-increment)
- `type`: Entry type enumeration ('bowel_movement' | 'note')
- `date`: Date of the entry (ISO date string: YYYY-MM-DD)
- `time`: Time of the entry (24-hour format: HH:MM)
- `timestamp`: Full ISO timestamp for precise ordering
- `created_at`: Record creation timestamp
- `updated_at`: Record last modified timestamp

**Validation Rules**:
- `id`: Required, auto-generated
- `type`: Required, must be one of valid enum values
- `date`: Required, must be valid ISO date, cannot be future date
- `time`: Required, must be valid 24-hour format
- `timestamp`: Required, auto-generated from date + time
- `created_at`, `updated_at`: Auto-managed by system

### BowelMovement (Specialized Entry)
Extends Entry with bowel movement specific data.

**Fields** (inherits all Entry fields plus):
- `entry_id`: Foreign key reference to Entry
- `consistency`: Bristol Stool Chart rating (1-7 scale)
- `urgency`: Urgency level (1-4 scale: 1=none, 2=mild, 3=moderate, 4=urgent)
- `notes`: Optional user notes (text, max 500 characters)

**Validation Rules**:
- `entry_id`: Required, valid foreign key
- `consistency`: Required, integer between 1-7 inclusive
- `urgency`: Required, integer between 1-4 inclusive
- `notes`: Optional, max 500 characters

**Bristol Scale Reference**:
1. Separate hard lumps
2. Sausage-shaped but lumpy
3. Sausage-shaped with cracks
4. Sausage-shaped, smooth and soft
5. Soft blobs with clear edges
6. Fluffy pieces with ragged edges
7. Watery, no solid pieces

**Urgency Scale Reference**:
1. None - No urgency felt
2. Mild - Slight urgency, can wait
3. Moderate - Need to go soon
4. Urgent - Immediate need

### Note (Specialized Entry)
Extends Entry with contextual note data.

**Fields** (inherits all Entry fields plus):
- `entry_id`: Foreign key reference to Entry
- `category`: Note category ('food' | 'exercise' | 'medication' | 'other')
- `content`: Note text content (max 1000 characters)
- `tags`: Optional comma-separated tags for categorization

**Validation Rules**:
- `entry_id`: Required, valid foreign key
- `category`: Required, must be one of valid enum values
- `content`: Required, min 1 character, max 1000 characters
- `tags`: Optional, comma-separated format

**Category Definitions**:
- `food`: Meals, snacks, beverages, dietary changes
- `exercise`: Physical activity, sports, walking, stress
- `medication`: Prescriptions, supplements, dosage changes
- `other`: Sleep, stress, environmental factors, general observations

## Database Schema (SQLite with Drizzle ORM)

```typescript
// Enums
export const entryTypeEnum = ['bowel_movement', 'note'] as const;
export const noteCategoryEnum = ['food', 'exercise', 'medication', 'other'] as const;

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
```

## Relationships

### Entry → BowelMovement (1:0..1)
- One entry can have zero or one bowel movement record
- Cascade delete: removing entry removes associated bowel movement

### Entry → Note (1:0..1)
- One entry can have zero or one note record
- Cascade delete: removing entry removes associated note

## Indexes for Performance

```sql
-- Optimize date-based queries (calendar navigation)
CREATE INDEX idx_entries_date ON entries(date);

-- Optimize timeline queries (daily view)
CREATE INDEX idx_entries_timestamp ON entries(timestamp);

-- Optimize type-based filtering
CREATE INDEX idx_entries_type ON entries(type);

-- Optimize category-based note queries
CREATE INDEX idx_notes_category ON notes(category);
```

## Data Access Patterns

### Common Queries

1. **Get entries for specific date**:
   ```typescript
   const dayEntries = await db
     .select()
     .from(entries)
     .where(eq(entries.date, targetDate))
     .orderBy(entries.timestamp);
   ```

2. **Get entries with details for date range**:
   ```typescript
   const entriesWithDetails = await db
     .select()
     .from(entries)
     .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
     .leftJoin(notes, eq(entries.id, notes.entryId))
     .where(between(entries.date, startDate, endDate))
     .orderBy(entries.timestamp);
   ```

3. **Export data for date range**:
   ```typescript
   const exportData = await db
     .select({
       date: entries.date,
       time: entries.time,
       type: entries.type,
       consistency: bowelMovements.consistency,
       urgency: bowelMovements.urgency,
       category: notes.category,
       content: notes.content,
       notes: bowelMovements.notes,
     })
     .from(entries)
     .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
     .leftJoin(notes, eq(entries.id, notes.entryId))
     .where(between(entries.date, startDate, endDate))
     .orderBy(entries.timestamp);
   ```

## State Transitions

### Entry Lifecycle
1. **Draft**: User starts creating entry
2. **Validating**: Client-side validation occurs
3. **Persisted**: Successfully saved to local database
4. **Updated**: Entry modified after creation
5. **Deleted**: Entry marked for deletion (soft delete possible)

### Data Integrity Rules
- Entries cannot be created for future dates beyond today
- Bowel movement consistency and urgency must be within valid ranges
- Notes must have non-empty content
- Timestamps must be chronologically consistent
- Foreign key constraints maintain referential integrity

## Migration Strategy

### Initial Schema Creation
```sql
-- V001: Create initial tables
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('bowel_movement', 'note')),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bowel_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  consistency INTEGER NOT NULL CHECK (consistency BETWEEN 1 AND 7),
  urgency INTEGER NOT NULL CHECK (urgency BETWEEN 1 AND 4),
  notes TEXT,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'exercise', 'medication', 'other')),
  content TEXT NOT NULL,
  tags TEXT,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);
```

This data model provides a normalized, performant structure for storing Crohns symptom tracking data with proper validation, relationships, and query optimization for the mobile application requirements.