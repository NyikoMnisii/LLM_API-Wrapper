import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

export function StatTile({
  icon,
  value,
  unit,
  label,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  unit?: string;
  label: string;
  tone?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={18} color={tone ?? colors.primary} style={{ marginBottom: spacing.xs }} />
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
}
