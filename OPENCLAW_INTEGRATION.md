# OpenClaw HRR Integration Guide

This repo includes a ready OpenClaw adapter in `src/openclaw/*`.

## 1) Install

```bash
npm install
npm run build
```

## 2) Configure

Set environment variables in your OpenClaw host process:

```bash
MEMORY_HRR_ENABLED=true
MEMORY_HRR_PATH=/path/to/.openclaw/hrr
MEMORY_HRR_NUGGET=self
MEMORY_HRR_D=4096
MEMORY_HRR_BANKS=4
MEMORY_HRR_ENSEMBLES=1
MEMORY_HRR_MAX_FACTS=0
```

## 3) Use from code

```ts
import { OpenClawHrrMemory } from "./openclaw/hrr-memory.js";

const hrr = new OpenClawHrrMemory();

// write-through
hrr.remember("user-timezone", "Europe/Berlin");

// read-through
const r = hrr.recall("timezone", "session-123");
if (r.found && r.confidence > 0.2) {
  // use HRR answer
}
```

## 4) Wire into OpenClaw memory flow

Recommended order:
1. Try HRR first
2. If low confidence, fall back to existing `memory_search`
3. On successful fallback recall, upsert distilled fact into HRR (`remember`)

This gives you a fast self-improving L1 memory layer.

## 5) Capture full chat turns into HRR

```ts
import { OpenClawChatMemory } from "./openclaw/chat-memory.js";

const chatMemory = new OpenClawChatMemory(hrr);
chatMemory.ingestTurn({
  role: "user",
  text: "I will finish the release notes today",
  timestamp: new Date().toISOString(),
}, sessionId);
```

What gets stored:
- `chat:<session>:<timestamp>:<role>` => full turn text
- `chat:last:<session>:<role>` => latest role-specific context
- `commitment:<session>:...` => extracted commitment/todo-like sentences

## 6) Read HRR on heartbeats

```ts
import { heartbeatRecall } from "./openclaw/heartbeat-recall.js";

const hb = heartbeatRecall(hrr, sessionId);
if (hb.status === "ALERT") {
  // send proactive message with hb.alerts
} else {
  // HEARTBEAT_OK
}
```

## 7) Validate on any machine

```bash
npm run prove:openclaw
```

Expected output:

```text
✅ HRR prove passed
```

## 8) Optional bootstrapping from MEMORY.md

```bash
npm run hrr -- import-memory /path/to/MEMORY.md
```
