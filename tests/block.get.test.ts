import { describe, expect, it } from "vitest";
import type { MemoryMessage } from "@llamaindex/core/memory";
import type { Wolbarg } from "wolbarg";
import { wolbargBlock } from "../src/index.js";
import { createMockMemory, hit } from "./helpers/mock-memory.js";

function user(content: string, id = "u1"): MemoryMessage {
  return { id, role: "user", content };
}

describe("WolbargMemoryBlock.get", () => {
  it("recalls from the last user message and returns a memory role message", async () => {
    const { memory, calls } = createMockMemory({
      hits: [hit("User prefers dark mode")],
    });

    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      id: "wolbarg-block",
      topK: 3,
      threshold: 0.5,
    });

    const result = await block.get([
      user("hello", "u0"),
      { id: "a1", role: "assistant", content: "hi" },
      user("What theme do I like?", "u1"),
    ]);

    expect(calls.recalls).toHaveLength(1);
    expect(calls.recalls[0]!.query).toBe("What theme do I like?");
    expect(calls.recalls[0]!.topK).toBe(3);
    expect(calls.recalls[0]!.threshold).toBe(0.5);
    expect(calls.recalls[0]!.filter).toEqual({ agent: "assistant" });

    expect(result).toHaveLength(1);
    expect(result[0]!.role).toBe("memory");
    expect(result[0]!.id).toBe("wolbarg-block");
    expect(String(result[0]!.content)).toContain("User prefers dark mode");
  });

  it("returns [] when there is no user message", async () => {
    const { memory, calls } = createMockMemory({
      hits: [hit("should not be used")],
    });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
    });

    const result = await block.get([
      { id: "a1", role: "assistant", content: "hi" },
    ]);

    expect(result).toEqual([]);
    expect(calls.recalls).toHaveLength(0);
  });

  it("returns [] when messages are omitted or empty", async () => {
    const { memory, calls } = createMockMemory({ hits: [hit("x")] });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
    });

    expect(await block.get()).toEqual([]);
    expect(await block.get([])).toEqual([]);
    expect(calls.recalls).toHaveLength(0);
  });

  it("returns [] when recall finds nothing", async () => {
    const { memory } = createMockMemory({ hits: [] });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
    });

    const result = await block.get([user("anything")]);
    expect(result).toEqual([]);
  });

  it("supports custom formatContext", async () => {
    const { memory } = createMockMemory({
      hits: [hit("fact-a"), hit("fact-b", "h2")],
    });
    const block = wolbargBlock({
      memory: memory as unknown as Wolbarg,
      agent: "assistant",
      formatContext: (hits) => hits.map((h) => h.content.text).join("|"),
    });

    const result = await block.get([user("query")]);
    expect(result).toHaveLength(1);
    expect(result[0]!.content).toBe("fact-a|fact-b");
  });
});
