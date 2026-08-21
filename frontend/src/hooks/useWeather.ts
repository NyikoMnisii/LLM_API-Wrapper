import { useCallback, useEffect, useState } from "react";
import { getForecastByCoordinates } from "../api/weather";
import type { WeatherForecast } from "../api/types";
import { ApiError } from "../api/client";
import { useResolvedLocation } from "./useResolvedLocation";

export function useWeather(days = 5) {
  const { latitude, longitude, label, loading: locating, isDeviceFallback } = useResolvedLocation();
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = useCallback(async () => {
    if (latitude == null || longitude == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getForecastByCoordinates({
        latitude,
        longitude,
        locationLabel: label ?? undefined,
        days,
      });
      setForecast(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the weather right now.");
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, label, days]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    error,
    loading: locating || loading,
    refresh: fetchForecast,
    coordinates: latitude != null && longitude != null ? { latitude, longitude } : null,
    locationLabel: label,
    isFallback: isDeviceFallback,
  };
}
