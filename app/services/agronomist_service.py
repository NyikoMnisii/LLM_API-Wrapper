from app.models.agronomist import AgronomistResponse
from app.models.chat import ChatMessage
from app.services.gemini_service import GeminiService


class AgronomistService:
    """Top-level orchestration for turning a chat turn into a structured agronomist reply.

    This is the seam where future cross-cutting concerns (analytics, multi-tool
    orchestration across soil/irrigation/market-price services, etc.) belong, keeping
    routes thin and provider services focused purely on LLM adaptation.
    """

    def __init__(self, gemini_service: GeminiService):
        self._gemini_service = gemini_service

    async def answer(self, message: str, history: list[ChatMessage]) -> AgronomistResponse:
        return await self._gemini_service.generate_structured_reply(message, history)
