import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

export function ForecastDayPill({
  label,
  max,
  hasRain,
  active,
  onPress,
}: {
  label: string;
  max: number;
  hasRain: boolean;
  active?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.day, active && styles.dayActive]}>{label}</Text>
      <Ionicons
        name={hasRain ? "rainy" : "partly-sunny"}
        size={18}
        color={active ? colors.textOnPrimary : colors.textSecondary}
        style={{ marginVertical: spacing.xs }}
      />
      <Text style={[styles.temp, active && styles.dayActive]}>{Math.round(max)}°</Text>
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    pill: {
      width: 56,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    day: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
    dayActive: { color: colors.textOnPrimary },
    temp: { fontSize: 14, fontWeight: "700", color: colors.text },
  });
}
