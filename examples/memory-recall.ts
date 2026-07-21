/**
 * Direct block.get recall demo.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const client = wolbarg({
    organization: "llamaindex-recall",
    storage: sqlite("./examples-recall.db"),
    embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
  });
  await client.ready();

  await client.remember({
    agent: "assistant",
    content: { text: "User timezone is America/Chicago." },
  });

  const block = wolbargBlock({ memory: client, agent: "assistant", topK: 3 });
  const hits = await block.get([
    { id: "1", role: "user", content: "What timezone am I in?" },
  ]);
  console.log(hits);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
