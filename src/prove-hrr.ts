import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Nugget } from "./nuggets/memory.js";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const temp = mkdtempSync(join(tmpdir(), "openclaw-nuggets-"));

try {
  const n1 = new Nugget({
    name: "openclaw-self",
    D: 1024,
    banks: 4,
    autoSave: false,
    saveDir: temp,
  });

  n1.remember("assistant-name", "OpenClaw Nuggets");
  n1.remember("memory-model", "HRR holographic reduced representation");
  n1.remember("mission", "remember what matters across sessions");

  const recall1 = n1.recall("assistant-name");
  assert(recall1.found && recall1.answer === "OpenClaw Nuggets", "recall failed before save");

  const file = n1.save();

  const n2 = Nugget.load(file, { autoSave: false });
  const recall2 = n2.recall("memory-model");
  const recall3 = n2.recall("mission");

  assert(recall2.found && recall2.answer === "HRR holographic reduced representation", "recall failed after reload");
  assert(recall3.found && recall3.answer === "remember what matters across sessions", "persistent recall failed");

  console.log("✅ HRR proof passed");
  console.log(`- saved file: ${file}`);
  console.log(`- facts stored: ${n2.facts().length}`);
  console.log(`- recall(memory-model): ${recall2.answer}`);
  console.log(`- recall(mission): ${recall3.answer}`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
