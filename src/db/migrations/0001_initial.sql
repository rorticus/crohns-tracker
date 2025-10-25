-- Initial migration for Crohns Tracker database
-- Version: 0.0.1
-- Created: 2025-10-25

CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('bowel_movement', 'note')),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bowel_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  consistency INTEGER NOT NULL CHECK (consistency BETWEEN 1 AND 7),
  urgency INTEGER NOT NULL CHECK (urgency BETWEEN 1 AND 4),
  notes TEXT,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'exercise', 'medication', 'other')),
  content TEXT NOT NULL,
  tags TEXT,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_timestamp ON entries(timestamp);
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_notes_category ON notes(category);