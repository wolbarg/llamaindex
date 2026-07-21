import { describe, expect, it } from "vitest";
import type { MemoryMessage } from "@llamaindex/core/memory";
import type { Wolbarg } from "wolbarg";
import { createWolbargMemoryBlock, wolbargBlock } from "../src/index.js";
import { createMockMemory } from "./helpers/mock-memory.js";

describe("WolbargMemoryBlock.put", () => {
  it("converts messages and calls rememberFromMessages with source metadata", async () => {
    const { memory, calls } = createMockMemory();
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      sessionId: "s1",
      userId: "u1",
      tags: ["support"],
      namespace: "ns",
      metadata: { ticket: 42 },
      rememberMode: "raw",
      rawStrategy: "all_user",
    });

    const messages: MemoryMessage[] = [
      { id: "u1", role: "user", content: "I like dark mode" },
      { id: "a1", role: "assistant", content: "Noted." },
      { id: "m1", role: "memory", content: "should be skipped" },
    ];

    await block.put(messages);

    expect(calls.remembers).toHaveLength(1);
    expect(calls.remembers[0]!.messages).toEqual([
      { role: "user", content: "I like dark mode" },
      { role: "assistant", content: "Noted." },
    ]);
    expect(calls.remembers[0]!.options).toMatchObject({
      agent: "assistant",
      mode: "raw",
      rawStrategy: "all_user",
      metadata: {
        ticket: 42,
        sessionId: "s1",
        userId: "u1",
        tags: ["support"],
        namespace: "ns",
        source: "wolbarg-llamaindex",
      },
    });
  });

  it("skips put when there are no user messages", async () => {
    const { memory, calls } = createMockMemory();
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
    });

    await block.put([
      { id: "a1", role: "assistant", content: "hello" },
      { id: "m1", role: "memory", content: "mem" },
    ]);

    expect(calls.remembers).toHaveLength(0);
  });

  it("createWolbargMemoryBlock aliases wolbargBlock", () => {
    const { memory } = createMockMemory();
    const a = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      id: "same",
    });
    const b = createWolbargMemoryBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      id: "same",
    });
    expect(a).toBeInstanceOf(a.constructor);
    expect(b.id).toBe("same");
    expect(a.priority).toBe(1);
    expect(a.isLongTerm).toBe(true);
  });
});
