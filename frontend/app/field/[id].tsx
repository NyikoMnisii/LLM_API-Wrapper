import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, EmptyState, ScreenHeader } from "../../src/components";
import { mockCrops, mockFields } from "../../src/data/mockFarm";
import { colors, spacing, typography } from "../../src/theme";

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const field = mockFields.find((f) => f.id === id);
  const crops = mockCrops.filter((c) => c.fieldId === id);

  if (!field) {
    return (
      <View style={styles.screen}>
        <ScreenHeader showBack title="Field" />
        <EmptyState icon="alert-circle-outline" title="Field not found" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title={field.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <Badge label={field.status} tone="primary" dot />
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="leaf-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{field.hectares} ha • {field.crop}</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Crops in this field</Text>
        <View style={{ gap: spacing.sm }}>
          {crops.map((crop) => (
            <Card key={crop.id} style={styles.cropRow}>
              <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={styles.cropNotes}>{crop.notes}</Text>
              </View>
              <Badge label={crop.status} tone={crop.status === "Healthy" ? "primary" : "warning"} />
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  summaryCard: { gap: spacing.sm },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  fieldName: { ...typography.h1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { ...typography.caption },
  sectionTitle: { ...typography.h2 },
  cropRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cropEmoji: { fontSize: 28 },
  cropName: { ...typography.bodyStrong },
  cropNotes: { ...typography.caption, marginTop: 2, lineHeight: 16 },
});
