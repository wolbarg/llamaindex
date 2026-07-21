/**
 * Long conversation — Wolbarg block supplies long-term facts while
 * LlamaIndex short-term buffer holds recent turns.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const client = wolbarg({
    organization: "llamaindex-long",
    storage: sqlite("./examples-long.db"),
    embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
  });
  await client.ready();

  const memory = createMemory({
    tokenLimit: 4000,
    shortTermTokenLimitRatio: 0.6,
    memoryBlocks: [
      wolbargBlock({
        memory: client,
        agent: "assistant",
        priority: 1,
        sessionId: "long-1",
      }),
    ],
  });

  for (let i = 0; i < 20; i++) {
    await memory.add({
      role: "user",
      content: `Turn ${i}: note fact-${i}`,
    });
    await memory.add({
      role: "assistant",
      content: `Acknowledged fact-${i}`,
    });
    if (i % 5 === 4) await memory.manageMemoryBlocks();
  }

  const ctx = await memory.getLLM();
  console.log("context window messages:", ctx.length);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
