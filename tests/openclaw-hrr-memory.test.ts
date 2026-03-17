import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { OpenClawHrrMemory } from "../src/openclaw/hrr-memory.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "openclaw-hrr-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("OpenClawHrrMemory", () => {
  const enabledCfg = () => ({
    enabled: true,
    saveDir: dir,
    nuggetName: "self",
    D: 1024,
    banks: 4,
    ensembles: 1,
    maxFacts: 0,
  });

  it("remembers and recalls", () => {
    const hrr = new OpenClawHrrMemory(enabledCfg());
    hrr.remember("owner", "JUDOKICK");
    const r = hrr.recall("owner");
    expect(r.found).toBe(true);
    expect(r.answer).toBe("JUDOKICK");
  });

  it("supports status/save/forget", () => {
    const hrr = new OpenClawHrrMemory(enabledCfg());
    hrr.remember("k", "v");
    const s = hrr.status();
    expect(s.name).toBe("self");
    expect(s.fact_count).toBeGreaterThan(0);

    const file = hrr.save();
    expect(file.endsWith("self.nugget.json")).toBe(true);

    expect(hrr.forget("k")).toBe(true);
    expect(hrr.forget("missing")).toBe(false);
  });

  it("returns empty results when disabled", () => {
    const hrr = new OpenClawHrrMemory({ ...enabledCfg(), enabled: false });
    hrr.remember("x", "y");
    const r = hrr.recall("x");
    expect(r.found).toBe(false);
    expect(r.answer).toBeNull();
    expect(hrr.forget("x")).toBe(false);
  });

  it("loads existing nugget file on startup", () => {
    const one = new OpenClawHrrMemory(enabledCfg());
    one.remember("startup", "loaded");
    one.save();

    const two = new OpenClawHrrMemory(enabledCfg());
    const r = two.recall("startup");
    expect(r.found).toBe(true);
    expect(r.answer).toBe("loaded");
  });

  it("imports MEMORY.md markdown facts", () => {
    const hrr = new OpenClawHrrMemory(enabledCfg());
    const md = `${dir}/MEMORY.md`;
    writeFileSync(md, "# Memory\n\n## test\n- **alpha**: one\n- **beta**: two\n");

    const count = hrr.importMemoryMarkdown(md);
    expect(count).toBe(2);
    expect(hrr.recall("alpha").answer).toBe("one");
    expect(hrr.importMemoryMarkdown(`${dir}/missing.md`)).toBe(0);
  });

  it("proves persistence", () => {
    const hrr = new OpenClawHrrMemory(enabledCfg());
    const proof = hrr.provePersistence();
    expect(proof.ok).toBe(true);
    expect(proof.checks).toContain("immediate recall ok");
    expect(proof.checks).toContain("post-reload recall ok");
  });

  it("returns immediate-failure proof when disabled", () => {
    const hrr = new OpenClawHrrMemory({ ...enabledCfg(), enabled: false });
    const proof = hrr.provePersistence();
    expect(proof.ok).toBe(false);
    expect(proof.checks).toContain("failed immediate recall");
  });

  it("returns post-reload failure proof when save is bypassed", () => {
    const hrr = new OpenClawHrrMemory(enabledCfg());
    // disable nugget autosave, then bypass explicit save in provePersistence
    (hrr as unknown as { nugget: { autoSave: boolean } }).nugget.autoSave = false;
    (hrr as unknown as { save: () => string }).save = () => `${dir}/does-not-exist.nugget.json`;
    const proof = hrr.provePersistence();
    expect(proof.ok).toBe(false);
    expect(proof.checks).toContain("failed post-reload recall");
  });
});
