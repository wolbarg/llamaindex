/**
 * Minimal @wolbarg/llamaindex example (requires OPENAI_API_KEY).
 *
 *   npm run build
 *   npx tsx examples/basic.ts
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

const AGENT = "assistant";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Set OPENAI_API_KEY to run this example");
  }

  const client = wolbarg({
    organization: "llamaindex-example",
    storage: sqlite("./llamaindex-example.db"),
    embedding: openaiEmbedding({
      apiKey,
      model: "text-embedding-3-small",
    }),
  });
  await client.ready();

  await client.remember({
    agent: AGENT,
    content: { text: "The user prefers dark mode in the IDE." },
  });

  const block = wolbargBlock({
    memory: client,
    agent: AGENT,
    sessionId: "demo-session",
  });

  const memory = createMemory({
    memoryBlocks: [block],
  });

  const recalled = await block.get([
    { id: "u1", role: "user", content: "What UI theme do I prefer?" },
  ]);
  console.log("recalled:", recalled);

  await memory.add({ role: "user", content: "Also remember I like Vim." });
  await memory.add({ role: "assistant", content: "Got it." });
  await memory.manageMemoryBlocks();

  await client.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
