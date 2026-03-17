import { describe, it, expect } from "vitest";
import { loadHrrConfig } from "../src/openclaw/config.js";

describe("loadHrrConfig", () => {
  it("handles missing HOME in process env for default save path", () => {
    const prev = process.env.HOME;
    delete process.env.HOME;
    try {
      const cfg = loadHrrConfig({} as NodeJS.ProcessEnv);
      expect(cfg.saveDir).toBe("/.openclaw/hrr");
    } finally {
      if (prev !== undefined) process.env.HOME = prev;
    }
  });
  it("loads defaults", () => {
    const cfg = loadHrrConfig({ HOME: "/tmp/home" } as NodeJS.ProcessEnv);
    expect(cfg.enabled).toBe(true);
    expect(cfg.nuggetName).toBe("self");
    expect(cfg.D).toBe(4096);
    expect(cfg.banks).toBe(4);
  });

  it("honors env overrides", () => {
    const cfg = loadHrrConfig({
      MEMORY_HRR_ENABLED: "yes",
      MEMORY_HRR_PATH: "/data/hrr",
      MEMORY_HRR_NUGGET: "agent-core",
      MEMORY_HRR_D: "8192",
      MEMORY_HRR_BANKS: "8",
      MEMORY_HRR_ENSEMBLES: "2",
      MEMORY_HRR_MAX_FACTS: "1000",
    } as NodeJS.ProcessEnv);

    expect(cfg.enabled).toBe(true);
    expect(cfg.saveDir).toBe("/data/hrr");
    expect(cfg.nuggetName).toBe("agent-core");
    expect(cfg.D).toBe(8192);
    expect(cfg.banks).toBe(8);
    expect(cfg.ensembles).toBe(2);
    expect(cfg.maxFacts).toBe(1000);
  });

  it("parses explicit false values", () => {
    const cfg = loadHrrConfig({
      MEMORY_HRR_ENABLED: "false",
      MEMORY_HRR_PATH: "/data/hrr",
      MEMORY_HRR_NUGGET: "agent-core",
      MEMORY_HRR_D: "8192",
      MEMORY_HRR_BANKS: "8",
      MEMORY_HRR_ENSEMBLES: "2",
      MEMORY_HRR_MAX_FACTS: "1000",
    } as NodeJS.ProcessEnv);

    expect(cfg.enabled).toBe(false);
    expect(cfg.saveDir).toBe("/data/hrr");
    expect(cfg.nuggetName).toBe("agent-core");
    expect(cfg.D).toBe(8192);
    expect(cfg.banks).toBe(8);
    expect(cfg.ensembles).toBe(2);
    expect(cfg.maxFacts).toBe(1000);
  });

  it("falls back on invalid values", () => {
    const cfg = loadHrrConfig({
      HOME: "/tmp/home",
      MEMORY_HRR_ENABLED: "maybe",
      MEMORY_HRR_D: "-1",
      MEMORY_HRR_BANKS: "0",
      MEMORY_HRR_ENSEMBLES: "NaN",
      MEMORY_HRR_MAX_FACTS: "",
    } as NodeJS.ProcessEnv);

    expect(cfg.enabled).toBe(true);
    expect(cfg.D).toBe(4096);
    expect(cfg.banks).toBe(4);
    expect(cfg.ensembles).toBe(1);
    expect(cfg.maxFacts).toBe(0);
  });
});
