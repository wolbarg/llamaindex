/**
 * Minimal Wolbarg-like memory for unit tests.
 */

import type { ConversationMessage, RecallResult, RememberResult } from "wolbarg";

export type MockMemoryCalls = {
  recalls: Array<{ query: string; filter?: unknown; topK?: number; threshold?: number }>;
  remembers: Array<{
    messages: ConversationMessage[];
    options: unknown;
  }>;
};

export function createMockMemory(options?: {
  hits?: RecallResult[];
  recallError?: Error;
  rememberError?: Error;
  rememberResults?: RememberResult[];
}): {
  memory: {
    recall: (opts: {
      query: string;
      topK?: number;
      threshold?: number;
      filter?: unknown;
    }) => Promise<RecallResult[]>;
    rememberFromMessages: (
      messages: ConversationMessage[],
      opts: unknown,
    ) => Promise<RememberResult[]>;
  };
  calls: MockMemoryCalls;
} {
  const calls: MockMemoryCalls = { recalls: [], remembers: [] };
  const hits = options?.hits ?? [];

  return {
    calls,
    memory: {
      async recall(opts) {
        calls.recalls.push({
          query: opts.query,
          filter: opts.filter,
          topK: opts.topK,
          threshold: opts.threshold,
        });
        if (options?.recallError) throw options.recallError;
        return hits;
      },
      async rememberFromMessages(messages, opts) {
        calls.remembers.push({ messages, options: opts });
        if (options?.rememberError) throw options.rememberError;
        return (
          options?.rememberResults ??
          messages
            .filter((m) => m.role === "user")
            .map((m, i) => ({
              id: `mem-${i}`,
              organization: "test",
              agent: "assistant",
              content: { text: m.content },
              metadata: {},
              archived: false,
              compressedInto: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              action: "created" as const,
            }))
        );
      },
    },
  };
}

export function hit(text: string, id = "h1"): RecallResult {
  return {
    id,
    organization: "org",
    agent: "assistant",
    content: { text },
    metadata: {},
    archived: false,
    similarity: 0.9,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
