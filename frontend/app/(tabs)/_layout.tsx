import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabButton } from "../../src/components/TabButton";
import { radius, spacing, useTheme, type ColorPalette } from "../../src/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Tabs style={styles.tabsRoot}>
      <TabSlot />

      <TabList style={{ display: "none" }}>
        <TabTrigger name="index" href="/" />
        <TabTrigger name="my-farm" href="/my-farm" />
        <TabTrigger name="alerts" href="/alerts" />
        <TabTrigger name="profile" href="/profile" />
      </TabList>

      <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.bar}>
          <TabButton name="index" icon="home-outline" activeIcon="home" label="Home" />
          <TabButton name="my-farm" icon="leaf-outline" activeIcon="leaf" label="My Farm" />
          <View style={styles.fabSpacer} />
          <TabButton name="alerts" icon="notifications-outline" activeIcon="notifications" label="Alerts" />
          <TabButton name="profile" icon="person-outline" activeIcon="person" label="Profile" />
        </View>
        <Pressable style={styles.fab} onPress={() => router.push("/add")} hitSlop={8}>
          <Ionicons name="add" size={28} color={colors.textOnPrimary} />
        </Pressable>
      </View>
    </Tabs>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    tabsRoot: { flex: 1, backgroundColor: colors.background },
    wrap: {
      backgroundColor: colors.backgroundElevated,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    fabSpacer: { width: 64 },
    fab: {
      position: "absolute",
      alignSelf: "center",
      top: -22,
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOpacity: Platform.OS === "ios" ? 0.4 : 0,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  });
}
