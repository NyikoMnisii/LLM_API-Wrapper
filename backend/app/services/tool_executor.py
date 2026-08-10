from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from app.core.exceptions import ToolExecutionError
from app.core.logging import get_logger

logger = get_logger(__name__)

ToolHandler = Callable[..., Awaitable[dict[str, Any]]]


@dataclass(frozen=True)
class ToolSpec:
    """Provider-agnostic description of a callable tool: its name, docs, JSON-schema
    parameters, and async handler. LLM-specific services adapt this into whatever
    function-calling format their provider expects."""

    name: str
    description: str
    parameters: dict[str, Any]
    handler: ToolHandler


class ToolExecutor:
    """Executes registered tools by name, independent of which LLM requested them."""

    def __init__(self, specs: list[ToolSpec]):
        self._specs = {spec.name: spec for spec in specs}

    @property
    def specs(self) -> list[ToolSpec]:
        return list(self._specs.values())

    async def execute(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        spec = self._specs.get(name)
        if spec is None:
            raise ToolExecutionError(f"Unknown tool requested: {name}")

        logger.info("Executing tool '%s' with arguments: %s", name, arguments)
        return await spec.handler(**arguments)
