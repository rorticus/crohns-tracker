import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open database connection
const expo = openDatabaseSync("crohns_tracker.db", {
  enableChangeListener: true, // Enable for live queries
});

// Create Drizzle instance
const db = drizzle(expo, { schema });

export default db;

// Re-export schema tables for easy access
export {
  entries,
  bowelMovements,
  notes,
  dayTags,
  dayTagAssociations,
} from "./schema";

// Re-export database instance as named export
export { db };
