import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Card, HeaderIconButton, SectionHeader } from "../../src/components";
import { mockAlerts } from "../../src/data/mockAlerts";
import { mockCrops, mockFarm, mockFields, mockInsights } from "../../src/data/mockFarm";
import { colors, radius, spacing, typography } from "../../src/theme";

export default function MyFarmScreen() {
  const unreadAlerts = mockAlerts.filter((a) => !a.read).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>
          Agri<Text style={{ color: colors.primary }}>Lite</Text> Ai
        </Text>
        <View style={styles.headerIcons}>
          <HeaderIconButton name="notifications-outline" badge={unreadAlerts} onPress={() => router.push("/alerts")} />
          <HeaderIconButton name="menu-outline" onPress={() => router.push("/profile")} />
        </View>
      </View>

      <SectionHeader icon="home-outline" title="My Farm" />
      <Card style={styles.farmCard}>
        <View style={styles.farmTopRow}>
          <View style={styles.farmPhoto}>
            <Ionicons name="image-outline" size={26} color={colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.farmNameRow}>
              <Text style={styles.farmName}>{mockFarm.name}</Text>
              <Badge label={mockFarm.status} tone="primary" dot />
            </View>
            <View style={styles.farmMetaRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.farmMeta}>{mockFarm.location}</Text>
            </View>
            <View style={styles.farmMetaRow}>
              <Ionicons name="leaf-outline" size={13} color={colors.textMuted} />
              <Text style={styles.farmMeta}>{mockFarm.hectares} ha • {mockFarm.farmType}</Text>
            </View>
            <View style={styles.farmMetaRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
              <Text style={styles.farmMeta}>Established on {mockFarm.establishedOn}</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.editButton} onPress={() => router.push("/farm/edit")}>
          <Ionicons name="pencil-outline" size={14} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit Farm</Text>
        </Pressable>

        <View style={styles.statsRow}>
          <FarmStat icon="leaf-outline" value={`${mockFarm.hectares}`} unit="ha" label="Total Area" />
          <FarmStat icon="flower-outline" value={`${mockFarm.cropsGrown}`} label="Crops Grown" />
          <FarmStat icon="grid-outline" value={`${mockFarm.fieldsCount}`} label="Fields" />
          <FarmStat icon="time-outline" value={`${mockFarm.daysActive}`} label="Days Active" />
        </View>
      </Card>

      <SectionHeader icon="leaf-outline" title="Crops Grown" actionLabel="View all" onAction={() => {}} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
        {mockCrops.map((crop) => (
          <Pressable key={crop.id} onPress={() => router.push({ pathname: "/crop/[id]", params: { id: crop.id } })}>
            <Card style={styles.cropCard} padded={false}>
              <View style={styles.cropEmojiWrap}>
                <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              </View>
              <View style={styles.cropInfo}>
                <Text style={styles.cropName}>{crop.name}</Text>
                <Text style={styles.cropPlanted}>Planted{"\n"}{crop.plantedOn}</Text>
                <Badge label={crop.status} tone={crop.status === "Healthy" ? "primary" : "warning"} />
              </View>
            </Card>
          </Pressable>
        ))}
        <Pressable style={styles.addCropCard} onPress={() => router.push("/add")}>
          <View style={styles.addCropCircle}>
            <Ionicons name="add" size={22} color={colors.primary} />
          </View>
          <Text style={styles.addCropText}>Add Crop</Text>
        </Pressable>
      </ScrollView>

      <SectionHeader icon="grid-outline" title="Fields" actionLabel="View all" onAction={() => {}} />
      <View style={{ gap: spacing.sm }}>
        {mockFields.map((field) => (
          <Pressable key={field.id} onPress={() => router.push({ pathname: "/field/[id]", params: { id: field.id } })}>
            <Card style={styles.fieldRow}>
              <View style={styles.fieldThumb}>
                <Ionicons name="leaf" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldName}>{field.name}</Text>
                <Text style={styles.fieldMeta}>{field.hectares} ha • {field.crop}</Text>
              </View>
              <Badge label={field.status} tone="primary" dot />
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Card>
          </Pressable>
        ))}
      </View>

      <SectionHeader icon="bar-chart-outline" title="Farm Insights" actionLabel="View details" onAction={() => {}} />
      <View style={styles.insightsGrid}>
        <InsightTile icon="thermometer-outline" value={`${mockInsights.avgTempC}°C`} label="Avg Temp This Month" tone={colors.warning} />
        <InsightTile icon="water-outline" value={`${mockInsights.avgHumidityPct}%`} label="Avg Humidity This Month" tone={colors.info} />
        <InsightTile icon="rainy-outline" value={`${mockInsights.rainfallMm} mm`} label="Rainfall This Month" tone={colors.info} />
        <InsightTile icon="leaf-outline" value={mockInsights.overallHealth} label="Overall Crop Health" tone={colors.primary} />
      </View>
    </ScrollView>
  );
}

function FarmStat({ icon, value, unit, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; unit?: string; label: string }) {
  return (
    <View style={styles.farmStat}>
      <View style={styles.farmStatTop}>
        <Ionicons name={icon} size={14} color={colors.primary} />
        <Text style={styles.farmStatValue}>
          {value}
          {unit ? <Text style={styles.farmStatUnit}> {unit}</Text> : null}
        </Text>
      </View>
      <Text style={styles.farmStatLabel}>{label}</Text>
    </View>
  );
}

function InsightTile({ icon, value, label, tone }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; tone: string }) {
  return (
    <Card style={styles.insightTile}>
      <Ionicons name={icon} size={18} color={tone} />
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontSize: 22, fontWeight: "800", color: colors.text },
  headerIcons: { flexDirection: "row", gap: spacing.sm },

  farmCard: { gap: spacing.lg },
  farmTopRow: { flexDirection: "row", gap: spacing.md },
  farmPhoto: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  farmNameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  farmName: { ...typography.h2 },
  farmMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  farmMeta: { ...typography.caption },
  editButton: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  editButtonText: { color: colors.primary, fontWeight: "700", fontSize: 12 },

  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  farmStat: { flexBasis: "47%", flexGrow: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, padding: spacing.md },
  farmStatTop: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  farmStatValue: { fontSize: 17, fontWeight: "800", color: colors.text },
  farmStatUnit: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  farmStatLabel: { ...typography.caption, marginTop: 2 },

  cropCard: { width: 128, padding: spacing.md, gap: spacing.sm },
  cropEmojiWrap: {
    width: "100%",
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  cropEmoji: { fontSize: 30 },
  cropInfo: { gap: 4 },
  cropName: { ...typography.bodyStrong },
  cropPlanted: { ...typography.caption, lineHeight: 15 },
  addCropCard: {
    width: 128,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  addCropCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addCropText: { color: colors.primary, fontWeight: "700", fontSize: 12 },

  fieldRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  fieldThumb: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldName: { ...typography.bodyStrong },
  fieldMeta: { ...typography.caption, marginTop: 2 },

  insightsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  insightTile: { flexBasis: "47%", flexGrow: 1, gap: spacing.xs, padding: spacing.md },
  insightValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  insightLabel: { ...typography.caption },
});
