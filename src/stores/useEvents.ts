import { db } from "@/db/client";
import { and, eq, gte, lt } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { bowelMovements, entries, notes } from "../db/schema";

export default function useEvents(filters: {
  year: number;
  month: number;
  day?: number;
}) {
  const { year, month, day } = filters;

  const startDate = new Date(year, month, day ?? 1);
  const endDate = day
    ? new Date(year, month, day + 1)
    : new Date(year, month + 1, 1);

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
      .where(
        and(
          gte(entries.date, startDate.toISOString().split("T")[0]),
          lt(entries.date, endDate.toISOString().split("T")[0])
        )
      )
      .orderBy(entries.date),
    [startDate.toISOString(), endDate.toISOString()]
  );
}
