/**
 * Reports Service
 *
 * Business logic for generating reports and statistics for day tags (experiments).
 * Calculates averages, distributions, and other metrics for bowel movements
 * associated with specific day tags.
 */

import { db } from "@/db/client";
import { bowelMovements, entries, dayTags, dayTagAssociations } from "@/db/schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import { getDatesWithTag } from "./dayTagService";

export interface TagStatistics {
  tagId: number;
  tagName: string;
  tagDisplayName: string;
  totalDays: number;
  totalBowelMovements: number;
  averageBowelMovementsPerDay: number;
  averageConsistency: number;
  averageUrgency: number;
  consistencyDistribution: Record<number, number>; // Bristol scale value -> count
  urgencyDistribution: Record<number, number>; // Urgency level -> count
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

/**
 * Get statistics for a specific day tag
 */
export async function getTagStatistics(tagId: number): Promise<TagStatistics | null> {
  // Get the tag
  const tag = await db
    .select()
    .from(dayTags)
    .where(eq(dayTags.id, tagId))
    .get();

  if (!tag) {
    return null;
  }

  // Get all dates with this tag
  const datesWithTag = await getDatesWithTag(tagId);

  if (datesWithTag.length === 0) {
    return {
      tagId: tag.id,
      tagName: tag.name,
      tagDisplayName: tag.displayName,
      totalDays: 0,
      totalBowelMovements: 0,
      averageBowelMovementsPerDay: 0,
      averageConsistency: 0,
      averageUrgency: 0,
      consistencyDistribution: {},
      urgencyDistribution: {},
      dateRange: {
        earliest: null,
        latest: null,
      },
    };
  }

  // Get all bowel movement entries for those dates
  const bmEntries = await db
    .select({
      entryId: entries.id,
      date: entries.date,
      consistency: bowelMovements.consistency,
      urgency: bowelMovements.urgency,
    })
    .from(entries)
    .innerJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
    .where(and(
      eq(entries.type, 'bowel_movement'),
      inArray(entries.date, datesWithTag)
    ));

  // Calculate statistics
  const totalBowelMovements = bmEntries.length;
  const totalDays = datesWithTag.length;

  let totalConsistency = 0;
  let totalUrgency = 0;
  const consistencyDistribution: Record<number, number> = {};
  const urgencyDistribution: Record<number, number> = {};

  for (const entry of bmEntries) {
    totalConsistency += entry.consistency;
    totalUrgency += entry.urgency;

    // Build distributions
    consistencyDistribution[entry.consistency] = (consistencyDistribution[entry.consistency] || 0) + 1;
    urgencyDistribution[entry.urgency] = (urgencyDistribution[entry.urgency] || 0) + 1;
  }

  const averageConsistency = totalBowelMovements > 0
    ? totalConsistency / totalBowelMovements
    : 0;

  const averageUrgency = totalBowelMovements > 0
    ? totalUrgency / totalBowelMovements
    : 0;

  const averageBowelMovementsPerDay = totalBowelMovements / totalDays;

  // Date range
  const sortedDates = [...datesWithTag].sort();
  const earliest = sortedDates[0];
  const latest = sortedDates[sortedDates.length - 1];

  return {
    tagId: tag.id,
    tagName: tag.name,
    tagDisplayName: tag.displayName,
    totalDays,
    totalBowelMovements,
    averageBowelMovementsPerDay,
    averageConsistency,
    averageUrgency,
    consistencyDistribution,
    urgencyDistribution,
    dateRange: {
      earliest,
      latest,
    },
  };
}

/**
 * Get statistics for all day tags
 */
export async function getAllTagStatistics(): Promise<TagStatistics[]> {
  // Get all tags
  const allTags = await db
    .select()
    .from(dayTags)
    .orderBy(dayTags.displayName);

  // Calculate statistics for each tag
  const statistics: TagStatistics[] = [];

  for (const tag of allTags) {
    const stats = await getTagStatistics(tag.id);
    if (stats) {
      statistics.push(stats);
    }
  }

  // Filter out tags with no data and sort by usage
  return statistics
    .filter(stat => stat.totalBowelMovements > 0)
    .sort((a, b) => b.totalBowelMovements - a.totalBowelMovements);
}

/**
 * Get Bristol scale description
 */
export function getBristolScaleDescription(scale: number): string {
  const descriptions: Record<number, string> = {
    1: "Separate hard lumps",
    2: "Lumpy and sausage-like",
    3: "Sausage with cracks",
    4: "Smooth, soft sausage",
    5: "Soft blobs with clear edges",
    6: "Mushy consistency",
    7: "Liquid consistency",
  };
  return descriptions[scale] || "Unknown";
}

/**
 * Get urgency level description
 */
export function getUrgencyLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: "None",
    2: "Mild",
    3: "Moderate",
    4: "Urgent",
  };
  return descriptions[level] || "Unknown";
}

/**
 * Get Bristol scale status color
 * Returns color indicator based on Bristol scale value
 */
export function getBristolScaleColor(scale: number): string {
  // Color indicators based on health status
  // 1-2: constipation (red/orange)
  // 3-5: acceptable range (yellow/green)
  // 6-7: diarrhea (orange/red)
  const colors: Record<number, string> = {
    1: "#EF4444", // red-500
    2: "#F97316", // orange-500
    3: "#EAB308", // yellow-500
    4: "#22C55E", // green-500
    5: "#EAB308", // yellow-500
    6: "#F97316", // orange-500
    7: "#EF4444", // red-500
  };
  return colors[scale] || "#9CA3AF"; // gray-400 for unknown
}

/**
 * Get Bristol scale icon name based on severity
 */
export function getBristolScaleIconName(scale: number): "checkmark-circle" | "warning" | "alert-circle" {
  if (scale === 4) return "checkmark-circle"; // ideal
  if (scale === 3 || scale === 5) return "warning"; // borderline
  return "alert-circle"; // concerning
}
