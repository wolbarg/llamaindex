/**
 * Two agents sharing one Wolbarg store via separate memory blocks.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const client = wolbarg({
    organization: "llamaindex-multi",
    storage: sqlite("./examples-multi.db"),
    embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
  });
  await client.ready();

  const researcher = createMemory({
    memoryBlocks: [wolbargBlock({ memory: client, agent: "researcher" })],
  });
  const writer = createMemory({
    memoryBlocks: [wolbargBlock({ memory: client, agent: "writer" })],
  });

  await researcher.add({
    role: "user",
    content: "Stripe supports recurring invoices.",
  });
  await researcher.manageMemoryBlocks();

  // Shared org store — writer can recall if using same agent filter or org-wide recall.
  // Here writer uses its own agent id; seed a shared fact explicitly:
  await client.remember({
    agent: "writer",
    content: { text: "Research note: Stripe supports recurring invoices." },
  });

  const hits = await wolbargBlock({
    memory: client,
    agent: "writer",
  }).get([{ id: "1", role: "user", content: "Does Stripe do recurring billing?" }]);

  console.log(hits);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
