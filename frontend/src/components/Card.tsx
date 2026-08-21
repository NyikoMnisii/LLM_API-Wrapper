import { PropsWithChildren, useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}>;

export function Card({ children, style, padded = true }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <View style={[styles.card, padded && styles.padded, style]}>{children}</View>;
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    padded: {
      padding: spacing.lg,
    },
  });
}
