import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { EmptyState, ScreenHeader } from "../../src/components";
import { spacing, useTheme, type ColorPalette } from "../../src/theme";

const TOPICS: Record<string, { title: string; message: string }> = {
  privacy: {
    title: "Privacy & Security",
    message: "Privacy and security settings are coming soon. Your data is protected by row-level security on every table in the database.",
  },
  help: {
    title: "Help & Support",
    message: "In-app support is coming soon. For now, use the AI chat for farming questions.",
  },
  terms: {
    title: "Terms & Policies",
    message: "Terms of service and policies will be published here before launch.",
  },
};

export default function ProfileTopicScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const content = TOPICS[topic ?? ""] ?? { title: "Not Found", message: "This section doesn't exist." };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHeader showBack title={content.title} />
      <EmptyState icon="construct-outline" title="Coming Soon" message={content.message} />
    </ScrollView>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: spacing.xxxl, gap: spacing.lg },
  });
}
