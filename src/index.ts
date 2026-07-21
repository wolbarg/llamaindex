/**
 * @wolbarg/llamaindex — Official LlamaIndexTS long-term memory block for Wolbarg.
 *
 * Use with `createMemory({ memoryBlocks: [wolbargBlock({ ... })] })`.
 *
 * @example
 * ```ts
 * import { createMemory } from "llamaindex";
 * import { wolbargBlock } from "@wolbarg/llamaindex";
 *
 * const memory = createMemory({
 *   memoryBlocks: [
 *     wolbargBlock({ memory: wolbargClient, agent: "assistant" }),
 *   ],
 * });
 * ```
 *
 * @packageDocumentation
 */

export {
  WolbargMemoryBlock,
  wolbargBlock,
  createWolbargMemoryBlock,
} from "./block.js";
export { defaultFormatContext, WOLBARG_MEMORY_CONTENT_MARKER } from "./format.js";

export type {
  WolbargMemoryBlockOptions,
  ResolvedWolbargMemoryBlockOptions,
} from "./types.js";
