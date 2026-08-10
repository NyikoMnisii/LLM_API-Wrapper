import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, EmptyState } from "../../src/components";
import { mockAlerts } from "../../src/data/mockAlerts";
import { colors, radius, spacing, typography } from "../../src/theme";

const TONE_BG: Record<string, string> = {
  primary: colors.primaryMuted,
  warning: colors.warningMuted,
  danger: colors.dangerMuted,
  info: colors.infoMuted,
};
const TONE_FG: Record<string, string> = {
  primary: colors.primary,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
};

export default function AlertsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{mockAlerts.filter((a) => !a.read).length} new</Text>
        </View>
      </View>

      {mockAlerts.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No alerts yet" message="We'll let you know when something on your farm needs attention." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {mockAlerts.map((alert) => (
            <Card key={alert.id} style={[styles.row, !alert.read && styles.rowUnread]}>
              <View style={[styles.iconWrap, { backgroundColor: TONE_BG[alert.tone] }]}>
                <Ionicons name={alert.icon} size={18} color={TONE_FG[alert.tone]} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  {!alert.read && <View style={styles.dot} />}
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
