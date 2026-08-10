from typing import cast

import pytest

from app.models.weather import WeatherForecast, WeatherStatus
from app.services.weather_service import WeatherService
from app.tools.weather import build_weather_tool_spec


class FakeWeatherService:
    def __init__(self):
        self.calls: list[tuple] = []

    async def get_agricultural_forecast(self, location, days=3):
        self.calls.append(("by_name", location, days))
        return WeatherForecast(status=WeatherStatus.SUCCESS, resolved_location=location)

    async def get_agricultural_forecast_by_coordinates(self, latitude, longitude, days=3, location_label=None):
        self.calls.append(("by_coordinates", latitude, longitude, days))
        return WeatherForecast(status=WeatherStatus.SUCCESS, resolved_location=location_label)


@pytest.mark.asyncio
async def test_tool_uses_named_location_when_provided():
    fake = FakeWeatherService()
    spec = build_weather_tool_spec(cast(WeatherService, fake), default_latitude=-33.93, default_longitude=18.86)

    result = await spec.handler(location="Ceres")

    assert fake.calls == [("by_name", "Ceres", 3)]
    assert result["resolved_location"] == "Ceres"


@pytest.mark.asyncio
async def test_tool_falls_back_to_default_coordinates_when_location_omitted():
    fake = FakeWeatherService()
    spec = build_weather_tool_spec(cast(WeatherService, fake), default_latitude=-33.93, default_longitude=18.86)

    result = await spec.handler()

    assert fake.calls == [("by_coordinates", -33.93, 18.86, 3)]
    assert result["status"] == WeatherStatus.SUCCESS.value


@pytest.mark.asyncio
async def test_tool_requires_clarification_without_location_or_defaults():
    fake = FakeWeatherService()
    spec = build_weather_tool_spec(cast(WeatherService, fake))

    result = await spec.handler()

    assert fake.calls == []
    assert result["status"] == WeatherStatus.REQUIRES_CLARIFICATION.value
