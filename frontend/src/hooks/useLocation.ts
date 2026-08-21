import * as Location from "expo-location";
import { useEffect, useState } from "react";

export interface DeviceLocation {
  latitude: number;
  longitude: number;
}

// Stellenbosch, South Africa — a numeric last resort so weather calls always
// have *some* coordinates. Never label this as the user's real location in
// the UI (see useWeather's `isFallback`) — it's a guess, not a GPS fix.
export const FALLBACK_LOCATION: DeviceLocation = { latitude: -33.9346, longitude: 18.8668 };
export const FALLBACK_LOCATION_LABEL = "Stellenbosch, South Africa";

const POSITION_TIMEOUT_MS = 8000;

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
        // Some browsers never resolve/reject the geolocation permission
        // prompt if it's dismissed without an explicit choice — race it
        // against a timeout so this doesn't hang forever.
        const position = await Promise.race([
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Location request timed out")), POSITION_TIMEOUT_MS)
          ),
        ]);
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
