import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Button, Card, EmptyState, ScreenHeader } from "../../src/components";
import { useCrops } from "../../src/hooks/useCrops";
import { useFarm } from "../../src/hooks/useFarm";
import { useFields } from "../../src/hooks/useFields";
import { spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";
import { formatDateWithYear } from "../../src/utils/date";

const CROP_STATUS_LABEL: Record<string, string> = {
  healthy: "Healthy",
  at_risk: "At Risk",
  needs_attention: "Needs Attention",
  harvested: "Harvested",
};

export default function CropDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const { farm } = useFarm();
  const { crops, loading } = useCrops(farm?.id);
  const { fields } = useFields(farm?.id);
  const crop = crops.find((c) => c.id === id);
  const field = fields.find((f) => f.id === crop?.field_id);

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader showBack title="Crop" />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!crop) {
    return (
      <View style={styles.screen}>
        <ScreenHeader showBack title="Crop" />
        <EmptyState icon="alert-circle-outline" title="Crop not found" />
      </View>
    );
  }

  const cropName = crop.crop_types?.name ?? crop.variety ?? "Crop";

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title={cropName} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <Text style={styles.heroEmoji}>{crop.crop_types?.emoji ?? "🌱"}</Text>
          <Text style={styles.cropName}>{cropName}</Text>
          <Badge label={CROP_STATUS_LABEL[crop.status]} tone={crop.status === "healthy" ? "primary" : "warning"} />
        </Card>

        <Card style={{ gap: spacing.md }}>
          <Row colors={colors} icon="calendar-outline" label="Planted on" value={formatDateWithYear(crop.planted_on)} />
          {crop.expected_harvest_date ? (
            <Row colors={colors} icon="time-outline" label="Expected harvest" value={formatDateWithYear(crop.expected_harvest_date)} />
          ) : null}
          {crop.variety && crop.crop_types ? <Row colors={colors} icon="flower-outline" label="Variety" value={crop.variety} /> : null}
          {field ? (
            <Pressable onPress={() => router.push({ pathname: "/field/[id]", params: { id: field.id } })}>
              <Row colors={colors} icon="grid-outline" label="Field" value={field.name} chevron />
            </Pressable>
          ) : null}
        </Card>

        {crop.notes ? (
          <Card style={{ gap: spacing.sm }}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{crop.notes}</Text>
          </Card>
        ) : null}

        <Button label="Ask AI about this crop" icon="sparkles" onPress={() => router.push("/chat")} />
      </ScrollView>
    </View>
  );
}

function Row({
  colors,
  icon,
  label,
  value,
  chevron,
}: {
  colors: ColorPalette;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  chevron?: boolean;
}) {
  const styles = useMemo(() => makeRowStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {chevron ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </View>
  );
}

function makeRowStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    rowLabel: { fontSize: 12, color: colors.textMuted, flex: 1 },
    rowValue: { fontSize: 13, fontWeight: "600", color: colors.text },
  });
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
    hero: { alignItems: "center", gap: spacing.sm },
    heroEmoji: { fontSize: 56 },
    cropName: { ...typography.h1 },
    notesTitle: { ...typography.h3 },
    notesText: { ...typography.body, lineHeight: 20 },
  });
}
