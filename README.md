# OpenClaw Nuggets

A stripped-down fork of Nuggets focused on one thing: **HRR holographic memory for agents**.

This project removes Telegram/WhatsApp gateway concerns and keeps the memory engine as a standalone module you can embed into OpenClaw-style workflows.

## What this fork keeps

- HRR core math (`src/nuggets/core.ts`)
- Nugget memory object (`src/nuggets/memory.ts`)
- Multi-nugget shelf manager (`src/nuggets/shelf.ts`)
- Tests for remember / recall / forget / persistence

## What this fork removes

- Telegram bot integration
- WhatsApp integration
- Gateway runtime as the primary entrypoint

## Quick start

```bash
npm install
npm run test
npm run prove:hrr
```

## OpenClaw integration

A native OpenClaw adapter is included:

- `src/openclaw/config.ts`
- `src/openclaw/hrr-memory.ts`
- `src/hrr-cli.ts`

See `OPENCLAW_INTEGRATION.md` for plug-in steps and env flags.

Quick verify:

```bash
npm run prove:openclaw
```

## HRR proof (completion criterion)

`npm run prove:hrr` runs an end-to-end proof that:

1. Stores facts in HRR memory
2. Recalls them immediately
3. Saves memory to disk
4. Reloads memory in a new instance
5. Recalls the same facts again after reload

If all checks pass, it prints:

```text
✅ HRR proof passed
```

That output is the project’s proof of working HRR memory.

## Project structure

```text
src/
  nuggets/
    core.ts
    memory.ts
    shelf.ts
    promote.ts
    index.ts
  prove-hrr.ts

tests/
  core.test.ts
  memory.test.ts
  shelf.test.ts
```
