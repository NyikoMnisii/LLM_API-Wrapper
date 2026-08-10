import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
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
import type { ChatMessage } from "../../src/api/types";
import { ChatBubble, ChatRecommendations, ScreenHeader } from "../../src/components";
import { useDeviceLocation } from "../../src/hooks/useLocation";
import { colors, radius, spacing, typography } from "../../src/theme";

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
  const { location } = useDeviceLocation();
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const history: ChatMessage[] = messages
    .filter((m) => m.id !== "greeting" && !m.isError)
    .map((m) => ({ role: m.role, content: m.content }));

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMessage: DisplayMessage = { id: `${Date.now()}-user`, role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await sendChatMessage({
        message: text,
        history,
        latitude: location?.latitude,
        longitude: location?.longitude,
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
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
