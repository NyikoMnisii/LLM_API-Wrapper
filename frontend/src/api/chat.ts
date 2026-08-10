import { apiClient } from "./client";
import type { AgronomistResponse, ChatPayload } from "./types";

export function sendChatMessage(payload: ChatPayload): Promise<AgronomistResponse> {
  return apiClient.post<AgronomistResponse>("/chat", payload);
}
