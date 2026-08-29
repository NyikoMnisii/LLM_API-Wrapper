import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { createActivity } from "../../src/api/supabase/activities";
import type { ActivityType } from "../../src/api/supabase/types";
import { Button, ChipPicker, FormField, ScreenHeader } from "../../src/components";
import { useCrops } from "../../src/hooks/useCrops";
import { useFarm } from "../../src/hooks/useFarm";
import { useFields } from "../../src/hooks/useFields";
import { spacing, useTheme, type ColorPalette } from "../../src/theme";

const ACTIVITY_TYPES: { id: ActivityType; label: string }[] = [
  { id: "irrigation", label: "Irrigation" },
  { id: "spraying", label: "Spraying" },
  { id: "fertilizing", label: "Fertilizing" },
  { id: "planting", label: "Planting" },
  { id: "harvest", label: "Harvest" },
  { id: "scouting", label: "Scouting" },
  { id: "soil_test", label: "Soil Test" },
  { id: "other", label: "Other" },
];

export default function NewActivityScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { farm } = useFarm();
  const { fields } = useFields(farm?.id);
  const { crops } = useCrops(farm?.id);

  const [activityType, setActivityType] = useState<string | null>(null);
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [cropId, setCropId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const cropsInField = fieldId ? crops.filter((c) => c.field_id === fieldId) : crops;

  async function handleCreate() {
    if (!farm || !activityType) return;
    const parsedQuantity = quantity.trim() ? Number(quantity) : null;
    if (parsedQuantity !== null && !Number.isFinite(parsedQuantity)) {
      setError("Quantity must be a number.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createActivity({
        farm_id: farm.id,
        activity_type: activityType as ActivityType,
        field_id: fieldId,
        crop_id: cropId,
        description: description.trim() || null,
        quantity: parsedQuantity,
        unit: unit.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't log this activity right now.");
      setSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Log Activity" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <ChipPicker
          label="Activity Type"
          options={ACTIVITY_TYPES.map((t) => ({ id: t.id, label: t.label }))}
          value={activityType}
          onChange={setActivityType}
        />
        <ChipPicker
          label="Field"
          options={fields.map((f) => ({ id: f.id, label: f.name }))}
          value={fieldId}
          onChange={(id) => {
            setFieldId(id);
            setCropId(null);
          }}
          emptyMessage="No fields yet — this is optional."
        />
        <ChipPicker
          label="Crop"
          options={cropsInField.map((c) => ({ id: c.id, label: c.crop_types?.name ?? c.variety ?? "Crop" }))}
          value={cropId}
          onChange={setCropId}
          emptyMessage="No crops yet — this is optional."
        />
        <FormField label="Description" value={description} onChangeText={setDescription} multiline placeholder="Optional" />
        <FormField label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="Optional" />
        <FormField label="Unit" value={unit} onChangeText={setUnit} placeholder="e.g. mm, L, kg (optional)" />

        {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}

        <Button label="Log Activity" onPress={handleCreate} loading={saving} disabled={!activityType} style={{ marginTop: spacing.lg }} />
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
