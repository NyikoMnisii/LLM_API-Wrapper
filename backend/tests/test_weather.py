import httpx
import pytest
import pytest_asyncio
import respx

from app.clients.openmeteo import OpenMeteoClient
from app.models.weather import WeatherStatus
from app.services.weather_service import WeatherService

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


@pytest_asyncio.fixture
async def weather_service():
    async with httpx.AsyncClient() as http_client:
        client = OpenMeteoClient(http_client, GEOCODE_URL, FORECAST_URL)
        yield WeatherService(client)


@pytest.mark.asyncio
@respx.mock
async def test_forecast_success(weather_service):
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "results": [
                    {
                        "name": "Ceres",
                        "admin1": "Western Cape",
                        "country": "South Africa",
                        "latitude": -33.37,
                        "longitude": 19.32,
                    }
                ]
            },
        )
    )
    respx.get(FORECAST_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "daily": {
                    "time": ["2026-07-28"],
                    "temperature_2m_min": [1.0],
                    "temperature_2m_max": [10.0],
                    "precipitation_sum": [0.0],
                    "relative_humidity_2m_max": [90.0],
                }
            },
        )
    )

    result = await weather_service.get_agricultural_forecast("Ceres", days=1)

    assert result.status == WeatherStatus.SUCCESS
    assert result.resolved_location.startswith("Ceres")
    assert result.frost_warning is True
    assert result.high_humidity_fungal_risk is True


@pytest.mark.asyncio
@respx.mock
async def test_forecast_location_not_found(weather_service):
    respx.get(GEOCODE_URL).mock(return_value=httpx.Response(200, json={"results": []}))

    result = await weather_service.get_agricultural_forecast("Nowhereville")

    assert result.status == WeatherStatus.REQUIRES_CLARIFICATION
    assert "Nowhereville" in result.reason


@pytest.mark.asyncio
@respx.mock
async def test_forecast_by_coordinates_skips_geocoding(weather_service):
    geocode_route = respx.get(GEOCODE_URL)
    respx.get(FORECAST_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "daily": {
                    "time": ["2026-08-06"],
                    "temperature_2m_min": [10.0],
                    "temperature_2m_max": [22.0],
                    "precipitation_sum": [0.0],
                    "relative_humidity_2m_max": [50.0],
                }
            },
        )
    )

    result = await weather_service.get_agricultural_forecast_by_coordinates(
        -33.93, 18.86, days=1, location_label="Home"
    )

    assert result.status == WeatherStatus.SUCCESS
    assert result.resolved_location == "Home"
    assert result.frost_warning is False
    assert not geocode_route.called


@pytest.mark.asyncio
@respx.mock
async def test_forecast_ambiguous_location(weather_service):
    respx.get(GEOCODE_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "results": [
                    {"name": "Springfield", "admin1": "Illinois", "country": "USA", "latitude": 1, "longitude": 1},
                    {"name": "Springfield", "admin1": "Missouri", "country": "USA", "latitude": 2, "longitude": 2},
                ]
            },
        )
    )

    result = await weather_service.get_agricultural_forecast("Springfield")

    assert result.status == WeatherStatus.REQUIRES_CLARIFICATION
    assert "Illinois" in result.reason and "Missouri" in result.reason
