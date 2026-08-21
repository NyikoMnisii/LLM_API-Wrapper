import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, useTheme, type ColorPalette } from "../theme";

type Props = {
  title?: string;
  showBack?: boolean;
  showBrand?: boolean;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, showBack, showBrand, right }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable hitSlop={12} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        ) : null}
        {showBrand ? (
          <Text style={styles.brand}>
            Agri<Text style={{ color: colors.primary }}>Lite</Text> Ai
          </Text>
        ) : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

export function HeaderIconButton({
  name,
  onPress,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badge?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.iconBtn}>
      <Ionicons name={name} size={22} color={colors.text} />
      {badge ? (
        <View style={styles.badgeDot}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    left: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    right: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    brand: { fontSize: 22, fontWeight: "800", color: colors.text },
    title: { fontSize: 18, fontWeight: "700", color: colors.text },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeDot: {
      position: "absolute",
      top: 2,
      right: 2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 3,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "800",
      color: colors.textOnPrimary,
    },
  });
}
