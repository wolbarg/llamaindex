# @wolbarg/llamaindex

Changelog for the official LlamaIndexTS memory block package.

## [1.0.0] — 2026-07-20

### Added

- `WolbargMemoryBlock` — LlamaIndexTS `BaseMemoryBlock` backed by Wolbarg recall / `rememberFromMessages`
- `wolbargBlock()` / `createWolbargMemoryBlock()` factories (mirrors `staticBlock` / `vectorBlock`)
- Soft-fail `get` / `put` so memory errors never break agent turns
- Metadata `source: "wolbarg-llamaindex"` on remembered rows
