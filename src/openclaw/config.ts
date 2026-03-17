export interface HrrConfig {
  enabled: boolean;
  saveDir: string;
  nuggetName: string;
  D: number;
  banks: number;
  ensembles: number;
  maxFacts: number;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const v = value.toLowerCase().trim();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return fallback;
}

function parseIntSafe(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadHrrConfig(env: NodeJS.ProcessEnv = process.env): HrrConfig {
  return {
    enabled: parseBool(env.MEMORY_HRR_ENABLED, true),
    saveDir: env.MEMORY_HRR_PATH ?? `${process.env.HOME ?? ""}/.openclaw/hrr`,
    nuggetName: env.MEMORY_HRR_NUGGET ?? "self",
    D: parseIntSafe(env.MEMORY_HRR_D, 4096),
    banks: parseIntSafe(env.MEMORY_HRR_BANKS, 4),
    ensembles: parseIntSafe(env.MEMORY_HRR_ENSEMBLES, 1),
    maxFacts: parseIntSafe(env.MEMORY_HRR_MAX_FACTS, 0),
  };
}
