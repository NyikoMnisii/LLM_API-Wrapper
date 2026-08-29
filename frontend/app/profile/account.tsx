import { useMemo, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, FormField, ScreenHeader } from "../../src/components";
import { useAuth } from "../../src/hooks/useAuth";
import { useProfile } from "../../src/hooks/useProfile";
import { spacing, useTheme, type ColorPalette } from "../../src/theme";

export default function AccountDetailsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { session } = useAuth();
  const { profile, loading, save } = useProfile();

  return (
    <View style={styles.screen}>
      <ScreenHeader showBack title="Account Details" />
      {loading || !profile ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <AccountForm email={session?.user.email ?? ""} fullName={profile.full_name ?? ""} phone={profile.phone ?? ""} onSave={save} />
      )}
    </View>
  );
}

function AccountForm({
  email,
  fullName,
  phone,
  onSave,
}: {
  email: string;
  fullName: string;
  phone: string;
  onSave: (patch: { full_name?: string | null; phone?: string | null }) => Promise<void>;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [name, setName] = useState(fullName);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await onSave({ full_name: name.trim() || null, phone: phoneValue.trim() || null });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes right now.");
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.scroll} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormField label="Email" value={email} onChangeText={() => {}} editable={false} />
        <FormField label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
        <FormField label="Phone" value={phoneValue} onChangeText={setPhoneValue} keyboardType="phone-pad" placeholder="Optional" />

        {error ? <Text style={{ color: colors.danger, fontSize: 12 }}>{error}</Text> : null}

        <Button label="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  });
}
