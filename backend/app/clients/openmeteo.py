import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.exceptions import ExternalAPIError

def _default_retry():
    return retry(
        retry=retry_if_exception_type(httpx.HTTPError),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=0.5, max=4),
        reraise=True,
    )


class OpenMeteoClient:
    """Thin async wrapper around the Open-Meteo geocoding and forecast APIs."""

    def __init__(self, http_client: httpx.AsyncClient, geocode_url: str, forecast_url: str):
        self._http = http_client
        self._geocode_url = geocode_url
        self._forecast_url = forecast_url

    @_default_retry()
    async def geocode(self, location: str, count: int = 3) -> list[dict]:
        try:
            response = await self._http.get(
                self._geocode_url,
                params={"name": location, "count": count, "language": "en", "format": "json"},
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ExternalAPIError(f"Open-Meteo geocoding request failed: {exc}") from exc

        return response.json().get("results", [])

    @_default_retry()
    async def forecast(self, latitude: float, longitude: float, days: int) -> dict:
        try:
            response = await self._http.get(
                self._forecast_url,
                params={
                    "latitude": latitude,
                    "longitude": longitude,
                    "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max",
                    "forecast_days": days,
                    "timezone": "auto",
                },
            )
            response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ExternalAPIError(f"Open-Meteo forecast request failed: {exc}") from exc

        return response.json().get("daily", {})
