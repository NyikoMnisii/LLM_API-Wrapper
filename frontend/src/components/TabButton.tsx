import { Ionicons } from "@expo/vector-icons";
import { TabTrigger, TabTriggerSlotProps } from "expo-router/ui";
import { Ref, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme, type ColorPalette } from "../theme";

export type TabButtonProps = TabTriggerSlotProps & {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  ref?: Ref<View>;
};

export function TabButton({ name, icon, activeIcon, label, isFocused, ...props }: TabButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TabTrigger name={name} style={styles.trigger} {...props} asChild>
      <Pressable style={styles.tab}>
        <Ionicons name={isFocused ? activeIcon : icon} size={22} color={isFocused ? colors.primary : colors.textMuted} />
        <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
      </Pressable>
    </TabTrigger>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    trigger: { flex: 1 },
    tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: spacing.xs },
    label: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
    labelActive: { color: colors.primary },
  });
}
