export interface ColorPalette {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;

  primary: string;
  primaryDark: string;
  primaryMuted: string;
  primaryMutedStrong: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  danger: string;
  dangerMuted: string;
  warning: string;
  warningMuted: string;
  info: string;
  infoMuted: string;

  white: string;
  overlay: string;
}

export type ColorToken = keyof ColorPalette;

export const darkColors: ColorPalette = {
  background: "#0A0F0A",
  backgroundElevated: "#0D130D",
  surface: "#121A12",
  surfaceAlt: "#0F160F",
  border: "rgba(255,255,255,0.07)",
  borderStrong: "rgba(255,255,255,0.12)",

  primary: "#8FE23A",
  primaryDark: "#5B9C1F",
  primaryMuted: "rgba(143,226,58,0.14)",
  primaryMutedStrong: "rgba(143,226,58,0.22)",

  text: "#F5F8F3",
  textSecondary: "#A7B3A4",
  textMuted: "#71806E",
  textOnPrimary: "#0A140A",

  danger: "#FF6B5E",
  dangerMuted: "rgba(255,107,94,0.14)",
  warning: "#F5B94D",
  warningMuted: "rgba(245,185,77,0.14)",
  info: "#5AC8FA",
  infoMuted: "rgba(90,200,250,0.14)",

  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.55)",
};

// Light counterpart — white surfaces, dark text. `primary`/`primaryDark` are
// deepened vs. the dark palette's lime-green (which relies on a near-black
// background for contrast) so text/icons using `colors.primary` stay legible
// on white; `textOnPrimary` flips to white to match. warning/danger/info are
// similarly deepened since the dark palette's bright pastel versions read as
// low-contrast on a white background.
export const lightColors: ColorPalette = {
  background: "#FFFFFF",
  backgroundElevated: "#F7FAF6",
  surface: "#F2F6F0",
  surfaceAlt: "#EAF0E7",
  border: "rgba(10,20,10,0.08)",
  borderStrong: "rgba(10,20,10,0.14)",

  primary: "#4C8A1D",
  primaryDark: "#396614",
  primaryMuted: "rgba(76,138,29,0.12)",
  primaryMutedStrong: "rgba(76,138,29,0.20)",

  text: "#12190F",
  textSecondary: "#4B5B48",
  textMuted: "#7A8A76",
  textOnPrimary: "#FFFFFF",

  danger: "#D6483C",
  dangerMuted: "rgba(214,72,60,0.12)",
  warning: "#B8790E",
  warningMuted: "rgba(184,121,14,0.12)",
  info: "#1E88C7",
  infoMuted: "rgba(30,136,199,0.12)",

  white: "#FFFFFF",
  overlay: "rgba(10,20,10,0.35)",
};

export const palettes: { dark: ColorPalette; light: ColorPalette } = { dark: darkColors, light: lightColors };
