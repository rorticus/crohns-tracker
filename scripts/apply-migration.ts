/**
 * Manual Migration Script
 *
 * Run this script to manually apply the day tags migration to your database.
 * Usage: npx tsx scripts/apply-migration.ts
 */

import { openDatabaseSync } from 'expo-sqlite';

async function applyMigration() {
  try {
    console.log('Opening database...');
    const db = openDatabaseSync('crohns_tracker.db');

    console.log('Creating day_tags table...');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS day_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        usage_count INTEGER DEFAULT 0 NOT NULL
      );
    `);

    console.log('Creating indexes for day_tags...');
    db.execSync('CREATE UNIQUE INDEX IF NOT EXISTS day_tags_name_unique ON day_tags(name);');
    db.execSync('CREATE INDEX IF NOT EXISTS idx_day_tags_name ON day_tags(name);');

    console.log('Creating day_tag_associations table...');
    db.execSync(`
      CREATE TABLE IF NOT EXISTS day_tag_associations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (tag_id) REFERENCES day_tags(id) ON DELETE CASCADE
      );
    `);

    console.log('Creating indexes for day_tag_associations...');
    db.execSync('CREATE INDEX IF NOT EXISTS idx_day_tag_assoc_date ON day_tag_associations(date);');
    db.execSync('CREATE INDEX IF NOT EXISTS idx_day_tag_assoc_tag_id ON day_tag_associations(tag_id);');
    db.execSync('CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_tag_date ON day_tag_associations(tag_id, date);');

    console.log('✅ Migration applied successfully!');

    // Verify tables exist
    const tables = db.getAllSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'day_%'"
    );
    console.log('Created tables:', tables);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

applyMigration();
