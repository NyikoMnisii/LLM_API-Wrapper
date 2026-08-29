import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { createField } from "../../src/api/supabase/fields";
import { Button, FormField, ScreenHeader } from "../../src/components";
import { useFarm } from "../../src/hooks/useFarm";
import { spacing, useTheme, type ColorPalette } from "../../src/theme";

export default function NewFieldScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { farm } = useFarm();

  const [name, setName] = useState("");
  const [hectares, setHectares] = useState("");
  const [soilType, setSoilType] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!farm || !name.trim()) return;
    const parsedHectares = hectares.trim() ? Number(hectares) : null;
    if (parsedHectares !== null && !Number.isFinite(parsedHectares)) {
      setError("Area must be a number.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createField({
        farm_id: farm.id,
        name: name.trim(),
        hectares: parsedHectares,
        soil_type: soilType.trim() || null,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this field right now.");
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Add Field" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <FormField label="Field Name" value={name} onChangeText={setName} placeholder="e.g. North Field" />
        <FormField label="Area (ha)" value={hectares} onChangeText={setHectares} keyboardType="decimal-pad" placeholder="Optional" />
        <FormField label="Soil Type" value={soilType} onChangeText={setSoilType} placeholder="Optional" />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />

        {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}

        <Button label="Add Field" onPress={handleCreate} loading={saving} disabled={!name.trim()} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  });
}
