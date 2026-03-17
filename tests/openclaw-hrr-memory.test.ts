import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
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
  it("remembers and recalls", () => {
    const hrr = new OpenClawHrrMemory({
      enabled: true,
      saveDir: dir,
      nuggetName: "self",
      D: 1024,
      banks: 4,
      ensembles: 1,
      maxFacts: 0,
    });

    hrr.remember("owner", "JUDOKICK");
    const r = hrr.recall("owner");
    expect(r.found).toBe(true);
    expect(r.answer).toBe("JUDOKICK");
  });

  it("proves persistence", () => {
    const hrr = new OpenClawHrrMemory({
      enabled: true,
      saveDir: dir,
      nuggetName: "self",
      D: 1024,
      banks: 4,
      ensembles: 1,
      maxFacts: 0,
    });

    const proof = hrr.provePersistence();
    expect(proof.ok).toBe(true);
    expect(proof.checks).toContain("immediate recall ok");
    expect(proof.checks).toContain("post-reload recall ok");
  });
});
