import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, EmptyState, ScreenHeader } from "../../src/components";
import { useCrops } from "../../src/hooks/useCrops";
import { useFarm } from "../../src/hooks/useFarm";
import { useFields } from "../../src/hooks/useFields";
import { spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";

const CROP_STATUS_LABEL: Record<string, string> = {
  healthy: "Healthy",
  at_risk: "At Risk",
  needs_attention: "Needs Attention",
  harvested: "Harvested",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const { farm } = useFarm();
  const { fields, loading } = useFields(farm?.id);
  const { crops } = useCrops(farm?.id);
  const field = fields.find((f) => f.id === id);
  const fieldCrops = crops.filter((c) => c.field_id === id);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader showBack title="Field" />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

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
            <Badge label={capitalize(field.status)} tone="primary" dot />
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="leaf-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {field.hectares != null ? `${field.hectares} ha` : "Area not set"}
              {field.soil_type ? ` • ${field.soil_type}` : ""}
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Crops in this field</Text>
        {fieldCrops.length === 0 ? (
          <EmptyState icon="leaf-outline" title="No crops yet" message="Add a crop to this field to see it here." />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {fieldCrops.map((crop) => (
              <Card key={crop.id} style={styles.cropRow}>
                <Text style={styles.cropEmoji}>{crop.crop_types?.emoji ?? "🌱"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropName}>{crop.crop_types?.name ?? crop.variety ?? "Crop"}</Text>
                  {crop.notes ? <Text style={styles.cropNotes}>{crop.notes}</Text> : null}
                </View>
                <Badge label={CROP_STATUS_LABEL[crop.status]} tone={crop.status === "healthy" ? "primary" : "warning"} />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
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
}
