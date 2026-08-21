import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type ColorPalette } from "./colors";
import { makeTypography, type Typography } from "./typography";

type Scheme = "light" | "dark";

interface ThemeContextValue {
  scheme: Scheme;
  colors: ColorPalette;
  typography: Typography;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  // useColorScheme() can return null (unknown) before the native/browser
  // preference resolves — default to dark, matching this app's prior
  // dark-only behavior rather than flashing an unstyled/wrong theme.
  const systemScheme = useColorScheme();
  const scheme: Scheme = systemScheme === "light" ? "light" : "dark";

  const value = useMemo<ThemeContextValue>(() => {
    const colors = scheme === "light" ? lightColors : darkColors;
    return { scheme, colors, typography: makeTypography(colors) };
  }, [scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
