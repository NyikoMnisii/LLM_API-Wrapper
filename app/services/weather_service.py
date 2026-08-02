from cachetools import TTLCache

from app.clients.openmeteo import OpenMeteoClient
from app.models.weather import GeocodeResult, WeatherForecast, WeatherStatus
from app.utils.helpers import format_location_options
from app.utils.validations import clamp_forecast_days


class WeatherService:
    """Business logic for resolving farm locations and evaluating agricultural weather risk.

    Kept independent of any LLM SDK so it can be reused by the /weather route, by
    Gemini function-calling, or by any future tool-calling provider.
    """

    def __init__(self, client: OpenMeteoClient, cache_size: int = 256, cache_ttl_seconds: int = 3600):
        self._client = client
        self._geocode_cache: TTLCache = TTLCache(maxsize=cache_size, ttl=cache_ttl_seconds)

    async def _geocode(self, location: str) -> list[dict]:
        key = location.strip().lower()
        if key in self._geocode_cache:
            return self._geocode_cache[key]

        results = await self._client.geocode(location)
        self._geocode_cache[key] = results
        return results

    async def get_agricultural_forecast(self, location: str, days: int = 3) -> WeatherForecast:
        days = clamp_forecast_days(days)
        results = await self._geocode(location)

        if not results:
            return WeatherForecast(
                status=WeatherStatus.REQUIRES_CLARIFICATION,
                reason=(
                    f"I couldn't find any location named '{location}'. "
                    "Could you check the spelling or add a province/country?"
                ),
            )

        if len(results) > 1 and results[0]["name"] == results[1]["name"]:
            options = [GeocodeResult(**result).display_name for result in results[:3]]
            return WeatherForecast(
                status=WeatherStatus.REQUIRES_CLARIFICATION,
                reason=(
                    f"I found multiple places named '{location}'. Did you mean:\n"
                    + format_location_options(options)
                ),
            )

        best_match = GeocodeResult(**results[0])
        daily = await self._client.forecast(best_match.latitude, best_match.longitude, days)

        if not daily:
            return WeatherForecast(
                status=WeatherStatus.ERROR, reason="Failed to retrieve metrics from weather station."
            )

        min_temps = daily.get("temperature_2m_min", [])
        max_humidities = daily.get("relative_humidity_2m_max", [])

        return WeatherForecast(
            status=WeatherStatus.SUCCESS,
            resolved_location=best_match.display_name,
            dates=daily.get("time", []),
            min_temperatures_celsius=min_temps,
            max_temperatures_celsius=daily.get("temperature_2m_max", []),
            total_precipitation_mm=daily.get("precipitation_sum", []),
            frost_warning=any(t is not None and t <= 2.0 for t in min_temps),
            high_humidity_fungal_risk=any(h is not None and h >= 85 for h in max_humidities),
        )
