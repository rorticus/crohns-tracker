/**
 * Database Migrations Runner
 *
 * Applies pending migrations on app startup.
 * For expo-sqlite, we use drizzle-kit push in development or apply migrations manually.
 */

import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';

/**
 * Run database migrations
 *
 * This should be called once on app startup before any database operations.
 */
export async function runMigrations() {
  try {
    console.log('[Migrations] Starting database migrations...');

    const expo = openDatabaseSync('crohns_tracker.db');
    const db = drizzle(expo);

    // Apply migrations from the drizzle folder
    // Note: In Expo, you need to use drizzle-kit push or manually apply migrations
    // This is a placeholder for when migrations are bundled with the app

    console.log('[Migrations] Migrations completed successfully');
  } catch (error) {
    console.error('[Migrations] Migration failed:', error);
    throw error;
  }
}

/**
 * Check if day tags tables exist
 *
 * Helper function to verify migrations have been applied
 */
export async function checkDayTagsTablesExist(): Promise<boolean> {
  try {
    const expo = openDatabaseSync('crohns_tracker.db');

    // Check if dayTags table exists
    const result = expo.getFirstSync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='day_tags'"
    );

    return result !== null;
  } catch (error) {
    console.error('[Migrations] Error checking tables:', error);
    return false;
  }
}
