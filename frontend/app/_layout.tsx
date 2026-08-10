import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/index" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="forecast" />
        <Stack.Screen name="field/[id]" />
        <Stack.Screen name="crop/[id]" />
        <Stack.Screen name="farm/edit" />
        <Stack.Screen name="add" options={{ presentation: "transparentModal", animation: "fade" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
