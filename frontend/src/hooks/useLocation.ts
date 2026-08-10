import * as Location from "expo-location";
import { useEffect, useState } from "react";

export interface DeviceLocation {
  latitude: number;
  longitude: number;
}

// Stellenbosch, South Africa — used when permission is denied or location is unavailable.
export const FALLBACK_LOCATION: DeviceLocation = { latitude: -33.9346, longitude: 18.8668 };
export const FALLBACK_LOCATION_LABEL = "Stellenbosch, South Africa";

export function useDeviceLocation() {
  const [location, setLocation] = useState<DeviceLocation | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!cancelled) {
            setLocation(FALLBACK_LOCATION);
            setIsFallback(true);
          }
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          setIsFallback(false);
        }
      } catch {
        if (!cancelled) {
          setLocation(FALLBACK_LOCATION);
          setIsFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, isFallback, loading };
}
