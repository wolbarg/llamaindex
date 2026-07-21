/**
 * Convert LlamaIndex MemoryMessage ↔ Wolbarg ConversationMessage helpers.
 */

import type { MemoryMessage } from "@llamaindex/core/memory";
import type { ConversationMessage } from "wolbarg";

/** Extract plain text from LlamaIndex MessageContent (string | content parts). */
export function extractMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  const parts: string[] = [];
  for (const part of content) {
    if (!part || typeof part !== "object") continue;
    const p = part as Record<string, unknown>;
    if (p.type === "text" && typeof p.text === "string") {
      parts.push(p.text);
      continue;
    }
    if (typeof p.text === "string") {
      parts.push(p.text);
    }
  }
  return parts.join("\n").trim();
}

/** Last user message text — used as the recall query. */
export function getLastUserMessageText(
  messages: MemoryMessage[] | undefined,
): string {
  if (!messages || messages.length === 0) return "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    if (msg.role !== "user") continue;
    const text = extractMessageText(msg.content).trim();
    if (text) return text;
  }
  return "";
}

export function toConversationMessages(
  messages: MemoryMessage[],
): ConversationMessage[] {
  const out: ConversationMessage[] = [];
  for (const msg of messages) {
    if (msg.role === "memory") continue;
    const content = extractMessageText(msg.content).trim();
    if (!content) continue;
    out.push({ role: String(msg.role), content });
  }
  return out;
}
