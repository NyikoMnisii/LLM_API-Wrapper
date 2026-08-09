import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "../src/theme";

const ACTIONS: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
  { icon: "sparkles-outline", label: "Ask AgriLite AI", onPress: () => router.replace("/chat") },
  { icon: "leaf-outline", label: "Add Crop", onPress: () => router.back() },
  { icon: "grid-outline", label: "Add Field", onPress: () => router.back() },
  { icon: "clipboard-outline", label: "Log Activity", onPress: () => router.back() },
  { icon: "notifications-outline", label: "Report Alert", onPress: () => router.back() },
];

export default function AddActionSheet() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Quick Actions</Text>
        <View style={{ gap: spacing.sm }}>
          {ACTIONS.map((action) => (
            <Pressable key={action.label} style={styles.actionRow} onPress={action.onPress}>
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  title: { ...typography.h2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { ...typography.bodyStrong, flex: 1 },
});
