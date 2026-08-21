import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing, useTheme, type ColorPalette } from "../theme";

export interface ChipOption {
  id: string;
  label: string;
}

export function ChipPicker({
  label,
  options,
  value,
  onChange,
  emptyMessage,
}: {
  label: string;
  options: ChipOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  emptyMessage?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {options.length === 0 ? (
        <Text style={styles.empty}>{emptyMessage ?? "Nothing available yet."}</Text>
      ) : (
        <View style={styles.row}>
          {options.map((option) => {
            const active = option.id === value;
            return (
              <Pressable
                key={option.id}
                onPress={() => onChange(active ? null : option.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    field: { gap: spacing.sm },
    label: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
    row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    empty: { fontSize: 13, color: colors.textMuted },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
    chipLabelActive: { color: colors.textOnPrimary },
  });
}
