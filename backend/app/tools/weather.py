from typing import Optional

from app.models.weather import WeatherForecast, WeatherStatus
from app.services.tool_executor import ToolSpec
from app.services.weather_service import WeatherService


def build_weather_tool_spec(
    weather_service: WeatherService,
    default_latitude: Optional[float] = None,
    default_longitude: Optional[float] = None,
) -> ToolSpec:
    """Adapts WeatherService into a provider-agnostic ToolSpec for LLM function calling.

    `location` is optional: when the model omits it (because the user didn't name a
    place), the handler falls back to the request's default coordinates — the
    client's device location — rather than asking the model to know or repeat back
    numeric coordinates. See docs/ARCHITECTURE.md §4a.
    """

    async def handler(location: Optional[str] = None, days: int = 3) -> dict:
        if location:
            forecast = await weather_service.get_agricultural_forecast(location, days)
        elif default_latitude is not None and default_longitude is not None:
            forecast = await weather_service.get_agricultural_forecast_by_coordinates(
                default_latitude, default_longitude, days
            )
        else:
            forecast = WeatherForecast(
                status=WeatherStatus.REQUIRES_CLARIFICATION,
                reason="I don't know your location yet — please tell me a city, town, or farming district.",
            )
        return forecast.model_dump(mode="json")

    return ToolSpec(
        name="get_agricultural_weather",
        description=(
            "Fetch a multi-day weather forecast for a farming region to check for frost, rain, or "
            "disease risks. If the user's current location is available, omit 'location' entirely "
            "to use it automatically — only set 'location' when the user names a different place."
        ),
        parameters={
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": (
                        "Optional. Only set this when the user explicitly names a place other than "
                        "their current location (e.g. 'what about frost risk in Ceres'). Omit it "
                        "entirely to use the user's current location."
                    ),
                },
                "days": {
                    "type": "integer",
                    "description": "Number of days to forecast. Must be between 1 and 7. Defaults to 3.",
                },
            },
            "required": [],
        },
        handler=handler,
    )
