import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { sendChatMessage } from "../../src/api/chat";
import { ApiError } from "../../src/api/client";
import { createConversation, insertMessage } from "../../src/api/supabase/chat";
import type { ChatMessage } from "../../src/api/types";
import { ChatBubble, ChatRecommendations, ScreenHeader } from "../../src/components";
import { useAuth } from "../../src/hooks/useAuth";
import { useChatMessages } from "../../src/hooks/useChatConversations";
import { useFarm } from "../../src/hooks/useFarm";
import { useResolvedLocation } from "../../src/hooks/useResolvedLocation";
import { radius, spacing, useTheme, type ColorPalette, type Typography } from "../../src/theme";

interface DisplayMessage {
  id: string;
  role: "user" | "model";
  content: string;
  recommendations?: string[];
  sustainabilityNote?: string;
  isError?: boolean;
}

const GREETING: DisplayMessage = {
  id: "greeting",
  role: "model",
  content: "Hi, I'm AgriLite AI. Ask me about crops, weather risk, pests, irrigation or anything else farming related.",
};

export default function ChatScreen() {
  const { id: initialId } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const { farm } = useFarm();
  const { latitude, longitude } = useResolvedLocation();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors, typography), [colors, typography]);

  const [conversationId, setConversationId] = useState<string | undefined>(initialId);
  const { messages: savedMessages, loading: loadingHistory } = useChatMessages(initialId);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Hydrate from a resumed conversation's saved history once it loads.
  useEffect(() => {
    if (initialId && savedMessages.length > 0) {
      setMessages(
        savedMessages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          recommendations: m.recommendations ?? undefined,
          sustainabilityNote: m.sustainability_note ?? undefined,
        }))
      );
    }
  }, [initialId, savedMessages]);

  const history: ChatMessage[] = messages
    .filter((m) => m.id !== "greeting" && !m.isError)
    .map((m) => ({ role: m.role, content: m.content }));

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || !session?.user.id) return;

    const userMessage: DisplayMessage = { id: `${Date.now()}-user`, role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await sendChatMessage({
        message: text,
        history,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-model`,
          role: "model",
          content: response.analysis,
          recommendations: response.recommendations,
          sustainabilityNote: response.sustainability_note || undefined,
        },
      ]);

      // Persist this turn. A brand-new chat creates its conversation row on
      // the first send rather than eagerly on mount, so an opened-but-unused
      // chat screen doesn't litter empty conversations.
      let activeConversationId = conversationId;
      if (!activeConversationId) {
        const conversation = await createConversation({
          user_id: session.user.id,
          farm_id: farm?.id ?? null,
          title: text.slice(0, 80),
          latitude: latitude ?? null,
          longitude: longitude ?? null,
        });
        activeConversationId = conversation.id;
        setConversationId(conversation.id);
      }
      await insertMessage({ conversation_id: activeConversationId, role: "user", content: text });
      await insertMessage({
        conversation_id: activeConversationId,
        role: "model",
        content: response.analysis,
        recommendations: response.recommendations,
        sustainability_note: response.sustainability_note || null,
        is_farming_related: response.is_farming_related,
      });
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "model",
          content: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScreenHeader showBack title="AgriLite AI" />

      {initialId && loadingHistory ? (
        <View style={styles.loadingHistory}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View>
              <ChatBubble role={item.role} content={item.content} />
              {item.recommendations ? <ChatRecommendations items={item.recommendations} /> : null}
              {item.sustainabilityNote ? (
                <View style={styles.sustainabilityRow}>
                  <Ionicons name="leaf-outline" size={13} color={colors.primary} />
                  <Text style={styles.sustainabilityText}>{item.sustainabilityNote}</Text>
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      {sending ? (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.typingText}>AgriLite AI is thinking…</Text>
        </View>
      ) : null}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about crops, weather, pests…"
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!sending}
        />
        <Pressable
          style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Ionicons name="arrow-up" size={18} color={colors.textOnPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ColorPalette, typography: Typography) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    loadingHistory: { flex: 1, alignItems: "center", justifyContent: "center" },
    list: { padding: spacing.xl, paddingBottom: spacing.lg, gap: spacing.xs },
    sustainabilityRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginLeft: 34,
      marginBottom: spacing.lg,
      backgroundColor: colors.primaryMuted,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    sustainabilityText: { flex: 1, ...typography.body, fontSize: 12, lineHeight: 17, color: colors.primary },
    typingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
    typingText: { ...typography.caption },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.sm,
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.backgroundElevated,
    },
    input: {
      flex: 1,
      minWidth: 0,
      maxHeight: 100,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      color: colors.text,
      fontSize: 14,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendButtonDisabled: { opacity: 0.4 },
  });
}
