import asyncio

from google import genai
from google.genai import types


class GeminiClient:
    """Thin async-friendly wrapper around the Gemini SDK's synchronous client."""

    def __init__(self, api_key: str, model: str):
        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def generate_content(self, contents: list, config: "types.GenerateContentConfig"):
        return await asyncio.to_thread(
            self._client.models.generate_content,
            model=self._model,
            contents=contents,
            config=config,
        )
