import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme";

export function SectionHeader({
  icon,
  title,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {icon ? <Ionicons name={icon} size={17} color={colors.primary} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8} style={styles.action}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  action: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: colors.primary },
});
