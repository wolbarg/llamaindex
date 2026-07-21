import { describe, expect, it, vi } from "vitest";
import type { Wolbarg } from "wolbarg";
import { BaseMemoryBlock } from "@llamaindex/core/memory";
import { createMemory } from "llamaindex";
import { wolbargBlock } from "../src/index.js";
import { createMockMemory, hit } from "./helpers/mock-memory.js";

describe("WolbargMemoryBlock resilience", () => {
  it("soft-fails get on recall errors", async () => {
    const onError = vi.fn();
    const { memory, calls } = createMockMemory({
      recallError: new Error("recall boom"),
    });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      onError,
    });

    const result = await block.get([
      { id: "u1", role: "user", content: "query" },
    ]);

    expect(result).toEqual([]);
    expect(calls.recalls).toHaveLength(1);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]![1]).toBe("recall");
  });

  it("soft-fails put on remember errors", async () => {
    const onError = vi.fn();
    const { memory, calls } = createMockMemory({
      rememberError: new Error("remember boom"),
    });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      onError,
    });

    await expect(
      block.put([{ id: "u1", role: "user", content: "remember me" }]),
    ).resolves.toBeUndefined();

    expect(calls.remembers).toHaveLength(1);
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]![1]).toBe("remember");
  });

  it("swallows onError hook failures", async () => {
    const { memory } = createMockMemory({
      recallError: new Error("recall boom"),
    });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      onError: () => {
        throw new Error("hook boom");
      },
    });

    await expect(
      block.get([{ id: "u1", role: "user", content: "q" }]),
    ).resolves.toEqual([]);
  });

  it("extends BaseMemoryBlock and works with createMemory", async () => {
    const { memory } = createMockMemory({
      hits: [hit("User likes tea")],
    });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      id: "wb",
    });

    expect(block).toBeInstanceOf(BaseMemoryBlock);

    const chatMemory = createMemory({
      memoryBlocks: [block],
    });

    expect(chatMemory).toBeDefined();
    const recalled = await block.get([
      { id: "u1", role: "user", content: "drink preference?" },
    ]);
    expect(recalled[0]!.role).toBe("memory");
    expect(String(recalled[0]!.content)).toContain("User likes tea");
  });

  it("rejects missing memory / agent at construction", () => {
    expect(() =>
      wolbargBlock({
        memory: undefined as unknown as Wolbarg,
        agent: "assistant",
      }),
    ).toThrow(/memory is required/);

    const { memory } = createMockMemory();
    expect(() =>
      wolbargBlock({
        memory: memory as unknown as Wolbarg,
        agent: "  ",
      }),
    ).toThrow(/agent must be a non-empty string/);
  });
});
