import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState } from "../../src/components";
import type { Alert } from "../../src/api/supabase/types";
import { useAlerts } from "../../src/hooks/useAlerts";
import { useFarm } from "../../src/hooks/useFarm";
import { radius, spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";
import { formatDateWithYear, formatTime } from "../../src/utils/date";

type Tone = "primary" | "warning" | "danger" | "info";

const SEVERITY_TONE: Record<Alert["severity"], Tone> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

const TYPE_ICON: Record<Alert["alert_type"], keyof typeof Ionicons.glyphMap> = {
  weather: "cloud-outline",
  pest: "bug-outline",
  disease: "medkit-outline",
  harvest: "leaf-outline",
  frost: "snow-outline",
  fungal_risk: "warning-outline",
  system: "information-circle-outline",
  other: "notifications-outline",
};

function formatAlertTime(iso: string) {
  return `${formatDateWithYear(iso)}, ${formatTime(new Date(iso))}`;
}

export default function AlertsScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const { farm } = useFarm();
  const { alerts, loading, markRead } = useAlerts(farm?.id);

  const toneBg = useMemo(
    () => ({
      primary: colors.primaryMuted,
      warning: colors.warningMuted,
      danger: colors.dangerMuted,
      info: colors.infoMuted,
    }),
    [colors]
  );
  const toneFg = useMemo(
    () => ({
      primary: colors.primary,
      warning: colors.warning,
      danger: colors.danger,
      info: colors.info,
    }),
    [colors]
  );

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{unreadCount} new</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : alerts.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No alerts yet" message="We'll let you know when something on your farm needs attention." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {alerts.map((alert) => {
            const tone = SEVERITY_TONE[alert.severity];
            return (
              <Pressable key={alert.id} onPress={() => !alert.is_read && markRead(alert.id)}>
                <Card style={[styles.row, !alert.is_read && styles.rowUnread]}>
                  <View style={[styles.iconWrap, { backgroundColor: toneBg[tone] }]}>
                    <Ionicons name={TYPE_ICON[alert.alert_type]} size={18} color={toneFg[tone]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowTop}>
                      <Text style={styles.alertTitle}>{alert.title}</Text>
                      {!alert.is_read && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertTime}>{formatAlertTime(alert.created_at)}</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.lg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    title: { ...typography.h1 },
    countBadge: { backgroundColor: colors.primaryMuted, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 5 },
    countText: { color: colors.primary, fontWeight: "700", fontSize: 12 },

    row: { flexDirection: "row", gap: spacing.md },
    rowUnread: { borderColor: colors.primaryMutedStrong },
    iconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    rowTop: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
    alertTitle: { ...typography.bodyStrong },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    alertMessage: { ...typography.body, fontSize: 13, lineHeight: 18, marginTop: 3 },
    alertTime: { ...typography.caption, marginTop: 6 },
  });
}
