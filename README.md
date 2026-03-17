# OpenClaw Nuggets

**OpenClaw Nuggets** is a memory-first fork of Nuggets that keeps the **HRR (Holographic Reduced Representation)** engine and removes messaging-gateway complexity.

It is designed as a drop-in memory layer for agent systems (especially OpenClaw):
- fast local recall
- deterministic persistence
- simple key/value memory operations
- no external vector DB required

---

## Upstream / lineage

This project is adapted from the original Nuggets repository:

- Upstream: https://github.com/NeoVertex1/nuggets
- This fork: https://github.com/ArchimedesCrypto/OpenClaw-Nuggets

Git remotes are configured as:
- `origin` → OpenClaw-Nuggets
- `upstream` → NeoVertex1/nuggets

---

## Why this exists

Most agents either:
- forget between sessions, or
- rely on heavier retrieval stacks.

OpenClaw Nuggets gives you a compact **L1 memory layer**:
- `remember(key, value)`
- `recall(query)`
- `forget(key)`

with persistent storage (`*.nugget.json`) and testable reload behavior.

---

## Features

- HRR core primitives (complex vectors, bind/unbind, superposition)
- Deterministic rebuild from facts (seeded key generation)
- Fuzzy key resolution for recall
- Multi-nugget management via `NuggetShelf`
- OpenClaw adapter (`OpenClawHrrMemory`)
- Chat ingestion adapter (`OpenClawChatMemory`) to store turns + commitments
- Heartbeat recall (`heartbeatRecall`) to read HRR on heartbeat cycles
- CLI for ops, import, ingestion, heartbeat checks, and verification
- Full test coverage for core + integration paths

---

## Project layout

```text
src/
  nuggets/
    core.ts              # HRR math primitives
    memory.ts            # Nugget memory implementation
    shelf.ts             # Multi-nugget manager
    promote.ts           # Optional MEMORY.md promotion logic
    index.ts             # Public exports

  openclaw/
    config.ts            # Env-based HRR config
    hrr-memory.ts        # OpenClaw-facing adapter

  hrr-cli.ts             # CLI entrypoint
  prove-hrr.ts           # standalone proof script

tests/
  core.test.ts
  memory.test.ts
  shelf.test.ts
  openclaw-config.test.ts
  openclaw-hrr-memory.test.ts
```

---

## Requirements

- Node.js 20+ (24+ recommended)
- npm

---

## Install

```bash
git clone https://github.com/<your-user>/OpenClaw-Nuggets.git
cd OpenClaw-Nuggets
npm install
```

---

## Quick verification

### 1) Run tests

```bash
npm run test
```

### 2) Prove standalone HRR persistence

```bash
npm run prove:hrr
```

Expected:

```text
✅ HRR proof passed
```

### 3) Prove OpenClaw adapter persistence

```bash
npm run prove:openclaw
```

Expected:

```text
✅ HRR prove passed
```

---

## CLI usage

Use the built-in CLI to interact with memory directly:

```bash
npm run hrr -- status
npm run hrr -- remember "assistant-name" "OpenClaw Nuggets"
npm run hrr -- recall "assistant-name"
npm run hrr -- forget "assistant-name"
npm run hrr -- import-memory /path/to/MEMORY.md
npm run hrr -- ingest-turn user "I will finish docs today" session-1
npm run hrr -- ingest-file ./chat.json session-1
npm run hrr -- heartbeat session-1
npm run hrr -- prove
```

---

## OpenClaw integration

Use `OpenClawHrrMemory` in your runtime memory flow.

For full chat capture + heartbeat reads, use:
- `OpenClawChatMemory` for turn ingestion
- `heartbeatRecall` during heartbeat checks

```ts
import { OpenClawHrrMemory } from "./openclaw/hrr-memory.js";

const hrr = new OpenClawHrrMemory();

hrr.remember("user-timezone", "Europe/Berlin");

const result = hrr.recall("timezone", "session-abc");
if (result.found && result.confidence > 0.2) {
  // use HRR recall
} else {
  // fallback to your existing memory retrieval
}
```

Recommended retrieval order:
1. HRR recall first
2. fallback to existing memory search
3. upsert distilled fallback result back into HRR

Detailed guide: `OPENCLAW_INTEGRATION.md`

---

## Environment configuration

Set these in your OpenClaw host process:

```bash
MEMORY_HRR_ENABLED=true
MEMORY_HRR_PATH=/path/to/.openclaw/hrr
MEMORY_HRR_NUGGET=self
MEMORY_HRR_D=4096
MEMORY_HRR_BANKS=4
MEMORY_HRR_ENSEMBLES=1
MEMORY_HRR_MAX_FACTS=0
```

Notes:
- `MEMORY_HRR_ENABLED=false` disables HRR safely.
- Increase `D`/`BANKS` for larger fact sets.
- `MEMORY_HRR_PATH` controls persistence location.

---

## Persistence model

Data is stored as JSON nugget files (example):

```text
~/.openclaw/hrr/self.nugget.json
```

Facts are persisted and rebuilt into HRR state on load.

---

## Scripts

```bash
npm run dev             # currently points to standalone prove script
npm run hrr             # HRR CLI
npm run prove:hrr       # standalone proof
npm run prove:openclaw  # OpenClaw adapter proof
npm run test            # vitest
npm run typecheck       # tsc --noEmit
npm run build           # compile TS
```

---

## Current status

- ✅ HRR engine integrated
- ✅ OpenClaw adapter implemented
- ✅ Persistence proven (save/reload/recall)
- ✅ Tests passing
- ✅ Documentation included

---

## License

MIT (inherits upstream intent; adjust if your org requires a specific license file)
