import { useCallback, useEffect, useState } from "react";
import { getForecastByCoordinates } from "../api/weather";
import type { WeatherForecast } from "../api/types";
import { ApiError } from "../api/client";
import { FALLBACK_LOCATION, FALLBACK_LOCATION_LABEL, useDeviceLocation } from "./useLocation";

export function useWeather(days = 5) {
  const { location, isFallback, loading: locating } = useDeviceLocation();
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getForecastByCoordinates({
        latitude: location.latitude,
        longitude: location.longitude,
        locationLabel: isFallback ? FALLBACK_LOCATION_LABEL : undefined,
        days,
      });
      setForecast(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the weather right now.");
    } finally {
      setLoading(false);
    }
  }, [location, isFallback, days]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return {
    forecast,
    error,
    loading: locating || loading,
    refresh: fetchForecast,
    coordinates: location ?? FALLBACK_LOCATION,
    locationLabel: isFallback ? FALLBACK_LOCATION_LABEL : undefined,
  };
}
