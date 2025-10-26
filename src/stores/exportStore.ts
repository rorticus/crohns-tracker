import { create } from 'zustand';
import { exportData, shareExportFile, getExportPreview, ExportFormat, ExportOptions, ExportResult } from '@/services/exportService';

interface ExportState {
  // Export configuration
  startDate: string;
  endDate: string;
  format: ExportFormat;

  // Export status
  isExporting: boolean;
  isSharing: boolean;
  exportProgress: number;

  // Export result
  lastExportPath: string | null;
  lastExportEntriesCount: number;
  error: string | null;

  // Preview
  preview: string | null;
  isLoadingPreview: boolean;

  // Actions
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setFormat: (format: ExportFormat) => void;

  // Export operations
  exportData: () => Promise<ExportResult>;
  shareExport: (filePath: string) => Promise<boolean>;
  loadPreview: () => Promise<void>;
  clearPreview: () => void;

  // Utility
  reset: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Default to last 30 days

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export const useExportStore = create<ExportState>((set, get) => {
  const defaultRange = getDefaultDateRange();

  return {
    // Initial state
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
    format: 'csv',
    isExporting: false,
    isSharing: false,
    exportProgress: 0,
    lastExportPath: null,
    lastExportEntriesCount: 0,
    error: null,
    preview: null,
    isLoadingPreview: false,

    // Setters
    setStartDate: (date: string) => {
      set({ startDate: date, preview: null });
    },

    setEndDate: (date: string) => {
      set({ endDate: date, preview: null });
    },

    setFormat: (format: ExportFormat) => {
      set({ format, preview: null });
    },

    // Export data
    exportData: async (): Promise<ExportResult> => {
      const state = get();
      set({ isExporting: true, error: null, exportProgress: 0 });

      try {
        const options: ExportOptions = {
          startDate: state.startDate,
          endDate: state.endDate,
          format: state.format,
        };

        set({ exportProgress: 30 });

        const result = await exportData(options);

        set({ exportProgress: 100 });

        if (result.success) {
          set({
            lastExportPath: result.filePath || null,
            lastExportEntriesCount: result.entriesCount || 0,
            isExporting: false,
          });
        } else {
          set({
            error: result.error || 'Export failed',
            isExporting: false,
          });
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Export failed';
        set({
          error: errorMessage,
          isExporting: false,
          exportProgress: 0,
        });
        return {
          success: false,
          error: errorMessage,
          entriesCount: 0,
        };
      }
    },

    // Share export
    shareExport: async (filePath: string): Promise<boolean> => {
      set({ isSharing: true, error: null });

      try {
        const success = await shareExportFile(filePath);
        set({ isSharing: false });
        return success;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Share failed';
        set({
          error: errorMessage,
          isSharing: false,
        });
        return false;
      }
    },

    // Load preview
    loadPreview: async (): Promise<void> => {
      const state = get();
      set({ isLoadingPreview: true, error: null });

      try {
        const options: ExportOptions = {
          startDate: state.startDate,
          endDate: state.endDate,
          format: state.format,
        };

        const preview = await getExportPreview(options, 10);
        set({
          preview,
          isLoadingPreview: false,
        });
      } catch (error) {
        console.error('Preview error:', error);
        set({
          preview: null,
          isLoadingPreview: false,
          error: error instanceof Error ? error.message : 'Failed to load preview',
        });
      }
    },

    clearPreview: () => {
      set({ preview: null });
    },

    // Reset to defaults
    reset: () => {
      const defaultRange = getDefaultDateRange();
      set({
        startDate: defaultRange.startDate,
        endDate: defaultRange.endDate,
        format: 'csv',
        isExporting: false,
        isSharing: false,
        exportProgress: 0,
        lastExportPath: null,
        lastExportEntriesCount: 0,
        error: null,
        preview: null,
        isLoadingPreview: false,
      });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },
  };
});
