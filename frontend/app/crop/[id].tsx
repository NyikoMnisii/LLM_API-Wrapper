import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Button, Card, EmptyState, ScreenHeader } from "../../src/components";
import { mockCrops, mockFields } from "../../src/data/mockFarm";
import { colors, spacing, typography } from "../../src/theme";

export default function CropDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const crop = mockCrops.find((c) => c.id === id);
  const field = mockFields.find((f) => f.id === crop?.fieldId);

  if (!crop) {
    return (
      <View style={styles.screen}>
        <ScreenHeader showBack title="Crop" />
        <EmptyState icon="alert-circle-outline" title="Crop not found" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title={crop.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <Text style={styles.heroEmoji}>{crop.emoji}</Text>
          <Text style={styles.cropName}>{crop.name}</Text>
          <Badge label={crop.status} tone={crop.status === "Healthy" ? "primary" : "warning"} />
        </Card>

        <Card style={{ gap: spacing.md }}>
          <Row icon="calendar-outline" label="Planted on" value={crop.plantedOn} />
          {field ? (
            <Pressable onPress={() => router.push({ pathname: "/field/[id]", params: { id: field.id } })}>
              <Row icon="grid-outline" label="Field" value={field.name} chevron />
            </Pressable>
          ) : null}
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{crop.notes}</Text>
        </Card>

        <Button label="Ask AI about this crop" icon="sparkles" onPress={() => router.push("/chat")} />
      </ScrollView>
    </View>
  );
}

function Row({ icon, label, value, chevron }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; chevron?: boolean }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {chevron ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  hero: { alignItems: "center", gap: spacing.sm },
  heroEmoji: { fontSize: 56 },
  cropName: { ...typography.h1 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rowLabel: { ...typography.caption, flex: 1 },
  rowValue: { ...typography.bodyStrong, fontSize: 13 },
  notesTitle: { ...typography.h3 },
  notesText: { ...typography.body, lineHeight: 20 },
});
