/**
 * Chatbot loop with Wolbarg long-term memory block.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const client = wolbarg({
    organization: "llamaindex-chatbot",
    storage: sqlite("./examples-chatbot.db"),
    embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
  });
  await client.ready();

  const block = wolbargBlock({
    memory: client,
    agent: "chatbot",
    sessionId: "user-1",
  });
  const memory = createMemory({ memoryBlocks: [block] });

  const turns = [
    "My name is Ada.",
    "I work on TypeScript agents.",
    "What is my name and what do I work on?",
  ];

  for (const text of turns) {
    await memory.add({ role: "user", content: text });
    await memory.manageMemoryBlocks();
    const ctx = await memory.getLLM();
    console.log("\nuser:", text);
    console.log("memory context messages:", ctx.length);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
