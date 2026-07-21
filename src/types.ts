/**
 * Public types for @wolbarg/llamaindex.
 */

import type {
  RecallResult,
  RememberFromMessagesRawStrategy,
  Wolbarg,
} from "wolbarg";

export type WolbargMemoryBlockOptions = {
  memory: Wolbarg;
  agent: string;

  /** Block id. Defaults to a generated UUID (LlamaIndex BaseMemoryBlock). */
  id?: string;
  /**
   * Retrieval priority among memory blocks.
   * Note: priority `0` means always include (LlamaIndex semantics).
   * Defaults to `1`.
   */
  priority?: number;
  /** Defaults to `true` (long-term block). */
  isLongTerm?: boolean;

  topK?: number;
  threshold?: number;
  sessionId?: string;
  userId?: string;
  tags?: string[];
  namespace?: string;
  metadata?: Record<string, unknown>;

  formatContext?: (hits: RecallResult[]) => string;
  rememberMode?: "raw" | "extract";
  rawStrategy?: RememberFromMessagesRawStrategy;
  onError?: (error: unknown, phase: "recall" | "remember") => void;
};

export type ResolvedWolbargMemoryBlockOptions = {
  memory: Wolbarg;
  agent: string;
  topK: number;
  threshold?: number;
  sessionId?: string;
  userId?: string;
  tags?: string[];
  namespace?: string;
  metadata: Record<string, unknown>;
  formatContext: (hits: RecallResult[]) => string;
  rememberMode: "raw" | "extract";
  rawStrategy: RememberFromMessagesRawStrategy;
  onError?: (error: unknown, phase: "recall" | "remember") => void;
};
