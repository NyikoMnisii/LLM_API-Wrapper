import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Card, ScreenHeader } from "../../src/components";
import { useProfile } from "../../src/hooks/useProfile";
import { spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";

const ROWS: { key: "notify_email" | "notify_push" | "notify_sms"; label: string; description: string }[] = [
  { key: "notify_push", label: "Push Notifications", description: "Alerts about your farm on this device." },
  { key: "notify_email", label: "Email", description: "Weekly summaries and important updates." },
  { key: "notify_sms", label: "SMS", description: "Critical alerts only, sent as a text message." },
];

export default function NotificationPreferencesScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const { profile, loading, save } = useProfile();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function toggle(key: "notify_email" | "notify_push" | "notify_sms", value: boolean) {
    setSavingKey(key);
    try {
      await save({ [key]: value });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Notification Preferences" />
      {loading || !profile ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {ROWS.map((row) => (
            <Card key={row.key} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{row.label}</Text>
                <Text style={styles.description}>{row.description}</Text>
              </View>
              {savingKey === row.key ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Switch
                  value={profile[row.key]}
                  onValueChange={(value) => toggle(row.key, value)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              )}
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.sm },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    label: { ...typography.bodyStrong },
    description: { ...typography.caption, marginTop: 2 },
  });
}
