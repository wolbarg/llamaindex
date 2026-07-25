# @wolbarg/llamaindex

[![npm version](https://img.shields.io/npm/v/@wolbarg/llamaindex.svg)](https://www.npmjs.com/package/@wolbarg/llamaindex)
[![GitHub](https://img.shields.io/badge/github-wolbarg%2Fllamaindex-black?logo=github)](https://github.com/wolbarg/llamaindex)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Official [LlamaIndexTS](https://ts.llamaindex.ai/) long-term memory block for [Wolbarg](https://wolbarg.com) shared memory.

Wires Wolbarg into LlamaIndex’s `createMemory({ memoryBlocks })` API via `BaseMemoryBlock`:

1. **`get`** — recalls relevant memories from the last user message
2. **`put`** — persists conversation turns with `rememberFromMessages`

Soft-fails by default so memory errors never break an agent turn.

## Install

```bash
npm install wolbarg @wolbarg/llamaindex llamaindex
```

Peers: `wolbarg >= 0.5.4`, `@llamaindex/core >= 0.6.0`, optional `llamaindex >= 0.9.0`. Node **≥ 22**.

## Quick start

```ts
import { createMemory } from "llamaindex";
import { wolbarg, sqlite, openaiEmbedding } from "wolbarg";
import { wolbargBlock } from "@wolbarg/llamaindex";

const client = wolbarg({
  organization: "my-app",
  storage: sqlite("./memory.db"),
  embedding: openaiEmbedding({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "text-embedding-3-small",
  }),
});
await client.ready();

const memory = createMemory({
  memoryBlocks: [
    wolbargBlock({
      memory: client,
      agent: "assistant",
      sessionId: "demo-session",
    }),
  ],
});

await memory.add({ role: "user", content: "I prefer dark mode." });
await memory.manageMemoryBlocks();

const messages = await memory.getLLM();
```

`wolbargBlock` mirrors LlamaIndex’s `staticBlock` / `vectorBlock` naming. `createWolbargMemoryBlock` is an alias.

## API

### `wolbargBlock(options)` / `WolbargMemoryBlock`

| Option | Default | Description |
| --- | --- | --- |
| `memory` | required | Wolbarg client |
| `agent` | required | Agent id for recall filter + remember |
| `id` | auto UUID | Block id |
| `priority` | `1` | LlamaIndex block priority (`0` = always include) |
| `isLongTerm` | `true` | Long-term block flag |
| `topK` | `5` | Recall limit |
| `threshold` | — | Minimum similarity |
| `sessionId` / `userId` / `tags` / `namespace` | — | Attached to remember metadata |
| `metadata` | `{}` | Extra remember metadata |
| `formatContext` | default list | Format recall hits → memory message text |
| `rememberMode` | `"raw"` | `"raw"` or `"extract"` |
| `rawStrategy` | `"last_user"` | `"last_user"` or `"all_user"` |
| `onError` | — | Soft-fail hook `(error, phase)` |

### Behavior

| Method | Behavior |
| --- | --- |
| `get(messages?)` | Query = last user message text → `memory.recall` → one `{ role: "memory", content }` (or `[]`) |
| `put(messages)` | Convert to conversation turns (skips `memory` role) → `rememberFromMessages` |
| Errors | Soft-fail: `get` → `[]`, `put` → no throw; optional `onError` |

Remembered rows include `metadata.source = "wolbarg-llamaindex"`.

## Config tips

```ts
wolbargBlock({
  memory: client,
  agent: "assistant",
  topK: 8,
  threshold: 0.35,
  rememberMode: "raw",
  rawStrategy: "last_user",
  formatContext: (hits) =>
    hits.map((h) => `- ${h.content.text}`).join("\n"),
  onError: (err, phase) => console.warn("[wolbarg]", phase, err),
});
```

## Production

- Share one Wolbarg client across agents/processes (SQLite or Postgres).
- Set `sessionId` / `userId` / `tags` for tenancy and analytics.
- Prefer `rememberMode: "raw"` unless you configure Wolbarg `llm` for extract mode.
- Keep `onError` wired to your logger — failures are silent by design.

## Limitations

- Integration surface is **`BaseMemoryBlock` only** (`wolbargBlock` / `createWolbargMemoryBlock`). This package does not wrap LlamaIndex `VectorStore` / storage-context APIs.
- Recall query uses the **last user** message only (not a multi-turn window).
- `put` skips messages with role `"memory"` and empty content.
- Does not replace LlamaIndex short-term chat buffer — use alongside `createMemory`.
- Requires Node ≥ 22 and Wolbarg ≥ 0.5.4 (`rememberFromMessages`).

## Migration Guide

| From | To |
| --- | --- |
| `vectorBlock({ vectorStore })` for long-term semantic memory | `wolbargBlock({ memory, agent })` |
| Custom `BaseMemoryBlock` wrapping your DB | Drop-in `wolbargBlock` |

Compose freely with `staticBlock` / `factExtractionBlock` in the same `memoryBlocks` array.

## Examples

Package: `examples/` (minimal, streaming, chatbot, multi-agent, persistence, memory-recall, long-conversation, basic).

Repo adapter: `examples/adapters/llamaindex/`.

## Docs

https://wolbarg.com/docs/integrations/llamaindex

## License

MIT
