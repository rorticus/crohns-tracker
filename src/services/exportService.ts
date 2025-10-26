import { CombinedEntry } from "@/types/entry";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getEntriesForDateRange } from "./entryService";

export type ExportFormat = "csv" | "txt";

export interface ExportOptions {
  startDate: string;
  endDate: string;
  format: ExportFormat;
  includeNotes?: boolean;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
  entriesCount?: number;
}

/**
 * Export entries to CSV format
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
  ];

  const rows = entries.map((entry) => {
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
      ];
    }
    return [];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
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
    // Fetch entries for the date range
    const entries = await getEntriesForDateRange(
      options.startDate,
      options.endDate
    );

    if (entries.length === 0) {
      return {
        success: false,
        error: "No entries found for the selected date range",
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
    const entries = await getEntriesForDateRange(
      options.startDate,
      options.endDate
    );

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
