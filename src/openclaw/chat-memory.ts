import { OpenClawHrrMemory } from "./hrr-memory.js";

export interface ChatTurn {
  role: "user" | "assistant" | "system";
  text: string;
  timestamp?: string;
}

const COMMITMENT_RE = /\b(todo|remember|remind me|need to|i should|we should|i will)\b/i;

function sanitizeKeyPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9:_-]/g, "-");
}

export class OpenClawChatMemory {
  constructor(private readonly hrr: OpenClawHrrMemory) {}

  ingestTurn(turn: ChatTurn, sessionId = "global"): string[] {
    const text = turn.text.trim();
    if (!text) return [];

    const ts = sanitizeKeyPart(turn.timestamp ?? new Date().toISOString());
    const sid = sanitizeKeyPart(sessionId || "global");
    const role = sanitizeKeyPart(turn.role);

    const keys: string[] = [];

    const kTurn = `chat:${sid}:${ts}:${role}`;
    this.hrr.remember(kTurn, text);
    keys.push(kTurn);

    const kLast = `chat:last:${sid}:${role}`;
    this.hrr.remember(kLast, text);
    keys.push(kLast);

    const sentences = text
      .split(/[\n.!?]/g)
      .map((s) => s.trim())
      .filter(Boolean);

    let c = 0;
    for (const sentence of sentences) {
      if (!COMMITMENT_RE.test(sentence)) continue;
      const key = `commitment:${sid}:${ts}:${c}`;
      this.hrr.remember(key, sentence);
      keys.push(key);
      c++;
    }

    return keys;
  }

  ingestBatch(turns: ChatTurn[], sessionId = "global"): string[] {
    const keys: string[] = [];
    for (const t of turns) keys.push(...this.ingestTurn(t, sessionId));
    return keys;
  }
}
