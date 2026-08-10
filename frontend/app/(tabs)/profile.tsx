import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../../src/components";
import { mockProfile, profileMenu } from "../../src/data/mockProfile";
import { colors, radius, spacing, typography } from "../../src/theme";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{mockProfile.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{mockProfile.name}</Text>
        <Text style={styles.role}>{mockProfile.role}</Text>
        <View style={styles.contactRow}>
          <Ionicons name="mail-outline" size={13} color={colors.textMuted} />
          <Text style={styles.contactText}>{mockProfile.email}</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={13} color={colors.textMuted} />
          <Text style={styles.contactText}>{mockProfile.phone}</Text>
        </View>
        <Text style={styles.memberSince}>Member since {mockProfile.memberSince}</Text>
      </Card>

      <View style={styles.menu}>
        {profileMenu.map((item) => (
          <Pressable key={item.id}>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
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
