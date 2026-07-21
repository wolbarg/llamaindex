/**
 * Streaming note — LlamaIndex agents stream at the workflow layer.
 * This example shows memory context available before a streaming LLM call.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const client = wolbarg({
    organization: "llamaindex-stream",
    storage: sqlite("./examples-stream.db"),
    embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
  });
  await client.ready();

  const memory = createMemory({
    memoryBlocks: [wolbargBlock({ memory: client, agent: "assistant" })],
  });

  await memory.add({ role: "user", content: "Prefer concise answers." });
  await memory.manageMemoryBlocks();

  // Pass getLLM() messages into your streaming LLM call.
  const messages = await memory.getLLM();
  console.log("messages for streaming LLM:", messages.length);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
