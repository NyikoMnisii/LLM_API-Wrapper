import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { createFarm } from "../src/api/supabase/farms";
import { Button, FormField } from "../src/components";
import { useAuth } from "../src/hooks/useAuth";
import { useDeviceLocation } from "../src/hooks/useLocation";
import { useFarm } from "../src/hooks/useFarm";
import { spacing, useTheme, type ColorPalette, type Typography } from "../src/theme";

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { refresh: refreshFarm } = useFarm();
  const { location } = useDeviceLocation();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);

  const [name, setName] = useState("");
  const [farmType, setFarmType] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [hectares, setHectares] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!session?.user.id || !name.trim()) return;
    const parsedHectares = hectares.trim() ? Number(hectares) : null;
    if (parsedHectares !== null && !Number.isFinite(parsedHectares)) {
      setError("Total area must be a number.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createFarm({
        owner_id: session.user.id,
        name: name.trim(),
        farm_type: farmType.trim() || null,
        location_label: locationLabel.trim() || null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        total_hectares: parsedHectares,
      });
      // Root layout's own useFarm() instance re-fetches independently and
      // flips the Stack.Protected guard once it sees the new row; refreshing
      // this instance too just avoids a stale flash if this screen is kept mounted.
      await refreshFarm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your farm right now.");
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to AgriLite AI</Text>
          <Text style={styles.subtitle}>Let&apos;s set up your farm to get started.</Text>
        </View>

        <FormField label="Farm Name" value={name} onChangeText={setName} placeholder="e.g. Mnisi Farm" />
        <FormField label="Farm Type" value={farmType} onChangeText={setFarmType} placeholder="e.g. Mixed Crops (optional)" />
        <FormField label="Location" value={locationLabel} onChangeText={setLocationLabel} placeholder="City or district (optional)" />
        <FormField label="Total Area (ha)" value={hectares} onChangeText={setHectares} keyboardType="decimal-pad" placeholder="Optional" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Create My Farm" onPress={handleCreate} loading={saving} disabled={!name.trim()} style={styles.submit} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, justifyContent: "center", padding: spacing.xl, gap: spacing.lg },
    header: { gap: 4, marginBottom: spacing.sm },
    title: { ...typography.display, fontSize: 26 },
    subtitle: { ...typography.body },
    error: { ...typography.caption, color: colors.danger },
    submit: { marginTop: spacing.sm },
  });
}
