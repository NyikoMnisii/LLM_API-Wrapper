import { TextStyle } from "react-native";
import { colors } from "./colors";

type TypeScale =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyStrong"
  | "caption"
  | "captionStrong"
  | "label";

export const typography: Record<TypeScale, TextStyle> = {
  display: { fontSize: 32, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 22, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text },
  h3: { fontSize: 15, fontWeight: "600", color: colors.text },
  body: { fontSize: 14, fontWeight: "400", color: colors.textSecondary },
  bodyStrong: { fontSize: 14, fontWeight: "600", color: colors.text },
  caption: { fontSize: 12, fontWeight: "400", color: colors.textMuted },
  captionStrong: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  label: { fontSize: 11, fontWeight: "600", color: colors.textMuted, letterSpacing: 0.4 },
};
