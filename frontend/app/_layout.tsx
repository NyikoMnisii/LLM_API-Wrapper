import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/hooks/useAuth";
import { useFarm } from "../src/hooks/useFarm";
import { LocationProvider } from "../src/hooks/useResolvedLocation";
import { ThemeProvider, useTheme } from "../src/theme";

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { hasFarm, loading: farmLoading } = useFarm();
  const { scheme, colors } = useTheme();

  if (isLoading || (session && farmLoading)) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </Stack.Protected>

        <Stack.Protected guard={!!session && !hasFarm}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={!!session && hasFarm}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat/index" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="forecast" />
          <Stack.Screen name="field/[id]" />
          <Stack.Screen name="field/new" />
          <Stack.Screen name="crop/[id]" />
          <Stack.Screen name="crop/new" />
          <Stack.Screen name="activity/new" />
          <Stack.Screen name="farm/edit" />
          <Stack.Screen name="profile/account" />
          <Stack.Screen name="profile/notifications" />
          <Stack.Screen name="profile/[topic]" />
          <Stack.Screen name="location/search" />
          <Stack.Screen name="add" options={{ presentation: "transparentModal", animation: "fade" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

// On a desktop browser the RN-Web app otherwise fills the full window width;
// this constrains it to a phone-sized column so it doesn't stretch edge to
// edge. No-op on native (doesn't wrap there) and effectively a no-op on an
// actual mobile browser too, since 480px already exceeds real phone widths.
function WebFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={styles.webOuter}>
      <View style={styles.webFrame}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <LocationProvider>
            <WebFrame>
              <RootNavigator />
            </WebFrame>
          </LocationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  webOuter: { flex: 1, alignItems: "center" },
  webFrame: { flex: 1, width: "100%", maxWidth: 480 },
});
