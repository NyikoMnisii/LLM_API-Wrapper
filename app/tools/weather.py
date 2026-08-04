from app.services.tool_executor import ToolSpec
from app.services.weather_service import WeatherService


def build_weather_tool_spec(weather_service: WeatherService) -> ToolSpec:
    """Adapts WeatherService into a provider-agnostic ToolSpec for LLM function calling."""

    async def handler(location: str, days: int = 3) -> dict:
        forecast = await weather_service.get_agricultural_forecast(location, days)
        return forecast.model_dump(mode="json")

    return ToolSpec(
        name="get_agricultural_weather",
        description=(
            "Fetch a multi-day weather forecast for a farming region to check for frost, "
            "rain, or disease risks."
        ),
        parameters={
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": (
                        "The city, town, or farming district name typed by the user "
                        "(e.g., 'Ceres', 'Iowa City')."
                    ),
                },
                "days": {
                    "type": "integer",
                    "description": "Number of days to forecast. Must be between 1 and 7. Defaults to 3.",
                },
            },
            "required": ["location"],
        },
        handler=handler,
    )
