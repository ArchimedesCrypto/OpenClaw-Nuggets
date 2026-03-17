import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { OpenClawHrrMemory } from "../src/openclaw/hrr-memory.js";
import { OpenClawChatMemory } from "../src/openclaw/chat-memory.js";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "openclaw-chat-hrr-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("OpenClawChatMemory", () => {
  it("ingests turns and stores last message keys", () => {
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

    const keys = chat.ingestTurn(
      { role: "user", text: "hello there", timestamp: "2026-03-17T06:00:00Z" },
      "session-a",
    );

    expect(keys.some((k) => k.startsWith("chat:session-a:"))).toBe(true);
    expect(hrr.recall("chat:last:session-a:user").answer).toBe("hello there");
  });

  it("extracts commitment-like statements", () => {
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

    const keys = chat.ingestTurn(
      { role: "user", text: "I will finish the docs. we should test this." },
      "session-b",
    );

    expect(keys.some((k) => k.startsWith("commitment:session-b:"))).toBe(true);
  });

  it("ingests batch and ignores empty turns", () => {
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

    const keys = chat.ingestBatch(
      [
        { role: "user", text: "" },
        { role: "assistant", text: "Done" },
      ],
      "session-c",
    );

    expect(keys.length).toBeGreaterThan(0);
    expect(hrr.recall("chat:last:session-c:assistant").answer).toBe("Done");
  });
});
