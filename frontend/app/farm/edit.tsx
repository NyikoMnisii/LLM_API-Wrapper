import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, ScreenHeader } from "../../src/components";
import { mockFarm } from "../../src/data/mockFarm";
import { colors, radius, spacing, typography } from "../../src/theme";

export default function EditFarmScreen() {
  const [name, setName] = useState(mockFarm.name);
  const [location, setLocation] = useState(mockFarm.location);
  const [hectares, setHectares] = useState(String(mockFarm.hectares));
  const [farmType, setFarmType] = useState(mockFarm.farmType);

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Edit Farm" />
      <ScrollView contentContainerStyle={styles.content}>
        <Field label="Farm Name" value={name} onChangeText={setName} />
        <Field label="Location" value={location} onChangeText={setLocation} />
        <Field label="Total Area (ha)" value={hectares} onChangeText={setHectares} keyboardType="decimal-pad" />
        <Field label="Farm Type" value={farmType} onChangeText={setFarmType} />

        <Button label="Save Changes" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "decimal-pad";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  field: { gap: spacing.sm },
  label: { ...typography.captionStrong },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 14,
  },
});
