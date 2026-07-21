/**
 * Wolbarg-backed LlamaIndexTS BaseMemoryBlock.
 */

import {
  BaseMemoryBlock,
  type MemoryMessage,
} from "@llamaindex/core/memory";
import {
  buildRememberMetadata,
  notifyError,
  resolveOptions,
} from "./options.js";
import {
  getLastUserMessageText,
  toConversationMessages,
} from "./messages.js";
import type {
  ResolvedWolbargMemoryBlockOptions,
  WolbargMemoryBlockOptions,
} from "./types.js";

export class WolbargMemoryBlock<
  TAdditionalMessageOptions extends object = object,
> extends BaseMemoryBlock<TAdditionalMessageOptions> {
  private readonly options: ResolvedWolbargMemoryBlockOptions;

  constructor(options: WolbargMemoryBlockOptions) {
    super({
      ...(options.id !== undefined ? { id: options.id } : {}),
      priority: options.priority ?? 1,
      isLongTerm: options.isLongTerm ?? true,
    });
    this.options = resolveOptions(options);
  }

  async get(
    messages?: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<MemoryMessage<TAdditionalMessageOptions>[]> {
    const query = getLastUserMessageText(
      messages as MemoryMessage[] | undefined,
    );
    if (!query) return [];

    try {
      const hits = await this.options.memory.recall({
        query,
        topK: this.options.topK,
        ...(this.options.threshold !== undefined
          ? { threshold: this.options.threshold }
          : {}),
        filter: { agent: this.options.agent },
      });

      const text = this.options.formatContext(hits).trim();
      if (!text) return [];

      return [
        {
          id: this.id,
          role: "memory",
          content: text,
        } as MemoryMessage<TAdditionalMessageOptions>,
      ];
    } catch (error) {
      notifyError(this.options.onError, error, "recall");
      return [];
    }
  }

  async put(
    messages: MemoryMessage<TAdditionalMessageOptions>[],
  ): Promise<void> {
    try {
      const conversation = toConversationMessages(
        messages as MemoryMessage[],
      );
      const hasUser = conversation.some(
        (m) => m.role === "user" && m.content.trim().length > 0,
      );
      if (!hasUser) return;

      await this.options.memory.rememberFromMessages(conversation, {
        agent: this.options.agent,
        mode: this.options.rememberMode,
        rawStrategy: this.options.rawStrategy,
        metadata: buildRememberMetadata(this.options),
      });
    } catch (error) {
      notifyError(this.options.onError, error, "remember");
    }
  }
}

/**
 * Create a Wolbarg memory block (LlamaIndex `staticBlock` / `vectorBlock` style).
 */
export function wolbargBlock<
  TAdditionalMessageOptions extends object = object,
>(
  options: WolbargMemoryBlockOptions,
): WolbargMemoryBlock<TAdditionalMessageOptions> {
  return new WolbargMemoryBlock<TAdditionalMessageOptions>(options);
}

/** Alias for {@link wolbargBlock}. */
export function createWolbargMemoryBlock<
  TAdditionalMessageOptions extends object = object,
>(
  options: WolbargMemoryBlockOptions,
): WolbargMemoryBlock<TAdditionalMessageOptions> {
  return wolbargBlock<TAdditionalMessageOptions>(options);
}
