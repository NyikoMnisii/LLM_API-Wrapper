import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../theme";

type Tone = "primary" | "warning" | "danger" | "info" | "neutral";

const toneMap: Record<Tone, { bg: string; fg: string }> = {
  primary: { bg: colors.primaryMuted, fg: colors.primary },
  warning: { bg: colors.warningMuted, fg: colors.warning },
  danger: { bg: colors.dangerMuted, fg: colors.danger },
  info: { bg: colors.infoMuted, fg: colors.info },
  neutral: { bg: "rgba(255,255,255,0.08)", fg: colors.textSecondary },
};

export function Badge({ label, tone = "primary", dot = false }: { label: string; tone?: Tone; dot?: boolean }) {
  const { bg, fg } = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: fg }]} />}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
