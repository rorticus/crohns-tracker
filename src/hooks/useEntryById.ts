import { db } from "@/db/client";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { bowelMovements, entries, notes } from "../db/schema";

export default function useEntryById(entryId: number) {
  return useLiveQuery(
    db
      .select({
        entry: entries,
        bowelMovement: bowelMovements,
        note: notes,
      })
      .from(entries)
      .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
      .leftJoin(notes, eq(entries.id, notes.entryId))
      .where(eq(entries.id, entryId)),
    [entryId]
  );
}
