from typing import Optional

from app.models.agronomist import AgronomistResponse
from app.models.chat import ChatMessage
from app.services.gemini_service import GeminiService
from app.services.tool_executor import ToolExecutor
from app.services.weather_service import WeatherService
from app.tools.weather import build_weather_tool_spec


class AgronomistService:
    """Top-level orchestration for turning a chat turn into a structured agronomist reply.

    This is the seam where future cross-cutting concerns (analytics, multi-tool
    orchestration across soil/irrigation/market-price services, etc.) belong, keeping
    routes thin and provider services focused purely on LLM adaptation. It's also
    where the per-request tool registry is assembled: the weather tool needs this
    request's device-location default (see docs/ARCHITECTURE.md §4a), which a
    startup-time singleton can't carry.
    """

    def __init__(self, gemini_service: GeminiService, weather_service: WeatherService):
        self._gemini_service = gemini_service
        self._weather_service = weather_service

    async def answer(
        self,
        message: str,
        history: list[ChatMessage],
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
    ) -> AgronomistResponse:
        tool_executor = ToolExecutor(
            specs=[build_weather_tool_spec(self._weather_service, latitude, longitude)]
        )
        return await self._gemini_service.generate_structured_reply(message, history, tool_executor)
