import { OpenClawHrrMemory } from "./hrr-memory.js";

export interface HeartbeatResult {
  status: "HEARTBEAT_OK" | "ALERT";
  alerts: string[];
  checkedFacts: number;
}

export function heartbeatRecall(hrr: OpenClawHrrMemory, sessionId = "global"): HeartbeatResult {
  const facts = hrr.facts();
  const sid = sessionId || "global";

  const commitments = facts
    .filter((f) => f.key.startsWith(`commitment:${sid}:`))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5);

  if (commitments.length > 0) {
    return {
      status: "ALERT",
      alerts: commitments.map((c) => `Commitment: ${c.value}`),
      checkedFacts: facts.length,
    };
  }

  const lastUser = facts.find((f) => f.key === `chat:last:${sid}:user`);
  if (lastUser) {
    return {
      status: "ALERT",
      alerts: [`Last user context: ${lastUser.value}`],
      checkedFacts: facts.length,
    };
  }

  return {
    status: "HEARTBEAT_OK",
    alerts: [],
    checkedFacts: facts.length,
  };
}
