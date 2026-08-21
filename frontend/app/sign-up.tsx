import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../src/components";
import { useAuth } from "../src/hooks/useAuth";
import { radius, spacing, useTheme, type ColorPalette, type Typography } from "../src/theme";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const result = await signUp(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.needsConfirmation) {
      setNeedsConfirmation(true);
    }
    // Otherwise a session was created immediately and the root layout's
    // Stack.Protected guard will swap to the (tabs) group on its own.
  };

  if (needsConfirmation) {
    return (
      <View style={styles.confirmScreen}>
        <Ionicons name="mail-outline" size={40} color={colors.primary} />
        <Text style={styles.confirmTitle}>Check your email</Text>
        <Text style={styles.confirmBody}>
          We sent a confirmation link to {email}. Follow it to activate your account, then sign in.
        </Text>
        <Button label="Back to Sign In" onPress={() => router.replace("/sign-in")} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join AgriLite AI</Text>
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
            placeholder="At least 6 characters"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          disabled={!email || !password || !confirmPassword}
          style={styles.submit}
        />

        <Link href="/sign-in" style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextStrong}>Sign in</Text>
          </Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
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

    confirmScreen: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.xxxl,
      gap: spacing.sm,
    },
    confirmTitle: { ...typography.h1, marginTop: spacing.md },
    confirmBody: { ...typography.body, textAlign: "center" },
  });
}
