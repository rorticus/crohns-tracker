import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Open database connection
const expo = openDatabaseSync("crohns_tracker.db", {
  enableChangeListener: true, // Enable for live queries
});

// Create Drizzle instance
export const db = drizzle(expo, { schema });

export default db;
