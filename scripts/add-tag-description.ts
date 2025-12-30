/**
 * Add Description Column Migration
 *
 * Run this script to add the description column to the day_tags table.
 * Usage: npx tsx scripts/add-tag-description.ts
 */

import { openDatabaseSync } from 'expo-sqlite';

async function applyMigration() {
  try {
    console.log('Opening database...');
    const db = openDatabaseSync('crohns_tracker.db');

    console.log('Adding description column to day_tags table...');
    
    // Check if column exists first
    const tableInfo = db.getAllSync('PRAGMA table_info(day_tags);');
    const hasDescription = tableInfo.some((col: any) => col.name === 'description');
    
    if (hasDescription) {
      console.log('⚠️  Description column already exists, skipping migration');
      return;
    }

    // Add description column
    db.execSync('ALTER TABLE day_tags ADD COLUMN description TEXT;');

    console.log('✅ Migration applied successfully!');

    // Verify column was added
    const updatedTableInfo = db.getAllSync('PRAGMA table_info(day_tags);');
    console.log('Updated table structure:', updatedTableInfo);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

applyMigration();
