import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { OpenClawHrrMemory } from "../src/openclaw/hrr-memory.js";
import { OpenClawChatMemory } from "../src/openclaw/chat-memory.js";
import { heartbeatRecall } from "../src/openclaw/heartbeat-recall.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "openclaw-heartbeat-hrr-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("heartbeatRecall", () => {
  it("returns HEARTBEAT_OK when nothing is present", () => {
    const hrr = new OpenClawHrrMemory({
      enabled: true,
      saveDir: dir,
      nuggetName: "self",
      D: 1024,
      banks: 4,
      ensembles: 1,
      maxFacts: 0,
    });

    const out = heartbeatRecall(hrr, "session-z");
    expect(out.status).toBe("HEARTBEAT_OK");
    expect(out.alerts).toHaveLength(0);
  });

  it("returns ALERT with commitments", () => {
    const hrr = new OpenClawHrrMemory({
      enabled: true,
      saveDir: dir,
      nuggetName: "self",
      D: 1024,
      banks: 4,
      ensembles: 1,
      maxFacts: 0,
    });
    const chat = new OpenClawChatMemory(hrr);
    chat.ingestTurn({ role: "user", text: "todo: ship release today" }, "session-k");

    const out = heartbeatRecall(hrr, "session-k");
    expect(out.status).toBe("ALERT");
    expect(out.alerts[0]).toContain("Commitment:");
  });

  it("falls back to last user context alert", () => {
    const hrr = new OpenClawHrrMemory({
      enabled: true,
      saveDir: dir,
      nuggetName: "self",
      D: 1024,
      banks: 4,
      ensembles: 1,
      maxFacts: 0,
    });
    const chat = new OpenClawChatMemory(hrr);
    chat.ingestTurn({ role: "user", text: "just checking in" }, "session-y");

    const out = heartbeatRecall(hrr, "session-y");
    expect(out.status).toBe("ALERT");
    expect(out.alerts[0]).toContain("Last user context");
  });
});
