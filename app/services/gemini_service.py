from google.genai import types

from app.clients.gemini import GeminiClient
from app.core.exceptions import LLMGenerationError
from app.core.logging import get_logger
from app.models.agronomist import AgronomistResponse
from app.models.chat import ChatMessage
from app.services.tool_executor import ToolExecutor, ToolSpec
from app.utils.parser import parse_json_response

logger = get_logger(__name__)


def _to_function_declaration(spec: ToolSpec) -> types.FunctionDeclaration:
    return types.FunctionDeclaration(
        name=spec.name,
        description=spec.description,
        parameters=types.Schema.model_validate(spec.parameters),
    )


def _history_to_contents(history: list[ChatMessage]) -> list[types.Content]:
    contents = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
    return contents


class GeminiService:
    """The only layer that knows about Gemini's SDK types. Adapts the provider-agnostic
    ToolExecutor/ToolSpec registry and system prompt to Gemini's function-calling convention,
    so swapping providers later only means writing a new *_service.py, not touching tools/ or
    services/weather_service.py.
    """

    def __init__(
        self,
        client: GeminiClient,
        tool_executor: ToolExecutor,
        system_prompt: str,
        max_tool_hops: int = 5,
    ):
        self._client = client
        self._tool_executor = tool_executor
        self._system_prompt = system_prompt
        self._max_tool_hops = max_tool_hops

    async def generate_structured_reply(self, message: str, history: list[ChatMessage]) -> AgronomistResponse:
        contents = _history_to_contents(history)
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=message)]))

        tools = [types.Tool(function_declarations=[_to_function_declaration(s) for s in self._tool_executor.specs])]

        config = types.GenerateContentConfig(
            system_instruction=self._system_prompt,
            temperature=0.3,
            top_p=0.95,
            max_output_tokens=1000,
            response_mime_type="application/json",
            response_schema=AgronomistResponse,
            tools=tools,
        )

        response = await self._client.generate_content(contents, config)

        hops = 0
        while response.function_calls and hops < self._max_tool_hops:
            hops += 1
            for call in response.function_calls:
                if call.name is None:
                    raise LLMGenerationError("Model requested a tool call without a name.")

                result = await self._tool_executor.execute(call.name, call.args or {})

                if not response.candidates or response.candidates[0].content is None:
                    raise LLMGenerationError("Model response was missing candidate content during tool calling.")

                contents.append(response.candidates[0].content)
                contents.append(
                    types.Content(
                        role="function",
                        parts=[types.Part.from_function_response(name=call.name, response=result)],
                    )
                )

            response = await self._client.generate_content(contents, config)

        if response.text is None:
            raise LLMGenerationError("Model returned an empty response.")

        try:
            return AgronomistResponse.model_validate(parse_json_response(response.text))
        except (ValueError, TypeError) as exc:
            logger.error("Failed to parse Gemini response: %s", response.text)
            raise LLMGenerationError(f"Model returned an unparsable response: {exc}") from exc
