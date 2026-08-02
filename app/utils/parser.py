import json
import re
from typing import Any

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


def parse_json_response(raw_text: str) -> Any:
    """Parse a model's JSON reply, tolerating markdown code fences around the payload."""
    cleaned = _CODE_FENCE_RE.sub("", raw_text.strip())
    return json.loads(cleaned)
