import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { EmptyState, ScreenHeader } from "../../src/components";
import type { GeocodeCandidate } from "../../src/api/geocoding";
import { useResolvedLocation } from "../../src/hooks/useResolvedLocation";
import { radius, spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";

export default function LocationSearchScreen() {
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const { search, selectLocation, useDeviceLocationInstead, isManual } = useResolvedLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChangeText(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(text), 400);
  }

  async function runSearch(text: string) {
    setSearching(true);
    setError(null);
    try {
      setResults(await search(text));
    } catch {
      setError("Couldn't search locations right now.");
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  function handleSelect(candidate: GeocodeCandidate) {
    selectLocation(candidate);
    router.back();
  }

  function handleUseDevice() {
    useDeviceLocationInstead();
    router.back();
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Change Location" />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder="Search for a city or town…"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />
      </View>

      {isManual ? (
        <Pressable style={styles.deviceRow} onPress={handleUseDevice}>
          <Ionicons name="locate" size={16} color={colors.primary} />
          <Text style={styles.deviceRowText}>Use my current location</Text>
        </Pressable>
      ) : null}

      {searching ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : searched && results.length === 0 ? (
        <EmptyState icon="location-outline" title="No matches" message="Try a different spelling or a nearby town." />
      ) : (
        <View style={{ gap: spacing.xs }}>
          {results.map((r) => (
            <Pressable key={`${r.latitude},${r.longitude}`} style={styles.resultRow} onPress={() => handleSelect(r)}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={styles.resultText}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, gap: spacing.lg },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    input: { flex: 1, minWidth: 0, color: colors.text, fontSize: 14 },
    deviceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    deviceRowText: { ...typography.bodyStrong, color: colors.primary, fontSize: 13 },
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultText: { ...typography.body, color: colors.text, fontSize: 14, flex: 1 },
    error: { ...typography.body, textAlign: "center", marginTop: spacing.xl },
  });
}
