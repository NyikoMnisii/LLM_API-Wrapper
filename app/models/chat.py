from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(description="The role of the sender, either 'user', 'model', or 'function'.")
    content: str = Field(description="The text content or tool output of the message.")


class ChatPayload(BaseModel):
    message: str = Field(description="The latest prompt submitted by the user.")
    history: list[ChatMessage] = Field(
        default_factory=list, description="The list of previous message payloads for context continuity."
    )
