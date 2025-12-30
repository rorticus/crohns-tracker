import { CombinedEntry } from "@/types/entry";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getEntriesForDateRange } from "./entryService";
import { TagFilter } from "@/types/dayTag";
import { getEntriesByTags, getAllTags, getTagsForDate } from "./dayTagService";

export type ExportFormat = "csv" | "txt";

export interface ExportOptions {
  startDate: string;
  endDate: string;
  format: ExportFormat;
  includeNotes?: boolean;
  tagFilter?: TagFilter | null;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
  entriesCount?: number;
}

/**
 * Escape CSV cell value by wrapping in quotes and escaping internal quotes
 */
function escapeCsvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Export entries to CSV format with day tags
 */
export async function exportToCSV(entries: CombinedEntry[]): Promise<string> {
  const headers = [
    "Date",
    "Time",
    "Type",
    "Consistency",
    "Urgency",
    "Category",
    "Content",
    "Notes",
    "Tags",
    "Day Tags",
  ];

  // Get unique dates from entries to fetch day tags
  const uniqueDates = [...new Set(entries.map((e) => e.date))];
  
  // Fetch day tags for all dates concurrently
  const dateTagsPromises = uniqueDates.map(async (date) => {
    const tags = await getTagsForDate(date);
    return { date, tagsString: tags.map(tag => tag.displayName).join("; ") };
  });
  
  const dateTagsResults = await Promise.all(dateTagsPromises);
  const dateTagsMap: Record<string, string> = {};
  dateTagsResults.forEach(({ date, tagsString }) => {
    dateTagsMap[date] = tagsString;
  });

  const rows = entries.map((entry) => {
    const dayTagsString = dateTagsMap[entry.date] || "";
    
    if (entry.type === "bowel_movement" && entry.bowelMovement) {
      return [
        entry.date,
        entry.time,
        "Bowel Movement",
        entry.bowelMovement.consistency.toString(),
        entry.bowelMovement.urgency.toString(),
        "",
        "",
        entry.bowelMovement.notes || "",
        "",
        dayTagsString,
      ];
    } else if (entry.type === "note" && entry.note) {
      return [
        entry.date,
        entry.time,
        "Note",
        "",
        "",
        entry.note.category,
        entry.note.content,
        "",
        entry.note.tags || "",
        dayTagsString,
      ];
    }
    return [];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Export entries to TXT format (human-readable)
 */
export async function exportToTXT(entries: CombinedEntry[]): Promise<string> {
  const lines: string[] = [
    "====================================",
    "Crohn's Symptom Tracker Export",
    "====================================",
    "",
    `Export Date: ${new Date().toLocaleDateString()}`,
    `Total Entries: ${entries.length}`,
    "",
    "====================================",
    "",
  ];

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, CombinedEntry[]>);

  // Format each date group
  Object.keys(entriesByDate)
    .sort()
    .forEach((date) => {
      const formattedDate = new Date(date).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      lines.push(`Date: ${formattedDate}`);
      lines.push("------------------------------------");
      lines.push("");

      entriesByDate[date].forEach((entry) => {
        lines.push(`Time: ${entry.time}`);

        if (entry.type === "bowel_movement" && entry.bowelMovement) {
          lines.push("Type: Bowel Movement");
          lines.push(
            `  Consistency: ${entry.bowelMovement.consistency} (Bristol Scale)`
          );
          lines.push(`  Urgency: ${entry.bowelMovement.urgency}/4`);
          if (entry.bowelMovement.notes) {
            lines.push(`  Notes: ${entry.bowelMovement.notes}`);
          }
        } else if (entry.type === "note" && entry.note) {
          lines.push("Type: Note");
          lines.push(`  Category: ${entry.note.category}`);
          lines.push(`  Content: ${entry.note.content}`);
          if (entry.note.tags) {
            lines.push(`  Tags: ${entry.note.tags}`);
          }
        }

        lines.push("");
      });

      lines.push("");
    });

  return lines.join("\n");
}

/**
 * Export entries for a date range
 */
export async function exportData(
  options: ExportOptions
): Promise<ExportResult> {
  try {
    // Fetch entries for the date range, optionally filtered by tags
    let entries: CombinedEntry[];
    
    if (options.tagFilter && options.tagFilter.tags.length > 0) {
      // Use tag filtering if tags are specified
      entries = await getEntriesByTags(
        options.tagFilter,
        options.startDate,
        options.endDate
      );
    } else {
      // Use standard date range query
      entries = await getEntriesForDateRange(
        options.startDate,
        options.endDate
      );
    }

    if (entries.length === 0) {
      return {
        success: false,
        error: options.tagFilter && options.tagFilter.tags.length > 0
          ? "No entries found for the selected date range and tags"
          : "No entries found for the selected date range",
        entriesCount: 0,
      };
    }

    // Generate export content based on format
    let content: string;
    let fileExtension: string;

    if (options.format === "csv") {
      content = await exportToCSV(entries);
      fileExtension = "csv";
    } else {
      content = await exportToTXT(entries);
      fileExtension = "txt";
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `crohns-tracker-export-${timestamp}.${fileExtension}`;

    // Write file using new FileSystem API
    const file = new File(Paths.document, filename);
    await file.write(content);

    return {
      success: true,
      filePath: file.uri,
      entriesCount: entries.length,
    };
  } catch (error) {
    console.error("Export error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Export failed",
      entriesCount: 0,
    };
  }
}

/**
 * Share exported file using system share dialog
 */
export async function shareExportFile(filePath: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();

    if (!isAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(filePath, {
      mimeType: filePath.endsWith(".csv") ? "text/csv" : "text/plain",
      dialogTitle: "Share Export",
    });

    return true;
  } catch (error) {
    console.error("Share error:", error);
    return false;
  }
}

/**
 * Delete exported file after sharing
 */
export async function deleteExportFile(filePath: string): Promise<void> {
  try {
    // Extract filename from URI/path
    const filename = filePath.split("/").pop();
    if (!filename) {
      throw new Error("Invalid file path");
    }

    const file = new File(Paths.document, filename);
    if (await file.exists) {
      await file.delete();
    }
  } catch (error) {
    console.error("Delete error:", error);
  }
}

/**
 * Get preview of export data
 */
export async function getExportPreview(
  options: ExportOptions,
  maxLines: number = 10
): Promise<string> {
  try {
    // Fetch entries for the date range, optionally filtered by tags
    let entries: CombinedEntry[];
    
    if (options.tagFilter && options.tagFilter.tags.length > 0) {
      // Use tag filtering if tags are specified
      entries = await getEntriesByTags(
        options.tagFilter,
        options.startDate,
        options.endDate
      );
    } else {
      // Use standard date range query
      entries = await getEntriesForDateRange(
        options.startDate,
        options.endDate
      );
    }

    const limitedEntries = entries.slice(0, maxLines);

    if (options.format === "csv") {
      const content = await exportToCSV(limitedEntries);
      const lines = content.split("\n").slice(0, maxLines + 1); // +1 for header
      return lines.join("\n") + (entries.length > maxLines ? "\n..." : "");
    } else {
      const content = await exportToTXT(limitedEntries);
      const lines = content.split("\n").slice(0, maxLines * 5); // More lines for TXT format
      return lines.join("\n") + (entries.length > maxLines ? "\n..." : "");
    }
  } catch (error) {
    console.error("Preview error:", error);
    return "Error generating preview";
  }
}

/**
 * Export day tags to CSV format
 */
export async function exportDayTagsToCSV(): Promise<string> {
  const tags = await getAllTags();
  
  const headers = [
    "Tag Name",
    "Description",
    "Usage Count",
    "Created At",
  ];

  const rows = tags.map((tag) => [
    tag.displayName,
    tag.description || "",
    tag.usageCount.toString(),
    tag.createdAt,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Export day tags data
 */
export async function exportDayTagsData(): Promise<ExportResult> {
  try {
    const content = await exportDayTagsToCSV();
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `crohns-tracker-day-tags-${timestamp}.csv`;

    // Write file using new FileSystem API
    const file = new File(Paths.document, filename);
    await file.write(content);

    // Count tags
    const tags = await getAllTags();

    return {
      success: true,
      filePath: file.uri,
      entriesCount: tags.length,
    };
  } catch (error) {
    console.error("Day tags export error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Day tags export failed",
      entriesCount: 0,
    };
  }
}
