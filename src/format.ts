/**
 * Default recall context formatter.
 */

import type { RecallResult } from "wolbarg";

/** Invisible-separator wrapped token — aligned with other Wolbarg adapters. */
export const WOLBARG_MEMORY_CONTENT_MARKER = "\u2063wolbarg:memory\u2063";

export function defaultFormatContext(hits: RecallResult[]): string {
  if (hits.length === 0) return "";
  const lines = hits.map((hit, i) => `${i + 1}. ${hit.content.text}`);
  return [
    WOLBARG_MEMORY_CONTENT_MARKER,
    "Relevant memories from Wolbarg (use when helpful; do not invent facts):",
    ...lines,
  ].join("\n");
}
