/**
 * Persistence across process restarts via Wolbarg SQLite.
 * Requires OPENAI_API_KEY. Illustrative — not run in CI.
 */

import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "../src/index.js";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Set OPENAI_API_KEY");

  const db = "./examples-persist.db";

  {
    const client = wolbarg({
      organization: "llamaindex-persist",
      storage: sqlite(db),
      embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
    });
    await client.ready();
    const memory = createMemory({
      memoryBlocks: [
        wolbargBlock({ memory: client, agent: "assistant", sessionId: "s1" }),
      ],
    });
    await memory.add({ role: "user", content: "Remember: deploy Friday." });
    await memory.manageMemoryBlocks();
    await client.close();
  }

  {
    const client = wolbarg({
      organization: "llamaindex-persist",
      storage: sqlite(db),
      embedding: openaiEmbedding({ apiKey, model: "text-embedding-3-small" }),
    });
    await client.ready();
    const block = wolbargBlock({
      memory: client,
      agent: "assistant",
      sessionId: "s1",
    });
    const recalled = await block.get([
      { id: "u", role: "user", content: "When do we deploy?" },
    ]);
    console.log(recalled);
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
