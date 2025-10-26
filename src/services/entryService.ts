import { db } from "@/db/client";
import { bowelMovements, entries, notes } from "@/db/schema";
import {
  BowelMovementEntry,
  CombinedEntry,
  CreateBowelMovementInput,
  CreateNoteInput,
  NoteEntry,
} from "@/types/entry";
import { between, eq } from "drizzle-orm";
import {
  generateTimestamp,
  validateBowelMovementInput,
  validateNoteInput,
} from "./validationService";

export class EntryServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "EntryServiceError";
  }
}
// Create bowel movement entry
export async function createBowelMovement(
  input: CreateBowelMovementInput
): Promise<BowelMovementEntry> {
  // Validate input
  const validation = validateBowelMovementInput(input);
  if (!validation.isValid) {
    throw new EntryServiceError(
      `Validation failed: ${validation.errors
        .map((e) => e.message)
        .join(", ")}`,
      "VALIDATION_ERROR"
    );
  }

  try {
    // Generate timestamp
    const timestamp = generateTimestamp(input.date, input.time);

    // Create entry record
    const entryData = {
      type: "bowel_movement" as const,
      date: input.date,
      time: input.time,
      timestamp,
    };

    const [newEntry] = await db.insert(entries).values(entryData).returning();

    // Create bowel movement record
    const bowelMovementData = {
      entryId: newEntry.id,
      consistency: input.consistency,
      urgency: input.urgency,
      notes: input.notes || null,
    };

    const [newBowelMovement] = await db
      .insert(bowelMovements)
      .values(bowelMovementData)
      .returning();

    // Return combined entry
    return {
      ...newEntry,
      bowelMovement: {
        consistency: newBowelMovement.consistency,
        urgency: newBowelMovement.urgency,
        notes: newBowelMovement.notes || undefined,
      },
    } as BowelMovementEntry;
  } catch (error) {
    console.error("Error creating bowel movement entry:", error);
    throw new EntryServiceError(
      "Failed to create bowel movement entry",
      "CREATE_ERROR"
    );
  }
}

// Create note entry
export async function createNote(input: CreateNoteInput): Promise<NoteEntry> {
  // Validate input
  const validation = validateNoteInput(input);
  if (!validation.isValid) {
    throw new EntryServiceError(
      `Validation failed: ${validation.errors
        .map((e) => e.message)
        .join(", ")}`,
      "VALIDATION_ERROR"
    );
  }

  try {
    // Generate timestamp
    const timestamp = generateTimestamp(input.date, input.time);

    // Create entry record
    const entryData = {
      type: "note" as const,
      date: input.date,
      time: input.time,
      timestamp,
    };

    const [newEntry] = await db.insert(entries).values(entryData).returning();

    // Create note record
    const noteData = {
      entryId: newEntry.id,
      category: input.category,
      content: input.content,
      tags: input.tags || null,
    };

    const [newNote] = await db.insert(notes).values(noteData).returning();

    // Return combined entry
    return {
      ...newEntry,
      note: {
        category: newNote.category,
        content: newNote.content,
        tags: newNote.tags || undefined,
      },
    } as NoteEntry;
  } catch (error) {
    console.error("Error creating note entry:", error);
    throw new EntryServiceError("Failed to create note entry", "CREATE_ERROR");
  }
}

// Get entries for a specific date
export async function getEntriesForDate(
  date: string
): Promise<CombinedEntry[]> {
  try {
    // Get all entries for the date with joined data
    const result = await db
      .select({
        entry: entries,
        bowelMovement: bowelMovements,
        note: notes,
      })
      .from(entries)
      .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
      .leftJoin(notes, eq(entries.id, notes.entryId))
      .where(eq(entries.date, date))
      .orderBy(entries.timestamp);

    // Transform the results into typed entries
    return result.map((row) => {
      const baseEntry = {
        id: row.entry.id,
        type: row.entry.type,
        date: row.entry.date,
        time: row.entry.time,
        timestamp: row.entry.timestamp,
        createdAt: row.entry.createdAt,
        updatedAt: row.entry.updatedAt,
      };

      if (row.entry.type === "bowel_movement" && row.bowelMovement) {
        return {
          ...baseEntry,
          type: "bowel_movement" as const,
          bowelMovement: {
            consistency: row.bowelMovement.consistency,
            urgency: row.bowelMovement.urgency,
            notes: row.bowelMovement.notes || undefined,
          },
        } as BowelMovementEntry;
      } else if (row.entry.type === "note" && row.note) {
        return {
          ...baseEntry,
          type: "note" as const,
          note: {
            category: row.note.category,
            content: row.note.content,
            tags: row.note.tags || undefined,
          },
        } as NoteEntry;
      }

      throw new EntryServiceError("Invalid entry data structure", "DATA_ERROR");
    });
  } catch (error) {
    console.error("Error getting entries for date:", error);
    throw new EntryServiceError("Failed to get entries", "READ_ERROR");
  }
}

// Get entries in date range
export async function getEntriesInDateRange(
  startDate: string,
  endDate: string
): Promise<CombinedEntry[]> {
  try {
    const result = await db
      .select({
        entry: entries,
        bowelMovement: bowelMovements,
        note: notes,
      })
      .from(entries)
      .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
      .leftJoin(notes, eq(entries.id, notes.entryId))
      .where(between(entries.date, startDate, endDate))
      .orderBy(entries.timestamp);

    return result.map((row) => {
      const baseEntry = {
        id: row.entry.id,
        type: row.entry.type,
        date: row.entry.date,
        time: row.entry.time,
        timestamp: row.entry.timestamp,
        createdAt: row.entry.createdAt,
        updatedAt: row.entry.updatedAt,
      };

      if (row.entry.type === "bowel_movement" && row.bowelMovement) {
        return {
          ...baseEntry,
          type: "bowel_movement" as const,
          bowelMovement: {
            consistency: row.bowelMovement.consistency,
            urgency: row.bowelMovement.urgency,
            notes: row.bowelMovement.notes || undefined,
          },
        } as BowelMovementEntry;
      } else if (row.entry.type === "note" && row.note) {
        return {
          ...baseEntry,
          type: "note" as const,
          note: {
            category: row.note.category,
            content: row.note.content,
            tags: row.note.tags || undefined,
          },
        } as NoteEntry;
      }

      throw new EntryServiceError("Invalid entry data structure", "DATA_ERROR");
    });
  } catch (error) {
    console.error("Error getting entries in date range:", error);
    throw new EntryServiceError("Failed to get entries", "READ_ERROR");
  }
}

// Update bowel movement entry
export async function updateBowelMovement(
  entryId: number,
  updates: Partial<CreateBowelMovementInput>
): Promise<BowelMovementEntry> {
  try {
    // Get existing entry
    const existingEntry = await getEntry(entryId);
    if (!existingEntry || existingEntry.type !== "bowel_movement") {
      throw new EntryServiceError(
        "Bowel movement entry not found",
        "NOT_FOUND"
      );
    }

    // Update entry if date/time changed
    if (updates.date || updates.time) {
      const newDate = updates.date || existingEntry.date;
      const newTime = updates.time || existingEntry.time;
      const newTimestamp = generateTimestamp(newDate, newTime);

      await db
        .update(entries)
        .set({
          date: newDate,
          time: newTime,
          timestamp: newTimestamp,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(entries.id, entryId));
    }

    // Update bowel movement data
    const bowelMovementUpdates: any = {};
    if (updates.consistency !== undefined)
      bowelMovementUpdates.consistency = updates.consistency;
    if (updates.urgency !== undefined)
      bowelMovementUpdates.urgency = updates.urgency;
    if (updates.notes !== undefined) bowelMovementUpdates.notes = updates.notes;

    if (Object.keys(bowelMovementUpdates).length > 0) {
      await db
        .update(bowelMovements)
        .set(bowelMovementUpdates)
        .where(eq(bowelMovements.entryId, entryId));
    }

    // Return updated entry
    const updatedEntries = await getEntriesForDate(
      updates.date || existingEntry.date
    );
    const updatedEntry = updatedEntries.find((e) => e.id === entryId);

    if (!updatedEntry || updatedEntry.type !== "bowel_movement") {
      throw new EntryServiceError(
        "Failed to retrieve updated entry",
        "UPDATE_ERROR"
      );
    }

    return updatedEntry;
  } catch (error) {
    console.error("Error updating bowel movement entry:", error);
    if (error instanceof EntryServiceError) throw error;
    throw new EntryServiceError("Failed to update entry", "UPDATE_ERROR");
  }
}

// Update note entry
export async function updateNote(
  entryId: number,
  updates: Partial<CreateNoteInput>
): Promise<NoteEntry> {
  try {
    // Get existing entry
    const existingEntry = await getEntry(entryId);
    if (!existingEntry || existingEntry.type !== "note") {
      throw new EntryServiceError("Note entry not found", "NOT_FOUND");
    }

    // Update entry if date/time changed
    if (updates.date || updates.time) {
      const newDate = updates.date || existingEntry.date;
      const newTime = updates.time || existingEntry.time;
      const newTimestamp = generateTimestamp(newDate, newTime);

      await db
        .update(entries)
        .set({
          date: newDate,
          time: newTime,
          timestamp: newTimestamp,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(entries.id, entryId));
    }

    // Update note data
    const noteUpdates: any = {};
    if (updates.category !== undefined) noteUpdates.category = updates.category;
    if (updates.content !== undefined) noteUpdates.content = updates.content;
    if (updates.tags !== undefined) noteUpdates.tags = updates.tags;

    if (Object.keys(noteUpdates).length > 0) {
      await db.update(notes).set(noteUpdates).where(eq(notes.entryId, entryId));
    }

    // Return updated entry
    const updatedEntries = await getEntriesForDate(
      updates.date || existingEntry.date
    );
    const updatedEntry = updatedEntries.find((e) => e.id === entryId);

    if (!updatedEntry || updatedEntry.type !== "note") {
      throw new EntryServiceError(
        "Failed to retrieve updated entry",
        "UPDATE_ERROR"
      );
    }

    return updatedEntry;
  } catch (error) {
    console.error("Error updating note entry:", error);
    if (error instanceof EntryServiceError) throw error;
    throw new EntryServiceError("Failed to update note", "UPDATE_ERROR");
  }
}

// Delete entry
export async function deleteEntry(entryId: number): Promise<void> {
  try {
    const result = await db.delete(entries).where(eq(entries.id, entryId));

    if (result.changes === 0) {
      throw new EntryServiceError("Entry not found", "NOT_FOUND");
    }
  } catch (error) {
    console.error("Error deleting entry:", error);
    if (error instanceof EntryServiceError) throw error;
    throw new EntryServiceError("Failed to delete entry", "DELETE_ERROR");
  }
}

// Get single entry by ID
export async function getEntry(entryId: number): Promise<CombinedEntry | null> {
  try {
    const result = await db
      .select({
        entry: entries,
        bowelMovement: bowelMovements,
        note: notes,
      })
      .from(entries)
      .leftJoin(bowelMovements, eq(entries.id, bowelMovements.entryId))
      .leftJoin(notes, eq(entries.id, notes.entryId))
      .where(eq(entries.id, entryId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    const baseEntry = {
      id: row.entry.id,
      type: row.entry.type,
      date: row.entry.date,
      time: row.entry.time,
      timestamp: row.entry.timestamp,
      createdAt: row.entry.createdAt,
      updatedAt: row.entry.updatedAt,
    };

    if (row.entry.type === "bowel_movement" && row.bowelMovement) {
      return {
        ...baseEntry,
        type: "bowel_movement" as const,
        bowelMovement: {
          consistency: row.bowelMovement.consistency,
          urgency: row.bowelMovement.urgency,
          notes: row.bowelMovement.notes || undefined,
        },
      } as BowelMovementEntry;
    } else if (row.entry.type === "note" && row.note) {
      return {
        ...baseEntry,
        type: "note" as const,
        note: {
          category: row.note.category,
          content: row.note.content,
          tags: row.note.tags || undefined,
        },
      } as NoteEntry;
    }

    return null;
  } catch (error) {
    console.error("Error getting entry:", error);
    throw new EntryServiceError("Failed to get entry", "READ_ERROR");
  }
}

// Get entry count for a date range
export async function getEntryCount(
  startDate?: string,
  endDate?: string
): Promise<number> {
  try {
    let query = db.select({ count: entries.id }).from(entries);

    if (startDate && endDate) {
      query = query.where(between(entries.date, startDate, endDate)) as any;
    } else if (startDate) {
      query = query.where(eq(entries.date, startDate)) as any;
    }

    const result = await query;
    return result.length;
  } catch (error) {
    console.error("Error getting entry count:", error);
    throw new EntryServiceError("Failed to get entry count", "READ_ERROR");
  }
}

// Alias for getEntriesInDateRange for consistency with naming
export async function getEntriesForDateRange(
  startDate: string,
  endDate: string
): Promise<CombinedEntry[]> {
  return getEntriesInDateRange(startDate, endDate);
}
