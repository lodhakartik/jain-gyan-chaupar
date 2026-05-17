import type { Jump, Severity } from "../types/game";
import jumpsJson from "./jumps.json";

export const BOARD_SIZE = 84;
export const FINAL_SQUARE_LABEL = "Moksha";

type RawJump = {
  from: number;
  to: number;
  label: string;
  script?: string;
  hint?: string;
  severity: Severity;
  doha?: string;
  audio?: string;
};

// Edit src/data/jumps.json to move endpoints. Vite hot-reloads on save.
export const snakes: Jump[] = (jumpsJson.snakes as RawJump[]).map((j) => ({ ...j }));
export const ladders: Jump[] = (jumpsJson.ladders as RawJump[]).map((j) => ({ ...j }));

if (import.meta.env.DEV) {
  validateJumps(snakes, ladders);
}

function validateJumps(snakes: Jump[], ladders: Jump[]) {
  const problems: string[] = [];
  const seenSnakeFrom = new Map<number, string>();
  const seenLadderFrom = new Map<number, string>();

  for (const s of snakes) {
    if (s.from <= s.to) problems.push(`Snake "${s.label}" must fall: from=${s.from} to=${s.to}`);
    if (s.from < 1 || s.from > BOARD_SIZE) problems.push(`Snake "${s.label}" from=${s.from} out of range`);
    if (s.to < 1 || s.to > BOARD_SIZE) problems.push(`Snake "${s.label}" to=${s.to} out of range`);
    if (s.from <= 10) problems.push(`Snake "${s.label}" head on square ${s.from} (<=10) — too punishing early`);
    if (seenSnakeFrom.has(s.from))
      problems.push(`Two snakes share from=${s.from}: "${seenSnakeFrom.get(s.from)}" and "${s.label}"`);
    seenSnakeFrom.set(s.from, s.label);
  }

  for (const l of ladders) {
    if (l.to <= l.from) problems.push(`Ladder "${l.label}" must rise: from=${l.from} to=${l.to}`);
    if (l.from < 1 || l.from > BOARD_SIZE) problems.push(`Ladder "${l.label}" from=${l.from} out of range`);
    if (l.to < 1 || l.to > BOARD_SIZE) problems.push(`Ladder "${l.label}" to=${l.to} out of range`);
    if (seenLadderFrom.has(l.from))
      problems.push(`Two ladders share from=${l.from}: "${seenLadderFrom.get(l.from)}" and "${l.label}"`);
    seenLadderFrom.set(l.from, l.label);
  }

  const snakeFroms = new Set(snakes.map((s) => s.from));
  const snakeTos = new Set(snakes.map((s) => s.to));
  const ladderFroms = new Set(ladders.map((l) => l.from));
  const ladderTos = new Set(ladders.map((l) => l.to));
  for (const sq of snakeFroms) if (ladderFroms.has(sq)) problems.push(`Square ${sq} is both a snake head and a ladder bottom`);
  for (const sq of snakeFroms) if (ladderTos.has(sq)) problems.push(`Square ${sq} is both a snake head and a ladder top (chain)`);
  for (const sq of snakeTos) if (ladderFroms.has(sq)) problems.push(`Square ${sq} is both a snake tail and a ladder bottom (chain)`);

  if (problems.length) {
    console.warn("[board/jumps.json] issues detected:\n" + problems.map((p) => "  • " + p).join("\n"));
  } else {
    console.info(`[board/jumps.json] OK — ${snakes.length} snakes, ${ladders.length} ladders.`);
  }
}

const snakeByFrom = new Map(snakes.map((s) => [s.from, s]));
const ladderByFrom = new Map(ladders.map((l) => [l.from, l]));

export const findSnake = (square: number): Jump | undefined => snakeByFrom.get(square);
export const findLadder = (square: number): Jump | undefined => ladderByFrom.get(square);
