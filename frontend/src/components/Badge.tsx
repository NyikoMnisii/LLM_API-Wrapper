import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

type Tone = "primary" | "warning" | "danger" | "info" | "neutral";

function toneMap(colors: ColorPalette): Record<Tone, { bg: string; fg: string }> {
  return {
    primary: { bg: colors.primaryMuted, fg: colors.primary },
    warning: { bg: colors.warningMuted, fg: colors.warning },
    danger: { bg: colors.dangerMuted, fg: colors.danger },
    info: { bg: colors.infoMuted, fg: colors.info },
    neutral: { bg: colors.borderStrong, fg: colors.textSecondary },
  };
}

export function Badge({ label, tone = "primary", dot = false }: { label: string; tone?: Tone; dot?: boolean }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { bg, fg } = useMemo(() => toneMap(colors)[tone], [colors, tone]);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: fg }]} />}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      borderRadius: radius.pill,
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
    },
  });
}
