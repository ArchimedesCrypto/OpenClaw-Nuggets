import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Nugget } from "../nuggets/memory.js";
import { loadHrrConfig, type HrrConfig } from "./config.js";

export interface RecallResult {
  answer: string | null;
  confidence: number;
  margin: number;
  found: boolean;
  key: string;
}

export class OpenClawHrrMemory {
  readonly config: HrrConfig;
  private nugget: Nugget;

  constructor(config = loadHrrConfig()) {
    this.config = config;
    this.nugget = new Nugget({
      name: config.nuggetName,
      D: config.D,
      banks: config.banks,
      ensembles: config.ensembles,
      maxFacts: config.maxFacts,
      saveDir: config.saveDir,
      autoSave: true,
    });

    this.loadIfExists();
  }

  remember(key: string, value: string): void {
    if (!this.config.enabled) return;
    this.nugget.remember(key, value);
  }

  recall(query: string, sessionId = ""): RecallResult {
    if (!this.config.enabled) {
      return { answer: null, confidence: 0, margin: 0, found: false, key: "" };
    }
    return this.nugget.recall(query, sessionId);
  }

  forget(key: string): boolean {
    if (!this.config.enabled) return false;
    return this.nugget.forget(key);
  }

  status() {
    return this.nugget.status();
  }

  facts() {
    return this.nugget.facts();
  }

  save(): string {
    return this.nugget.save();
  }

  loadIfExists(): void {
    const path = join(this.config.saveDir, `${this.config.nuggetName}.nugget.json`);
    if (!existsSync(path)) return;
    this.nugget = Nugget.load(path, { autoSave: true });
  }

  importMemoryMarkdown(path: string): number {
    if (!existsSync(path)) return 0;
    const content = readFileSync(path, "utf-8");
    let imported = 0;

    for (const line of content.split("\n")) {
      const m = line.trim().match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
      if (!m) continue;
      this.nugget.remember(m[1].trim(), m[2].trim());
      imported++;
    }

    return imported;
  }

  provePersistence(): {
    ok: boolean;
    file: string;
    checks: string[];
  } {
    const checks: string[] = [];
    this.remember("hrr-proof-key", "hrr-proof-value");
    const before = this.recall("hrr-proof-key");
    if (!before.found || before.answer !== "hrr-proof-value") {
      return { ok: false, file: "", checks: ["failed immediate recall"] };
    }
    checks.push("immediate recall ok");

    const file = this.save();
    const loaded = new OpenClawHrrMemory(this.config);
    const after = loaded.recall("hrr-proof-key");

    if (!after.found || after.answer !== "hrr-proof-value") {
      return { ok: false, file, checks: [...checks, "failed post-reload recall"] };
    }

    checks.push("post-reload recall ok");
    return { ok: true, file, checks };
  }
}
