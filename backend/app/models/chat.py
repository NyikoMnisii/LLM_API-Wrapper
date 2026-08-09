from typing import Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(description="The role of the sender, either 'user', 'model', or 'function'.")
    content: str = Field(description="The text content or tool output of the message.")


class ChatPayload(BaseModel):
    message: str = Field(description="The latest prompt submitted by the user.")
    history: list[ChatMessage] = Field(
        default_factory=list, description="The list of previous message payloads for context continuity."
    )
    latitude: Optional[float] = Field(
        default=None,
        description="Client-resolved device latitude, used as the default weather location when the user doesn't name a place.",
    )
    longitude: Optional[float] = Field(
        default=None,
        description="Client-resolved device longitude, used as the default weather location when the user doesn't name a place.",
    )
