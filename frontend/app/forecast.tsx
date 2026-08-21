import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, ScreenHeader } from "../src/components";
import { useWeather } from "../src/hooks/useWeather";
import { spacing, useTheme, type ColorPalette, type Typography } from "../src/theme";
import { dayLabel, formatFullDate } from "../src/utils/date";

export default function ForecastScreen() {
  const { forecast, loading, error, locationLabel } = useWeather(7);
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="7-Day Forecast" />
      <ScrollView contentContainerStyle={styles.content}>
        {locationLabel ? <Text style={styles.location}>{locationLabel}</Text> : null}

        {loading && !forecast ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : forecast?.status === "SUCCESS" ? (
          <View style={{ gap: spacing.sm }}>
            {forecast.dates.map((date, idx) => (
              <Card key={date} style={styles.row}>
                <View style={styles.dayCol}>
                  <Text style={styles.dayLabel}>{dayLabel(date, idx)}</Text>
                  <Text style={styles.dateLabel}>{formatFullDate(date)}</Text>
                </View>
                <Ionicons
                  name={(forecast.total_precipitation_mm[idx] ?? 0) > 0 ? "rainy" : "sunny"}
                  size={20}
                  color={(forecast.total_precipitation_mm[idx] ?? 0) > 0 ? colors.info : colors.warning}
                />
                <Text style={styles.precip}>{(forecast.total_precipitation_mm[idx] ?? 0).toFixed(1)} mm</Text>
                <View style={styles.tempCol}>
                  <Text style={styles.maxTemp}>{Math.round(forecast.max_temperatures_celsius[idx])}°</Text>
                  <Text style={styles.minTemp}>{Math.round(forecast.min_temperatures_celsius[idx])}°</Text>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Text style={styles.errorText}>{forecast?.reason ?? "Forecast unavailable."}</Text>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
    location: { ...typography.caption, marginBottom: spacing.xs },
    stateWrap: { paddingVertical: spacing.xxxl, alignItems: "center" },
    errorText: { ...typography.body, textAlign: "center", marginTop: spacing.xl },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    dayCol: { width: 84 },
    dayLabel: { ...typography.bodyStrong },
    dateLabel: { ...typography.caption },
    precip: { flex: 1, ...typography.caption, fontSize: 12 },
    tempCol: { flexDirection: "row", gap: spacing.sm, width: 60, justifyContent: "flex-end" },
    maxTemp: { ...typography.bodyStrong },
    minTemp: { ...typography.caption },
  });
}
