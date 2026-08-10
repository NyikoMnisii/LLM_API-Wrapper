export const colors = {
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
} as const;

export type ColorToken = keyof typeof colors;
