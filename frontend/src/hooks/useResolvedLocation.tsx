import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { reverseGeocode, searchLocations, type GeocodeCandidate } from "../api/geocoding";
import { FALLBACK_LOCATION_LABEL, useDeviceLocation } from "./useLocation";

interface ResolvedLocationValue {
  latitude: number | null;
  longitude: number | null;
  label: string | null;
  loading: boolean;
  isManual: boolean;
  isDeviceFallback: boolean;
  search: (query: string) => Promise<GeocodeCandidate[]>;
  selectLocation: (candidate: GeocodeCandidate) => void;
  useDeviceLocationInstead: () => void;
}

const ResolvedLocationContext = createContext<ResolvedLocationValue | null>(null);

export function LocationProvider({ children }: PropsWithChildren) {
  const { location: deviceLocation, isFallback: isDeviceFallback, loading: deviceLoading } = useDeviceLocation();
  const [manual, setManual] = useState<GeocodeCandidate | null>(null);
  const [deviceLabel, setDeviceLabel] = useState<string | null>(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  // Reverse-geocode the device fix once it resolves, so the UI can show a
  // real place name instead of raw coordinates. Only meaningful for a real
  // GPS fix — the Stellenbosch fallback already has a (clearly-labeled) name.
  useEffect(() => {
    if (!deviceLocation || isDeviceFallback || manual) return;
    let cancelled = false;
    setReverseGeocoding(true);
    reverseGeocode(deviceLocation.latitude, deviceLocation.longitude)
      .then((label) => {
        if (!cancelled) setDeviceLabel(label);
      })
      .finally(() => {
        if (!cancelled) setReverseGeocoding(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deviceLocation, isDeviceFallback, manual]);

  const search = useCallback((query: string) => searchLocations(query), []);

  const selectLocation = useCallback((candidate: GeocodeCandidate) => {
    setManual(candidate);
  }, []);

  const useDeviceLocationInstead = useCallback(() => {
    setManual(null);
  }, []);

  const value = useMemo<ResolvedLocationValue>(() => {
    if (manual) {
      return {
        latitude: manual.latitude,
        longitude: manual.longitude,
        label: manual.label,
        loading: false,
        isManual: true,
        isDeviceFallback: false,
        search,
        selectLocation,
        useDeviceLocationInstead,
      };
    }
    return {
      latitude: deviceLocation?.latitude ?? null,
      longitude: deviceLocation?.longitude ?? null,
      label: isDeviceFallback ? FALLBACK_LOCATION_LABEL : deviceLabel,
      loading: deviceLoading || reverseGeocoding,
      isManual: false,
      isDeviceFallback,
      search,
      selectLocation,
      useDeviceLocationInstead,
    };
  }, [manual, deviceLocation, isDeviceFallback, deviceLabel, deviceLoading, reverseGeocoding, search, selectLocation, useDeviceLocationInstead]);

  return <ResolvedLocationContext.Provider value={value}>{children}</ResolvedLocationContext.Provider>;
}

export function useResolvedLocation(): ResolvedLocationValue {
  const ctx = useContext(ResolvedLocationContext);
  if (!ctx) throw new Error("useResolvedLocation must be used within LocationProvider");
  return ctx;
}
