# Day Tag Descriptions Migration

## Overview

This migration adds the ability to add descriptions/notes to day tags. The description field allows users to document what each tag represents (e.g., "X pills 3x daily", "extra fiber", etc.).

## Changes Made

### Database Schema
- Added `description` TEXT column to `day_tags` table (nullable)

### TypeScript Types
- Updated `DayTag` interface to include optional `description` field
- Updated `CreateTagInput` interface to include optional `description` field

### Service Layer
- Updated `createTag()` to accept and store description for new tags
- `createTag()` returns existing tags unchanged if the tag name already exists
- Added new `updateTagDescription()` function to update tag descriptions
- Updated `getTagsForDate()` to include description field in results

### Store Layer
- Added `updateTagDescription()` action to DayTagStore

### UI Components
- Updated DayTagManager modal to show "Tag Descriptions" section
- Added inline editing UI for tag descriptions
- Each tag can have its description added/edited individually

## Migration Instructions

### For Existing Databases

Run the migration script to add the description column to existing databases:

```bash
npx tsx scripts/add-tag-description.ts
```

This script will:
1. Check if the description column already exists
2. Add the column if it doesn't exist
3. Verify the migration was successful

### For New Installations

The `scripts/apply-migration.ts` script has been updated to include the description column when creating new databases. No additional steps needed.

## Usage

### Adding a Description When Creating a Tag

```typescript
import { createTag } from '@/services/dayTagService';

const tag = await createTag({
  displayName: 'New Medicine',
  description: 'X pills 3x daily'
});
```

### Updating a Tag Description

```typescript
import { updateTagDescription } from '@/services/dayTagService';

const updatedTag = await updateTagDescription(tagId, 'Updated description');

// To clear a description
const clearedTag = await updateTagDescription(tagId, null);
```

### In the UI

1. Open the Day Tag Manager for any date
2. Add or select tags for that day
3. In the "Tag Descriptions" section, click "Add Note" or "Edit" next to any tag
4. Enter the description and click "Save"

## Testing

Tests have been added in `__tests__/services/dayTagService.test.ts`:
- Creating tags with descriptions
- Creating tags without descriptions
- Updating existing tag descriptions
- Clearing tag descriptions

## Backward Compatibility

This change is fully backward compatible:
- Existing tags will have `null` or `undefined` description
- The description field is optional throughout the application
- No breaking changes to existing APIs
