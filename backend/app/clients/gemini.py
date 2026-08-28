import asyncio

from google import genai
from google.genai import types

from app.core.logging import get_logger

logger = get_logger(__name__)


class GeminiClient:
    """Thin async-friendly wrapper around the Gemini SDK's synchronous client."""

    def __init__(self, api_key: str, model: str):
        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def generate_content(
        self,
        contents: list,
        config: "types.GenerateContentConfig",
    ):
        try:
            logger.info("Calling Gemini model=%s", self._model)

            response = await asyncio.to_thread(
                self._client.models.generate_content,
                model=self._model,
                contents=contents,
                config=config,
            )

            logger.info("Gemini request completed")
            return response

        except Exception:
            logger.exception(
                "Gemini API request failed model=%s",
                self._model,
            )
            raise
