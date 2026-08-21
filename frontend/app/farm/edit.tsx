import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { updateFarm } from "../../src/api/supabase/farms";
import type { Farm } from "../../src/api/supabase/types";
import { Button, FormField, ScreenHeader } from "../../src/components";
import { useFarm } from "../../src/hooks/useFarm";
import { spacing, useTheme, type ColorPalette } from "../../src/theme";

export default function EditFarmScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { farm, loading, refresh } = useFarm();

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Edit Farm" />
      {loading || !farm ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <EditFarmForm farm={farm} onSaved={refresh} />
      )}
    </View>
  );
}

function EditFarmForm({ farm, onSaved }: { farm: Farm; onSaved: () => Promise<void> }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState(farm.name);
  const [location, setLocation] = useState(farm.location_label ?? "");
  const [hectares, setHectares] = useState(farm.total_hectares != null ? String(farm.total_hectares) : "");
  const [farmType, setFarmType] = useState(farm.farm_type ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      setError("Farm name is required.");
      return;
    }
    const parsedHectares = hectares.trim() ? Number(hectares) : null;
    if (parsedHectares !== null && !Number.isFinite(parsedHectares)) {
      setError("Total area must be a number.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateFarm(farm.id, {
        name: name.trim(),
        location_label: location.trim() || null,
        total_hectares: parsedHectares,
        farm_type: farmType.trim() || null,
      });
      await onSaved();
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes right now.");
      setSaving(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <FormField label="Farm Name" value={name} onChangeText={setName} />
      <FormField label="Location" value={location} onChangeText={setLocation} />
      <FormField label="Total Area (ha)" value={hectares} onChangeText={setHectares} keyboardType="decimal-pad" />
      <FormField label="Farm Type" value={farmType} onChangeText={setFarmType} />

      {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}

      <Button label="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  });
}
