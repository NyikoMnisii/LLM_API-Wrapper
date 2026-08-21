import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

export function ChatBubble({ role, content }: { role: "user" | "model"; content: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isUser = role === "user";
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="leaf" size={15} color={colors.textOnPrimary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.modelBubble]}>
        <Text style={[styles.text, isUser && styles.userText]}>{content}</Text>
      </View>
    </View>
  );
}

export function ChatRecommendations({ items }: { items: string[] }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (!items.length) return null;
  return (
    <View style={styles.recWrap}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.recRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
          <Text style={styles.recText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginBottom: spacing.md, maxWidth: "88%" },
    rowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
    avatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    bubble: {
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    modelBubble: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 4,
    },
    userBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    text: { fontSize: 14, lineHeight: 20, color: colors.text },
    userText: { color: colors.textOnPrimary },
    recWrap: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      marginBottom: spacing.md,
      marginLeft: 34,
    },
    recRow: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
    recText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
  });
}
