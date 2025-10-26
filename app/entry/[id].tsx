import { BowelMovementForm } from "@/components/Forms/BowelMovementForm";
import { NoteForm } from "@/components/Forms/NoteForm";
import { Button } from "@/components/UI/Button";
import { getEntry } from "@/services/entryService";
import { useEntryStore } from "@/stores/entryStore";
import {
  CombinedEntry,
  CreateBowelMovementInput,
  CreateNoteInput,
} from "@/types/entry";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditEntryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateEntry, deleteEntry, isDeleting } = useEntryStore();

  const [entry, setEntry] = useState<CombinedEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntry = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const entryId = parseInt(id, 10);

      if (isNaN(entryId)) {
        setError("Invalid entry ID");
        return;
      }

      const loadedEntry = await getEntry(entryId);

      if (!loadedEntry) {
        setError("Entry not found");
        return;
      }

      setEntry(loadedEntry);
    } catch (err) {
      console.error("Failed to load entry:", err);
      setError("Failed to load entry");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEntry();
  }, [loadEntry]);

  const handleUpdateBowelMovement = async (data: CreateBowelMovementInput) => {
    try {
      const entryId = parseInt(id, 10);
      await updateEntry(entryId, data);
      Alert.alert("Success", "Entry updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to update entry. Please try again.");
    }
  };

  const handleUpdateNote = async (data: CreateNoteInput) => {
    try {
      const entryId = parseInt(id, 10);
      await updateEntry(entryId, data);
      Alert.alert("Success", "Note updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to update note. Please try again.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const entryId = parseInt(id, 10);
              await deleteEntry(entryId);
              Alert.alert("Success", "Entry deleted successfully!", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert("Error", "Failed to delete entry. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error || "Entry not found"}</Text>
          <Button
            title="Go Back"
            onPress={handleCancel}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Render bowel movement edit form
  if (entry.type === "bowel_movement" && entry.bowelMovement) {
    const initialData: Partial<CreateBowelMovementInput> = {
      date: entry.date,
      time: entry.time,
      consistency: entry.bowelMovement.consistency,
      urgency: entry.bowelMovement.urgency,
      notes: entry.bowelMovement.notes,
    };

    return (
      <View style={styles.formContainer}>
        <BowelMovementForm
          initialData={initialData}
          onSubmit={handleUpdateBowelMovement}
          onCancel={handleCancel}
        />
        <View style={styles.deleteButtonContainer}>
          <Button
            title="Delete Entry"
            onPress={handleDelete}
            variant="outline"
            loading={isDeleting}
            style={styles.deleteButton}
            accessibilityLabel="Delete this entry"
          />
        </View>
      </View>
    );
  }

  // Render note edit form
  if (entry.type === "note" && entry.note) {
    const initialData: Partial<CreateNoteInput> = {
      date: entry.date,
      time: entry.time,
      category: entry.note.category,
      content: entry.note.content,
      tags: entry.note.tags,
    };

    return (
      <View style={styles.formContainer}>
        <NoteForm
          initialData={initialData}
          onSubmit={handleUpdateNote}
          onCancel={handleCancel}
        />
        <View style={styles.deleteButtonContainer}>
          <Button
            title="Delete Entry"
            onPress={handleDelete}
            variant="outline"
            loading={isDeleting}
            style={styles.deleteButton}
            accessibilityLabel="Delete this entry"
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unknown entry type</Text>
        <Button title="Go Back" onPress={handleCancel} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  formContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    minWidth: 150,
  },
  deleteButtonContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: "#F2F2F7",
  },
  deleteButton: {
    borderColor: "#FF3B30",
  },
});
