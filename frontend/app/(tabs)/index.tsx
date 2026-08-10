import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card, ForecastDayPill, HeaderIconButton, SectionHeader, WeatherGauge } from "../../src/components";
import { mockAlerts } from "../../src/data/mockAlerts";
import { mockRecentChats } from "../../src/data/mockChats";
import { useWeather } from "../../src/hooks/useWeather";
import { colors, radius, spacing, typography } from "../../src/theme";
import { dayLabel } from "../../src/utils/date";

function conditionFor(precipToday: number, frost: boolean, fungalRisk: boolean) {
  if (frost) return { label: "Frost Risk", icon: "snow" as const };
  if (fungalRisk) return { label: "High Fungal Risk", icon: "warning" as const };
  if (precipToday > 5) return { label: "Rain Storm Clouds", icon: "rainy" as const };
  if (precipToday > 0) return { label: "Light Showers", icon: "rainy-outline" as const };
  return { label: "Clear Skies", icon: "sunny" as const };
}

function todayLabel() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Today, ${now.getDate()} ${months[now.getMonth()]}`;
}

export default function HomeScreen() {
  const { forecast, error, loading, refresh, locationLabel } = useWeather(5);
  const unreadAlerts = mockAlerts.filter((a) => !a.read).length;

  const condition = useMemo(() => {
    if (!forecast || forecast.status !== "SUCCESS") return null;
    return conditionFor(
      forecast.total_precipitation_mm[0] ?? 0,
      forecast.frost_warning,
      forecast.high_humidity_fungal_risk
    );
  }, [forecast]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl tintColor={colors.primary} refreshing={loading} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>
          Agri<Text style={{ color: colors.primary }}>Lite</Text> Ai
        </Text>
        <View style={styles.headerIcons}>
          <HeaderIconButton name="notifications-outline" badge={unreadAlerts} onPress={() => router.push("/alerts")} />
          <HeaderIconButton name="menu-outline" onPress={() => router.push("/profile")} />
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={styles.locationLeft}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <View>
            <Text style={styles.locationName}>{locationLabel ?? "Your Location"}</Text>
            <Text style={styles.locationSub}>Current Location</Text>
          </View>
        </View>
        <View style={styles.locationRight}>
          <Text style={styles.dateText}>{todayLabel()}</Text>
          <View style={styles.liveDot} />
        </View>
      </View>

      {loading && !forecast ? (
        <Card style={styles.stateCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateText}>Fetching your local forecast…</Text>
        </Card>
      ) : error ? (
        <Card style={styles.stateCard}>
          <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
          <Text style={styles.stateText}>{error}</Text>
          <Pressable onPress={refresh}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </Pressable>
        </Card>
      ) : forecast?.status === "REQUIRES_CLARIFICATION" ? (
        <Card style={styles.stateCard}>
          <Ionicons name="help-circle-outline" size={28} color={colors.warning} />
          <Text style={styles.stateText}>{forecast.reason ?? "We need a bit more detail on your location."}</Text>
        </Card>
      ) : forecast?.status === "SUCCESS" ? (
        <>
          <Card style={styles.weatherCard}>
            <View style={styles.gaugeRow}>
              <WeatherGauge
                min={forecast.min_temperatures_celsius[0]}
                max={forecast.max_temperatures_celsius[0]}
                current={(forecast.min_temperatures_celsius[0] + forecast.max_temperatures_celsius[0]) / 2}
              />
              <View style={styles.conditionCol}>
                {condition ? <Ionicons name={condition.icon} size={40} color={colors.primary} /> : null}
                <Text style={styles.conditionText}>{condition?.label}</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Ionicons name="rainy-outline" size={16} color={colors.info} />
                <Text style={styles.metricValue}>{(forecast.total_precipitation_mm[0] ?? 0).toFixed(1)} mm</Text>
                <Text style={styles.metricLabel}>Precipitation</Text>
              </View>
              <View style={styles.metric}>
                <Ionicons
                  name={forecast.frost_warning ? "snow" : "thermometer-outline"}
                  size={16}
                  color={forecast.frost_warning ? colors.info : colors.textSecondary}
                />
                <Text style={styles.metricValue}>{forecast.frost_warning ? "Yes" : "No"}</Text>
                <Text style={styles.metricLabel}>Frost Risk</Text>
              </View>
              <View style={styles.metric}>
                <Ionicons
                  name="water-outline"
                  size={16}
                  color={forecast.high_humidity_fungal_risk ? colors.warning : colors.textSecondary}
                />
                <Text style={styles.metricValue}>{forecast.high_humidity_fungal_risk ? "High" : "Low"}</Text>
                <Text style={styles.metricLabel}>Fungal Risk</Text>
              </View>
            </View>
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastStrip} contentContainerStyle={{ gap: spacing.sm }}>
            {forecast.dates.map((date, idx) => (
              <ForecastDayPill
                key={date}
                label={dayLabel(date, idx)}
                max={forecast.max_temperatures_celsius[idx]}
                hasRain={(forecast.total_precipitation_mm[idx] ?? 0) > 0}
                active={idx === 0}
              />
            ))}
            <Pressable style={styles.forecastMore} onPress={() => router.push("/forecast")}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.forecastMoreText}>7-Day{"\n"}Forecast</Text>
            </Pressable>
          </ScrollView>
        </>
      ) : null}

      <Card style={styles.aiCard}>
        <View style={styles.aiRow}>
          <View style={styles.aiTextCol}>
            <View style={styles.aiTag}>
              <Ionicons name="sparkles" size={13} color={colors.primary} />
              <Text style={styles.aiTagText}>AI Access</Text>
            </View>
            <Text style={styles.aiTitle}>Get expert advice{"\n"}powered by AI</Text>
            <Text style={styles.aiSubtitle}>Ask questions about crops, weather, pests, diseases and more.</Text>
          </View>
          <View style={styles.aiIconWrap}>
            <Ionicons name="leaf" size={28} color={colors.textOnPrimary} />
          </View>
        </View>
        <Pressable style={styles.aiButton} onPress={() => router.push("/chat")}>
          <Text style={styles.aiButtonText}>Ask AgriLite AI</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.textOnPrimary} />
        </Pressable>
      </Card>

      <SectionHeader icon="chatbubble-ellipses-outline" title="Recent Chats" actionLabel="View all" onAction={() => router.push("/chat")} />
      <View style={{ gap: spacing.sm }}>
        {mockRecentChats.map((chat) => (
          <Pressable key={chat.id} onPress={() => router.push("/chat")}>
            <Card style={styles.chatRow}>
              <View style={styles.chatIcon}>
                <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chatQuestion} numberOfLines={1}>{chat.question}</Text>
                <Text style={styles.chatMeta}>{chat.location} • {chat.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { fontSize: 22, fontWeight: "800", color: colors.text },
  headerIcons: { flexDirection: "row", gap: spacing.sm },

  locationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  locationName: { ...typography.bodyStrong },
  locationSub: { ...typography.caption },
  locationRight: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dateText: { ...typography.caption },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },

  stateCard: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xxl },
  stateText: { ...typography.body, textAlign: "center" },
  retryText: { color: colors.primary, fontWeight: "700", fontSize: 13 },

  weatherCard: { gap: spacing.lg },
  gaugeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  conditionCol: { flex: 1, alignItems: "center", gap: spacing.sm },
  conditionText: { ...typography.h3, textAlign: "center" },
  metricsRow: { flexDirection: "row", gap: spacing.sm },
  metric: { flex: 1, alignItems: "center", gap: 2, backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingVertical: spacing.sm },
  metricValue: { ...typography.bodyStrong, fontSize: 13 },
  metricLabel: { ...typography.caption },

  forecastStrip: { flexGrow: 0 },
  forecastMore: {
    width: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  forecastMoreText: { fontSize: 10, fontWeight: "700", color: colors.primary, textAlign: "center" },

  aiCard: { backgroundColor: colors.surface, gap: spacing.lg },
  aiRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  aiTextCol: { flex: 1, gap: spacing.sm },
  aiTag: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  aiTagText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  aiTitle: { fontSize: 20, fontWeight: "800", color: colors.text, lineHeight: 26 },
  aiSubtitle: { ...typography.body, fontSize: 13, lineHeight: 18 },
  aiIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 13,
  },
  aiButtonText: { fontWeight: "700", color: colors.textOnPrimary, fontSize: 14 },

  chatRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  chatIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  chatQuestion: { ...typography.bodyStrong, fontSize: 13 },
  chatMeta: { ...typography.caption, marginTop: 2 },
});
