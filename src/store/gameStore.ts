import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { BoardShape, Jump, LogEntry, Player, Screen } from "../types/game";
import { BOARD_SIZE, findLadder, findSnake } from "../data/board";

export const PLAYER_COLORS = [
  "#a8261c", // crimson
  "#1e3a8a", // indigo
  "#2f6a3a", // moss
  "#c2410c", // burnt orange
  "#7c2d92", // plum
  "#0f766e", // teal
];

// Auspicious Jain animals (Tirthankara lanchhana) paired one-to-one with the
// player colors above. Used as the token shown on the board and in the
// player-setup row instead of a plain colored dot.
export const PLAYER_TOKENS = [
  "🐘", // Ajitnath — Elephant
  "🐂", // Rishabhanath — Bull
  "🐢", // Munisuvrata — Turtle
  "🦁", // Mahavira — Lion
  "🦌", // Shantinath — Deer
  "🐟", // Aranatha — Fish
];

// Tirthankara lanchhana facts shown beneath each player's disc in the setup
// screen so children learn which sign belongs to which Tirthankar Bhagwan.
// Parallel to PLAYER_TOKENS by index.
export const PLAYER_TOKEN_FACTS = [
  { animal: "Elephant", tirthankara: "Ajitnath" },
  { animal: "Bull",     tirthankara: "Adinath" },
  { animal: "Turtle",   tirthankara: "Munisuvrat" },
  { animal: "Lion",     tirthankara: "Mahavir" },
  { animal: "Deer",     tirthankara: "Shantinath" },
  { animal: "Fish",     tirthankara: "Aranath" },
];

interface GameState {
  screen: Screen;
  players: Player[];
  currentPlayerIndex: number;
  dice: number | null;
  rolling: boolean;
  moving: boolean;
  winner: Player | null;
  log: LogEntry[];
  exactFinishRule: boolean;
  boardShape: BoardShape;
  activePaap: Jump | null;
  activePunya: Jump | null;

  goTo: (screen: Screen) => void;
  setupPlayers: (players: Player[]) => void;
  setBoardShape: (shape: BoardShape) => void;
  rollDice: () => Promise<void>;
  resetGame: () => void;
  newGameSameSetup: () => void;
  dismissPaap: () => void;
  dismissPunya: () => void;
}

// Resolvers for in-flight doha modals — `rollDice` awaits one of these before
// sliding the player along the snake/ladder, so the verse is read first.
let paapResolver: (() => void) | null = null;
let punyaResolver: (() => void) | null = null;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let logIdCounter = 0;
const nextLogId = () => ++logIdCounter;

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
  screen: "welcome",
  players: [],
  currentPlayerIndex: 0,
  dice: null,
  rolling: false,
  moving: false,
  winner: null,
  log: [],
  exactFinishRule: true,
  boardShape: "classic",
  activePaap: null,
  activePunya: null,

  goTo: (screen) => set({ screen }),
  setBoardShape: (shape) => set({ boardShape: shape }),

  dismissPaap: () => {
    set({ activePaap: null });
    const resolve = paapResolver;
    paapResolver = null;
    if (resolve) resolve();
  },

  dismissPunya: () => {
    set({ activePunya: null });
    const resolve = punyaResolver;
    punyaResolver = null;
    if (resolve) resolve();
  },

  setupPlayers: (players) =>
    set({
      players: players.map((p) => ({ rolls: 0, punyas: 0, paaps: 0, ...p })),
      currentPlayerIndex: 0,
      dice: null,
      rolling: false,
      moving: false,
      winner: null,
      log: [
        {
          id: nextLogId(),
          text: `Game begins with ${players.length} player${players.length > 1 ? "s" : ""}.`,
          tone: "info",
        },
      ],
      screen: "game",
    }),

  rollDice: async () => {
    const state = get();
    if (state.rolling || state.moving || state.winner) return;

    const player = state.players[state.currentPlayerIndex];
    if (!player) return;

    set({ rolling: true, dice: null });
    // Shake animation duration
    for (let i = 0; i < 6; i++) {
      set({ dice: 1 + Math.floor(Math.random() * 6) });
      await wait(70);
    }
    const roll = 1 + Math.floor(Math.random() * 6);
    set({ dice: roll, rolling: false, moving: true });

    appendLog(set, get, `${player.name} rolled a ${roll}.`, "info");

    // Tally this dice roll for the end-of-game summary.
    set({
      players: get().players.map((p) =>
        p.id === player.id ? { ...p, rolls: (p.rolls ?? 0) + 1 } : p
      ),
    });

    // Move step by step for visual feedback
    let target = player.position + roll;

    if (get().exactFinishRule && target > BOARD_SIZE) {
      // Bounce back rule
      const overshoot = target - BOARD_SIZE;
      target = BOARD_SIZE - overshoot;
      appendLog(set, get, `Overshoots Moksha — bounces back to ${target}.`, "info");
    }

    target = Math.max(0, Math.min(BOARD_SIZE, target));

    await stepTo(set, get, player.id, target);

    // Resolve snake / ladder
    const onSquare = get().players.find((p) => p.id === player.id)!.position;
    const ladder = findLadder(onSquare);
    const snake = findSnake(onSquare);

    if (ladder) {
      const name = ladder.script ? `${ladder.script} (${ladder.label})` : ladder.label;
      appendLog(
        set,
        get,
        `🪜 ${player.name} climbs ${name} — ${ladder.hint} → ${ladder.to}.`,
        "ladder"
      );
      await wait(250);
      // Show the punya doha and wait for the player to dismiss it before
      // the token climbs up — same teaching moment as the paap flow.
      await new Promise<void>((resolve) => {
        punyaResolver = resolve;
        set({ activePunya: ladder });
      });
      // Tally this punya for the end-of-game summary.
      set({
        players: get().players.map((p) =>
          p.id === player.id ? { ...p, punyas: (p.punyas ?? 0) + 1 } : p
        ),
      });
      await stepTo(set, get, player.id, ladder.to);
    } else if (snake) {
      const name = snake.script ? `${snake.script} (${snake.label})` : snake.label;
      appendLog(
        set,
        get,
        `🐍 ${player.name} bitten by ${name} — ${snake.hint} → ${snake.to}.`,
        "snake"
      );
      await wait(250);
      // Show the paapsthanak doha and wait for the player to dismiss it
      // before the token slides down — this is the teaching moment.
      await new Promise<void>((resolve) => {
        paapResolver = resolve;
        set({ activePaap: snake });
      });
      // Tally this paap for the end-of-game summary.
      set({
        players: get().players.map((p) =>
          p.id === player.id ? { ...p, paaps: (p.paaps ?? 0) + 1 } : p
        ),
      });
      await stepTo(set, get, player.id, snake.to);
    }

    const finalPos = get().players.find((p) => p.id === player.id)!.position;
    if (finalPos === BOARD_SIZE) {
      appendLog(set, get, `🏆 ${player.name} attains Moksha! Game over.`, "win");
      set({ moving: false, winner: { ...player, position: BOARD_SIZE } });
      setTimeout(() => set({ screen: "result" }), 1200);
      return;
    }

    // Next turn
    const nextIndex = (get().currentPlayerIndex + 1) % get().players.length;
    set({ moving: false, currentPlayerIndex: nextIndex });

    // If next player is computer, auto-roll
    const next = get().players[nextIndex];
    if (next.kind === "computer" && !get().winner) {
      await wait(700);
      void get().rollDice();
    }
  },

  resetGame: () => {
    if (paapResolver) { paapResolver(); paapResolver = null; }
    if (punyaResolver) { punyaResolver(); punyaResolver = null; }
    set({
      screen: "welcome",
      players: [],
      currentPlayerIndex: 0,
      dice: null,
      rolling: false,
      moving: false,
      winner: null,
      log: [],
      activePaap: null,
      activePunya: null,
    });
  },

  newGameSameSetup: () => {
    const fresh = get().players.map((p) => ({
      ...p,
      position: 0,
      rolls: 0,
      punyas: 0,
      paaps: 0,
    }));
    set({
      players: fresh,
      currentPlayerIndex: 0,
      dice: null,
      rolling: false,
      moving: false,
      winner: null,
      log: [{ id: nextLogId(), text: "New game — same players.", tone: "info" }],
      screen: "game",
    });
  },
}),
    {
      name: "jain-gyan-chaupar/game-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        screen: s.screen,
        players: s.players,
        currentPlayerIndex: s.currentPlayerIndex,
        dice: s.dice,
        winner: s.winner,
        log: s.log,
        boardShape: s.boardShape,
        exactFinishRule: s.exactFinishRule,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Reset any transient flags that survived from a previous session.
        state.rolling = false;
        state.moving = false;
        state.activePaap = null;
        state.activePunya = null;
      },
    },
  ),
);

function appendLog(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
  text: string,
  tone: LogEntry["tone"]
) {
  const entry: LogEntry = { id: nextLogId(), text, tone };
  const next = [entry, ...get().log].slice(0, 40);
  set({ log: next });
}

async function stepTo(
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
  playerId: string,
  target: number
) {
  const start = get().players.find((p) => p.id === playerId)!.position;
  const direction = target > start ? 1 : -1;
  let cur = start;
  while (cur !== target) {
    cur += direction;
    const players = get().players.map((p) => (p.id === playerId ? { ...p, position: cur } : p));
    set({ players });
    await wait(110);
  }
}
