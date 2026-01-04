import { dayTagAssociations, dayTags, db } from "@/db/client";
import { asc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

export default function useDayTagsForDate(date: string) {
  return useLiveQuery(
    db
      .select({
        id: dayTags.id,
        name: dayTags.name,
        displayName: dayTags.displayName,
        description: dayTags.description,
        createdAt: dayTags.createdAt,
        usageCount: dayTags.usageCount,
      })
      .from(dayTags)
      .innerJoin(dayTagAssociations, eq(dayTagAssociations.tagId, dayTags.id))
      .where(eq(dayTagAssociations.date, date))
      .orderBy(asc(dayTags.displayName)),
    [date]
  );
}
