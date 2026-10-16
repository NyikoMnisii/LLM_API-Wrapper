import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { ActivityIndicator, Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/hooks/useAuth";
import { FarmProvider, useFarm } from "../src/hooks/useFarm";
import { LocationProvider } from "../src/hooks/useResolvedLocation";
import { ThemeProvider, useTheme } from "../src/theme";

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { hasFarm, loading: farmLoading } = useFarm();
  const { scheme, colors } = useTheme();

  if (isLoading || (session && farmLoading)) {
    return (
      // Flattened structure avoids array-level style mismatch constraints
      <View style={{ ...styles.loading, backgroundColor: colors.background as string }}>
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
          contentStyle: {
            backgroundColor: colors.background as string,
          },
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

function WebFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={webStyles.webOuter}>
      <View style={webStyles.webFrame}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <FarmProvider>
            <LocationProvider>
              <WebFrame>
                <RootNavigator />
              </WebFrame>
            </LocationProvider>
          </FarmProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// Plain cross-platform styles handled natively via StyleSheet
const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});


const webStyles = {
  webOuter: {
    alignItems: "center",
    ...Platform.select({
      native: {
        flex: 1,
      },
      web: {
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      },
    }),
  } as ViewStyle,

  webFrame: {
    width: "100%",
    maxWidth: 480,
    ...Platform.select({
      native: {
        flex: 1,
      },
      web: {
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      },
    }),
  } as ViewStyle,
};
