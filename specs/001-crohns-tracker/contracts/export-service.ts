/**
 * Export Service Contracts
 * Defines TypeScript interfaces for data export functionality
 */

import { Entry, GetEntriesFilter } from './entry-service';

// Export Format Types
export type ExportFormat = 'csv' | 'txt';

export interface ExportOptions {
  format: ExportFormat;
  startDate: string;
  endDate: string;
  includeNotes?: boolean;
  includeTimestamps?: boolean;
  groupByDate?: boolean;
}

export interface ExportMetadata {
  generatedAt: string;
  totalEntries: number;
  dateRange: {
    start: string;
    end: string;
  };
  format: ExportFormat;
  appVersion: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  metadata: ExportMetadata;
  size: number; // File size in bytes
}

// CSV Export Specific Types
export interface CSVRow {
  date: string;
  time: string;
  type: string;
  consistency?: number;
  urgency?: number;
  category?: string;
  content?: string;
  notes?: string;
  timestamp: string;
}

export interface CSVExportOptions extends ExportOptions {
  format: 'csv';
  includeHeaders?: boolean;
  delimiter?: ',' | ';' | '\t';
  quoteFields?: boolean;
}

// TXT Export Specific Types
export interface TXTExportOptions extends ExportOptions {
  format: 'txt';
  includeMetadata?: boolean;
  indentLevel?: number;
  sectionSeparator?: string;
  includeAnalysisTips?: boolean;
}

// Import Types for Backup/Restore
export interface ImportOptions {
  format: ExportFormat;
  overwriteExisting?: boolean;
  validateData?: boolean;
  skipInvalidEntries?: boolean;
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
  errors: ImportError[];
  duplicatesFound: number;
  success: boolean;
}

export interface ImportError {
  line?: number;
  row?: CSVRow;
  error: string;
  field?: string;
}

// Service Interface
export interface ExportService {
  // Export operations
  exportToCSV(options: CSVExportOptions): Promise<ExportResult>;
  exportToTXT(options: TXTExportOptions): Promise<ExportResult>;

  // Generic export with auto-format detection
  exportData(options: ExportOptions): Promise<ExportResult>;

  // Preview operations (for UI)
  previewExport(options: ExportOptions, maxRows?: number): Promise<string>;
  getExportSize(options: ExportOptions): Promise<number>;

  // Import operations (for backup restore)
  importFromCSV(content: string, options?: ImportOptions): Promise<ImportResult>;
  validateImportData(content: string, format: ExportFormat): Promise<ImportError[]>;

  // Utility operations
  generateFilename(options: ExportOptions): string;
  getEstimatedExportTime(entryCount: number, format: ExportFormat): number; // seconds
}

// Platform-specific sharing interface
export interface ShareService {
  shareFile(result: ExportResult): Promise<void>;
  saveToDevice(result: ExportResult, directory?: string): Promise<string>; // Returns saved path
  openSystemShareDialog(result: ExportResult): Promise<void>;
  canShare(): boolean;
  getSupportedDirectories(): string[];
}

// Analytics/Pattern Analysis Types
export interface AnalysisPrompt {
  description: string;
  dataRange: string;
  totalEntries: number;
  suggestions: string[];
}

export interface PatternAnalysisService {
  generateAnalysisPrompt(entries: Entry[]): AnalysisPrompt;
  formatForAIAnalysis(entries: Entry[]): string;
  getPatternSuggestions(entries: Entry[]): string[];
}

// Template Types for Export Formatting
export interface ExportTemplate {
  name: string;
  format: ExportFormat;
  description: string;
  defaultOptions: ExportOptions;
  aiAnalysisOptimized: boolean;
}

export const EXPORT_TEMPLATES: Record<string, ExportTemplate> = {
  medical_csv: {
    name: 'Medical CSV',
    format: 'csv',
    description: 'Structured CSV format for medical analysis',
    defaultOptions: {
      format: 'csv',
      startDate: '',
      endDate: '',
      includeNotes: true,
      includeTimestamps: true,
      groupByDate: false,
    },
    aiAnalysisOptimized: true,
  },
  daily_summary: {
    name: 'Daily Summary',
    format: 'txt',
    description: 'Human-readable daily summary format',
    defaultOptions: {
      format: 'txt',
      startDate: '',
      endDate: '',
      includeNotes: true,
      includeTimestamps: false,
      groupByDate: true,
    },
    aiAnalysisOptimized: false,
  },
  ai_analysis: {
    name: 'AI Analysis',
    format: 'txt',
    description: 'Optimized format for AI pattern analysis',
    defaultOptions: {
      format: 'txt',
      startDate: '',
      endDate: '',
      includeNotes: true,
      includeTimestamps: true,
      groupByDate: true,
    },
    aiAnalysisOptimized: true,
  },
};

// Error Types
export class ExportError extends Error {
  constructor(message: string, public format?: ExportFormat) {
    super(`Export error: ${message}`);
    this.name = 'ExportError';
  }
}

export class ImportError extends Error {
  public errors: ImportError[];

  constructor(errors: ImportError[]) {
    super(`Import failed with ${errors.length} errors`);
    this.name = 'ImportError';
    this.errors = errors;
  }
}

export class ShareError extends Error {
  constructor(message: string) {
    super(`Share error: ${message}`);
    this.name = 'ShareError';
  }
}