import { apiClient } from "./client";
import type { WeatherForecast } from "./types";

export function getForecastByCoordinates(params: {
  latitude: number;
  longitude: number;
  locationLabel?: string;
  days?: number;
}): Promise<WeatherForecast> {
  const query = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    days: String(params.days ?? 5),
  });
  if (params.locationLabel) query.set("location_label", params.locationLabel);
  return apiClient.get<WeatherForecast>(`/weather/forecast?${query.toString()}`);
}

export function getForecastByLocation(location: string, days = 5): Promise<WeatherForecast> {
  const query = new URLSearchParams({ location, days: String(days) });
  return apiClient.get<WeatherForecast>(`/weather/forecast?${query.toString()}`);
}
