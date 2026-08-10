import pytest

from app.core.exceptions import ToolExecutionError
from app.services.tool_executor import ToolExecutor, ToolSpec


@pytest.mark.asyncio
async def test_tool_executor_dispatches_registered_tool():
    async def handler(value: int) -> dict:
        return {"doubled": value * 2}

    spec = ToolSpec(name="double", description="doubles a number", parameters={}, handler=handler)
    executor = ToolExecutor(specs=[spec])

    result = await executor.execute("double", {"value": 4})

    assert result == {"doubled": 8}


@pytest.mark.asyncio
async def test_tool_executor_rejects_unknown_tool():
    executor = ToolExecutor(specs=[])

    with pytest.raises(ToolExecutionError):
        await executor.execute("missing", {})
