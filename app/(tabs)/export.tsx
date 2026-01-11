import Button from "@/components/button";
import DateInput from "@/components/dateInput";
import Screen from "@/components/screen";
import Text from "@/components/text";
import {
  exportData,
  exportDayTagsData,
  shareExportFile,
} from "@/services/exportService";
import { formatDateForDatabase } from "@/utils/dateUtils";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

type ExportData = {
  startDate: string;
  endDate: string;
};

export default function Export() {
  const now = new Date();
  const form = useForm<ExportData>({
    defaultValues: {
      startDate: formatDateForDatabase(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
      ),
      endDate: formatDateForDatabase(new Date()),
    },
  });

  return (
    <Screen>
      <View style={{ flex: 1, padding: 16 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 32,
          }}
        >
          Export Data
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Controller
            name="startDate"
            control={form.control}
            render={({ field }) => (
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 8 }}>Start Date</Text>
                <DateInput value={field.value} onChange={field.onChange} />
              </View>
            )}
          />

          <Controller
            name="endDate"
            control={form.control}
            render={({ field }) => (
              <View style={{ flex: 1 }}>
                <Text style={{ marginBottom: 8 }}>End Date</Text>
                <DateInput value={field.value} onChange={field.onChange} />
              </View>
            )}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
          <Button
            fill
            title="This week"
            onPress={() => {
              const now = new Date();
              const firstDayOfWeek = new Date(
                now.setDate(now.getDate() - now.getDay())
              );

              form.setValue("startDate", formatDateForDatabase(firstDayOfWeek));
              form.setValue("endDate", formatDateForDatabase(new Date()));
            }}
          />
          <Button
            fill
            title="This month"
            onPress={() => {
              const now = new Date();
              const firstDayOfMonth = new Date(
                now.getFullYear(),
                now.getMonth(),
                1
              );

              form.setValue(
                "startDate",
                formatDateForDatabase(firstDayOfMonth)
              );
              form.setValue("endDate", formatDateForDatabase(new Date()));
            }}
          />
          <Button
            fill
            title="This year"
            onPress={() => {
              const now = new Date();
              const firstOfYear = new Date(now.getFullYear(), 0, 1);

              form.setValue("startDate", formatDateForDatabase(firstOfYear));
              form.setValue("endDate", formatDateForDatabase(now));
            }}
          />
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ gap: 8, marginBottom: 24 }}>
          <Button
            type="primary"
            title="Export Entries"
            onPress={async () => {
              const result = await exportData({
                startDate: form.getValues("startDate"),
                endDate: form.getValues("endDate"),
                format: "csv",
                includeNotes: true,
              });

              if (result.success && result.filePath) {
                shareExportFile(result.filePath);
              }
            }}
          />
          <Button
            title="Export Tags"
            onPress={async () => {
              const result = await exportDayTagsData();

              if (result.success && result.filePath) {
                shareExportFile(result.filePath);
              }
            }}
          />
        </View>
      </View>
    </Screen>
  );
}
