import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

type Variant = "primary" | "outline" | "ghost";

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.textOnPrimary : colors.primary} />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={17}
              color={variant === "primary" ? colors.textOnPrimary : colors.primary}
            />
          ) : null}
          <Text style={[styles.label, variant !== "primary" && { color: colors.primary }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingVertical: 13,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.pill,
    },
    primary: { backgroundColor: colors.primary },
    outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
    ghost: { backgroundColor: colors.primaryMuted },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    label: { fontSize: 14, fontWeight: "700", color: colors.textOnPrimary },
  });
}
