import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function StatTile({
  icon,
  value,
  unit,
  label,
  tone = colors.primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit?: string;
  label: string;
  tone?: string;
}) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={18} color={tone} style={{ marginBottom: spacing.xs }} />
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "flex-start",
    minWidth: 0,
  },
  value: { fontSize: 18, fontWeight: "800", color: colors.text },
  unit: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  label: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
