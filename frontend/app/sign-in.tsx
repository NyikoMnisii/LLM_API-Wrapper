import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../src/components";
import { useAuth } from "../src/hooks/useAuth";
import { radius, spacing, useTheme, type ColorPalette, type Typography } from "../src/theme";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) setError(signInError);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to AgriLite AI</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Sign In"
          onPress={handleSignIn}
          loading={loading}
          disabled={!email || !password}
          style={styles.submit}
        />

        <Link href="/sign-up" style={styles.link}>
          <Text style={styles.linkText}>
            Don&apos;t have an account? <Text style={styles.linkTextStrong}>Sign up</Text>
          </Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    content: { flexGrow: 1, justifyContent: "center", padding: spacing.xl, gap: spacing.lg },
    header: { gap: 4, marginBottom: spacing.sm },
    title: { ...typography.display },
    subtitle: { ...typography.body },
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
    error: { ...typography.caption, color: colors.danger },
    submit: { marginTop: spacing.sm },
    link: { alignSelf: "center", marginTop: spacing.md },
    linkText: { ...typography.caption },
    linkTextStrong: { color: colors.primary, fontWeight: "700" },
  });
}
