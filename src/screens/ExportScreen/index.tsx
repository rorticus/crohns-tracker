import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExportStore } from '@/stores/exportStore';
import { useDayTagStore } from '@/stores/dayTagStore';
import { DateRangePicker } from '@/components/Forms/DateRangePicker';
import { Button } from '@/components/UI/Button';
import { DayTagFilterPicker } from '@/components/Export/DayTagFilterPicker';
import { ExportFormat } from '@/services/exportService';

export default function ExportScreen() {
  const {
    startDate,
    endDate,
    format,
    tagFilter,
    isExporting,
    isSharing,
    lastExportPath,
    lastExportEntriesCount,
    error,
    preview,
    isLoadingPreview,
    setStartDate,
    setEndDate,
    setFormat,
    setTagFilter,
    exportData,
    shareExport,
    loadPreview,
    clearError,
  } = useExportStore();

  const {
    allTags,
    loadAllTags,
  } = useDayTagStore();

  useEffect(() => {
    // Load all tags when component mounts
    loadAllTags();
    
    // Clear any previous errors when component mounts
    return () => {
      clearError();
    };
  }, [loadAllTags, clearError]);

  const handleExport = async () => {
    const result = await exportData();

    if (result.success && result.filePath) {
      Alert.alert(
        'Export Successful',
        `Exported ${result.entriesCount} entries. Would you like to share the file?`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
          },
          {
            text: 'Share',
            onPress: () => handleShare(result.filePath!),
          },
        ]
      );
    } else {
      Alert.alert('Export Failed', result.error || 'Failed to export data');
    }
  };

  const handleShare = async (filePath: string) => {
    const success = await shareExport(filePath);

    if (!success) {
      Alert.alert('Share Failed', 'Failed to share the export file');
    }
  };

  const handlePreview = async () => {
    await loadPreview();
  };

  const renderFormatOption = (formatOption: ExportFormat, label: string, description: string) => {
    const isSelected = format === formatOption;
    return (
      <TouchableOpacity
        key={formatOption}
        style={[styles.formatOption, isSelected && styles.selectedOption]}
        onPress={() => setFormat(formatOption)}
        accessibilityRole="button"
        accessibilityLabel={`Export format: ${label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.formatInfo}>
          <Text style={[styles.formatLabel, isSelected && styles.selectedText]}>{label}</Text>
          <Text style={[styles.formatDescription, isSelected && styles.selectedSubtext]}>
            {description}
          </Text>
        </View>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Export Data</Text>
          <Text style={styles.subtitle}>Export your symptom data for analysis</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter by Day Tags (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Export only entries from days with specific tags
          </Text>
          <DayTagFilterPicker
            filter={tagFilter}
            onFilterChange={setTagFilter}
            availableTags={allTags}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Format</Text>
          <View style={styles.formatContainer}>
            {renderFormatOption('csv', 'CSV (Spreadsheet)', 'Comma-separated values for Excel, Sheets, etc.')}
            {renderFormatOption('txt', 'TXT (Readable)', 'Human-readable text format')}
          </View>
        </View>

        {preview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewContainer}>
              <ScrollView
                style={styles.previewScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                <Text style={styles.previewText}>{preview}</Text>
              </ScrollView>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Button
            title="Preview Export"
            onPress={handlePreview}
            variant="outline"
            loading={isLoadingPreview}
            disabled={isExporting || isSharing}
          />
        </View>

        {lastExportPath && (
          <View style={styles.lastExportContainer}>
            <Text style={styles.lastExportText}>
              Last export: {lastExportEntriesCount} entries
            </Text>
            <TouchableOpacity
              onPress={() => handleShare(lastExportPath)}
              disabled={isSharing}
            >
              <Text style={styles.shareAgainText}>Share Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          title={isExporting ? 'Exporting...' : 'Export Data'}
          onPress={handleExport}
          loading={isExporting}
          disabled={isExporting || isSharing || isLoadingPreview}
          style={styles.exportButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  formatContainer: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  formatInfo: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  selectedSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    maxHeight: 200,
  },
  previewScroll: {
    maxHeight: 200,
  },
  previewText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#1C1C1E',
  },
  lastExportContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E5F5FF',
    borderRadius: 8,
  },
  lastExportText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  shareAgainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 12,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  exportButton: {
    width: '100%',
  },
});
