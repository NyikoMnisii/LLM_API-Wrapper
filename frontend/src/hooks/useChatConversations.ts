import { useCallback, useEffect, useState } from "react";
import { fetchConversations, fetchMessages } from "../api/supabase/chat";
import type { ChatConversation, ChatMessage } from "../api/supabase/types";

export function useChatConversations(limit = 3) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setConversations(await fetchConversations(limit));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { conversations, loading, refresh };
}

export function useChatMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(!!conversationId);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchMessages(conversationId)
      .then((rows) => {
        if (!cancelled) setMessages(rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return { messages, loading };
}
