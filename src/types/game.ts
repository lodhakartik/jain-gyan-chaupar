export type PlayerKind = "human" | "computer";

export interface Player {
  id: string;
  name: string;
  kind: PlayerKind;
  color: string;
  position: number;
  token: string;
  rolls?: number;
  punyas?: number;
  paaps?: number;
}

export type Severity = "small" | "medium" | "big";

export interface Jump {
  from: number;
  to: number;
  label: string;
  script?: string;
  hint?: string;
  severity: Severity;
  doha?: string;
  audio?: string;
}

export type Screen = "welcome" | "setup" | "game" | "result";

export type BoardShape = "classic" | "lok";

export interface LogEntry {
  id: number;
  text: string;
  tone: "info" | "snake" | "ladder" | "win";
}
