import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../../src/components";
import { useAuth } from "../../src/hooks/useAuth";
import { useFarm } from "../../src/hooks/useFarm";
import { useProfile } from "../../src/hooks/useProfile";
import { spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";
import { formatMonthYear } from "../../src/utils/date";

interface ProfileMenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
  onPress: () => void;
}

function buildProfileMenu(signOut: () => void): ProfileMenuItem[] {
  return [
    { id: "account", icon: "person-outline", label: "Account Details", onPress: () => router.push("/profile/account") },
    { id: "notifications", icon: "notifications-outline", label: "Notification Preferences", onPress: () => router.push("/profile/notifications") },
    { id: "location", icon: "location-outline", label: "Farm Location", onPress: () => router.push("/farm/edit") },
    { id: "privacy", icon: "shield-checkmark-outline", label: "Privacy & Security", onPress: () => router.push({ pathname: "/profile/[topic]", params: { topic: "privacy" } }) },
    { id: "help", icon: "help-circle-outline", label: "Help & Support", onPress: () => router.push({ pathname: "/profile/[topic]", params: { topic: "help" } }) },
    { id: "terms", icon: "document-text-outline", label: "Terms & Policies", onPress: () => router.push({ pathname: "/profile/[topic]", params: { topic: "terms" } }) },
    { id: "logout", icon: "log-out-outline", label: "Log Out", danger: true, onPress: signOut },
  ];
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { farm } = useFarm();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);

  const email = session?.user.email ?? "";
  const displayName = profile?.full_name || email.split("@")[0] || "Farmer";
  // Single-farm-per-user MVP: whoever created the farm is always its owner
  // (see useFarm). There's no other role concept surfaced in the UI yet.
  const roleLabel = farm && session?.user.id === farm.owner_id ? "Farm Owner" : "Farm Member";

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>{roleLabel}</Text>
        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={13} color={colors.textMuted} />
          <Text style={styles.contactText}>{email}</Text>
        </View>
        {profile?.phone ? (
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={13} color={colors.textMuted} />
            <Text style={styles.contactText}>{profile.phone}</Text>
          </View>
        ) : null}
        {profile?.created_at ? (
          <Text style={styles.memberSince}>Member since {formatMonthYear(profile.created_at)}</Text>
        ) : null}
      </Card>

      <View style={styles.menu}>
        {buildProfileMenu(signOut).map((item) => (
          <Pressable key={item.id} onPress={item.onPress}>
            <Card style={styles.menuRow}>
              <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                <Ionicons name={item.icon} size={18} color={item.danger ? colors.danger : colors.primary} />
              </View>
              <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
              {!item.danger && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    centered: { alignItems: "center", justifyContent: "center" },
    content: { padding: spacing.xl, paddingBottom: spacing.xxxl * 2, gap: spacing.xl },
    title: { ...typography.h1 },

    profileCard: { alignItems: "center", gap: 4 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    avatarInitial: { fontSize: 28, fontWeight: "800", color: colors.textOnPrimary },
    name: { ...typography.h2 },
    role: { ...typography.caption, marginBottom: spacing.sm },
    contactRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
    contactText: { ...typography.caption },
    memberSince: { ...typography.caption, marginTop: spacing.sm },

    menu: { gap: spacing.sm },
    menuRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    menuIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    menuIconDanger: { backgroundColor: colors.dangerMuted },
    menuLabel: { ...typography.bodyStrong, flex: 1 },
    menuLabelDanger: { color: colors.danger },
  });
}
