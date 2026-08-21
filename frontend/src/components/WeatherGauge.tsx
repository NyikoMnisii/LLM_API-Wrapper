import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme, type ColorPalette } from "../theme";

const SIZE = 240;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
// Gauge sweeps 270° starting at 135° (bottom-left) through the top to 45° (bottom-right),
// leaving a 90° gap at the bottom — mirrors a speedometer-style dial.
const START_ANGLE = 135;
const SWEEP = 270;

function polarToCartesian(angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function WeatherGauge({
  min,
  max,
  current,
  unit = "°",
}: {
  min: number;
  max: number;
  current: number;
  unit?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const clamped = Math.min(Math.max(current, min), max);
  const ratio = max === min ? 1 : (clamped - min) / (max - min);
  const progressAngle = START_ANGLE + SWEEP * ratio;
  const marker = polarToCartesian(progressAngle);

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primaryDark} />
            <Stop offset="100%" stopColor={colors.primary} />
          </LinearGradient>
        </Defs>
        <Path
          d={arcPath(START_ANGLE, START_ANGLE + SWEEP)}
          stroke={colors.surfaceAlt}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={arcPath(START_ANGLE, progressAngle)}
          stroke="url(#gaugeGradient)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={marker.x} cy={marker.y} r={STROKE / 2 + 3} fill={colors.primary} />
        <Circle cx={marker.x} cy={marker.y} r={STROKE / 2 - 1} fill={colors.text} />
      </Svg>

      <View style={styles.centerLabel} pointerEvents="none">
        <Text style={styles.currentValue}>
          {Math.round(current)}
          {unit}
        </Text>
      </View>

      <Text style={[styles.edgeLabel, styles.minLabel]}>
        {Math.round(min)}
        {unit}
      </Text>
      <Text style={[styles.edgeLabel, styles.maxLabel]}>
        {Math.round(max)}
        {unit}
      </Text>
    </View>
  );
}

function makeStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
    centerLabel: { position: "absolute", alignItems: "center", justifyContent: "center" },
    currentValue: { fontSize: 46, fontWeight: "800", color: colors.text },
    edgeLabel: { position: "absolute", fontSize: 13, fontWeight: "700", color: colors.textSecondary, bottom: 18 },
    minLabel: { left: 6 },
    maxLabel: { right: 6 },
  });
}
