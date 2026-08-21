import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { createCrop } from "../../src/api/supabase/crops";
import { Button, ChipPicker, EmptyState, FormField, ScreenHeader } from "../../src/components";
import { useCropTypes } from "../../src/hooks/useCrops";
import { useFarm } from "../../src/hooks/useFarm";
import { useFields } from "../../src/hooks/useFields";
import { spacing, useTheme, type ColorPalette } from "../../src/theme";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewCropScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { farm } = useFarm();
  const { fields, loading: fieldsLoading } = useFields(farm?.id);
  const { cropTypes } = useCropTypes();

  const [fieldId, setFieldId] = useState<string | null>(null);
  const [cropTypeId, setCropTypeId] = useState<string | null>(null);
  const [variety, setVariety] = useState("");
  const [plantedOn, setPlantedOn] = useState(todayIso());
  const [expectedHarvest, setExpectedHarvest] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!fieldId || !plantedOn.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await createCrop({
        field_id: fieldId,
        crop_type_id: cropTypeId ? Number(cropTypeId) : null,
        variety: variety.trim() || null,
        planted_on: plantedOn.trim(),
        expected_harvest_date: expectedHarvest.trim() || null,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add this crop right now.");
      setSaving(false);
    }
  }

  if (!fieldsLoading && fields.length === 0) {
    return (
      <View style={styles.screen}>
        <ScreenHeader showBack title="Add Crop" />
        <EmptyState
          icon="grid-outline"
          title="Add a field first"
          message="Crops belong to a field — add a field to your farm, then come back to plant a crop."
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Add Crop" />
      <ScrollView contentContainerStyle={styles.content}>
        <ChipPicker
          label="Field"
          options={fields.map((f) => ({ id: f.id, label: f.name }))}
          value={fieldId}
          onChange={setFieldId}
        />
        <ChipPicker
          label="Crop Type"
          options={cropTypes.map((t) => ({ id: String(t.id), label: `${t.emoji ?? ""} ${t.name}`.trim() }))}
          value={cropTypeId}
          onChange={setCropTypeId}
          emptyMessage="No crop types available."
        />
        <FormField label="Variety" value={variety} onChangeText={setVariety} placeholder="Optional" />
        <FormField label="Planted On" value={plantedOn} onChangeText={setPlantedOn} placeholder="YYYY-MM-DD" />
        <FormField label="Expected Harvest" value={expectedHarvest} onChangeText={setExpectedHarvest} placeholder="YYYY-MM-DD (optional)" />
        <FormField label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Optional" />

        {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}

        <Button
          label="Add Crop"
          onPress={handleCreate}
          loading={saving}
          disabled={!fieldId || !plantedOn.trim()}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  });
}
