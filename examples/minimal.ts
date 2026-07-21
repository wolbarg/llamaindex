/**
 * Minimal wolbargBlock + createMemory.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const client = wolbarg({
    organization: "llamaindex-minimal",
    storage: sqlite("./examples-minimal.db"),
    embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
  });
  await client.ready();

  const memory = createMemory({
    memoryBlocks: [wolbargBlock({ memory: client, agent: "assistant" })],
  });

  await memory.add({ role: "user", content: "I prefer dark mode." });
  await memory.manageMemoryBlocks();
  console.log(await memory.getLLM());

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
