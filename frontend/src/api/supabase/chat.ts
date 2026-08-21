import { supabase } from "../../lib/supabase";
import type { ChatConversation, ChatConversationInsert, ChatMessage, ChatMessageInsert } from "./types";

export async function fetchConversations(limit = 3): Promise<ChatConversation[]> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function createConversation(input: ChatConversationInsert): Promise<ChatConversation> {
  const { data, error } = await supabase.from("chat_conversations").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function insertMessage(input: ChatMessageInsert): Promise<ChatMessage> {
  const { data, error } = await supabase.from("chat_messages").insert(input).select().single();
  if (error) throw error;
  return data;
}
