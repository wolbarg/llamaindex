/**
 * Resolve block options and build remember metadata.
 */

import { defaultFormatContext } from "./format.js";
import type {
  ResolvedWolbargMemoryBlockOptions,
  WolbargMemoryBlockOptions,
} from "./types.js";

export function resolveOptions(
  options: WolbargMemoryBlockOptions,
): ResolvedWolbargMemoryBlockOptions {
  if (!options?.memory) {
    throw new Error("@wolbarg/llamaindex: memory is required");
  }
  if (typeof options.agent !== "string" || options.agent.trim().length === 0) {
    throw new Error("@wolbarg/llamaindex: agent must be a non-empty string");
  }

  return {
    memory: options.memory,
    agent: options.agent.trim(),
    topK: options.topK ?? 5,
    ...(options.threshold !== undefined ? { threshold: options.threshold } : {}),
    ...(options.sessionId !== undefined ? { sessionId: options.sessionId } : {}),
    ...(options.userId !== undefined ? { userId: options.userId } : {}),
    ...(options.tags !== undefined ? { tags: options.tags } : {}),
    ...(options.namespace !== undefined ? { namespace: options.namespace } : {}),
    metadata: { ...(options.metadata ?? {}) },
    formatContext: options.formatContext ?? defaultFormatContext,
    rememberMode: options.rememberMode ?? "raw",
    rawStrategy: options.rawStrategy ?? "last_user",
    ...(options.onError ? { onError: options.onError } : {}),
  };
}

/** Build remember metadata including session/user/tags/namespace. */
export function buildRememberMetadata(
  options: ResolvedWolbargMemoryBlockOptions,
): Record<string, unknown> {
  const meta: Record<string, unknown> = { ...options.metadata };
  if (options.sessionId !== undefined) meta.sessionId = options.sessionId;
  if (options.userId !== undefined) meta.userId = options.userId;
  if (options.tags !== undefined) meta.tags = options.tags;
  if (options.namespace !== undefined) meta.namespace = options.namespace;
  meta.source = "wolbarg-llamaindex";
  return meta;
}

export function notifyError(
  onError: ((error: unknown, phase: "recall" | "remember") => void) | undefined,
  error: unknown,
  phase: "recall" | "remember",
): void {
  if (!onError) return;
  try {
    onError(error, phase);
  } catch {
    // Never let error hooks break the agent path.
  }
}
