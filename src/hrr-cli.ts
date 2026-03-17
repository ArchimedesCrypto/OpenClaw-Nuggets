#!/usr/bin/env node
import { resolve } from "node:path";
import { OpenClawHrrMemory } from "./openclaw/hrr-memory.js";

function usage(): never {
  console.log(`OpenClaw Nuggets HRR CLI

Usage:
  npm run hrr -- status
  npm run hrr -- remember <key> <value>
  npm run hrr -- recall <query> [sessionId]
  npm run hrr -- forget <key>
  npm run hrr -- import-memory <path-to-MEMORY.md>
  npm run hrr -- prove
`);
  process.exit(1);
}

const [, , cmd, ...args] = process.argv;
if (!cmd) usage();

const hrr = new OpenClawHrrMemory();

switch (cmd) {
  case "status": {
    console.log(JSON.stringify(hrr.status(), null, 2));
    break;
  }
  case "remember": {
    const [key, ...rest] = args;
    if (!key || rest.length === 0) usage();
    const value = rest.join(" ");
    hrr.remember(key, value);
    console.log(`ok remember: ${key}`);
    break;
  }
  case "recall": {
    const [query, sessionId] = args;
    if (!query) usage();
    const result = hrr.recall(query, sessionId ?? "");
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "forget": {
    const [key] = args;
    if (!key) usage();
    console.log(hrr.forget(key) ? "ok forgotten" : "not found");
    break;
  }
  case "import-memory": {
    const [p] = args;
    if (!p) usage();
    const count = hrr.importMemoryMarkdown(resolve(p));
    console.log(`imported ${count} facts`);
    break;
  }
  case "prove": {
    const proof = hrr.provePersistence();
    if (!proof.ok) {
      console.error("❌ HRR prove failed", proof);
      process.exit(2);
    }
    console.log("✅ HRR prove passed");
    console.log(`- file: ${proof.file}`);
    for (const c of proof.checks) console.log(`- ${c}`);
    break;
  }
  default:
    usage();
}
