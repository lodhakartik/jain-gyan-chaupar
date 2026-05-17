import { useState } from "react";
import { PLAYER_COLORS, PLAYER_TOKENS, PLAYER_TOKEN_FACTS, useGame } from "../store/gameStore";
import type { BoardShape, Player, PlayerKind } from "../types/game";

interface Draft {
  name: string;
  kind: PlayerKind;
}

const DEFAULT_NAMES = ["Arihant", "Siddha", "Acharya", "Upadhyaya", "Sadhu", "Shravak"];

export default function PlayerSetup() {
  const goTo = useGame((s) => s.goTo);
  const setupPlayers = useGame((s) => s.setupPlayers);
  const boardShape = useGame((s) => s.boardShape);
  const setBoardShape = useGame((s) => s.setBoardShape);

  const [count, setCount] = useState(2);
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    Array.from({ length: 6 }, (_, i) => ({
      name: DEFAULT_NAMES[i],
      kind: i === 0 ? "human" : "computer",
    }))
  );

  function update(i: number, patch: Partial<Draft>) {
    setDrafts((cur) => cur.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  function start() {
    const players: Player[] = drafts.slice(0, count).map((d, i) => ({
      id: `p${i}`,
      name: d.name.trim() || DEFAULT_NAMES[i],
      kind: d.kind,
      color: PLAYER_COLORS[i],
      token: PLAYER_TOKENS[i],
      position: 0,
    }));
    setupPlayers(players);
  }

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center px-4 py-8">
      <div className="card w-full max-w-2xl p-6 sm:p-8">
        <button onClick={() => goTo("welcome")} className="text-ink/60 hover:text-ink text-sm mb-4">
          ← Back
        </button>
        <h2 className="font-display text-3xl text-crimson font-bold">Player Setup</h2>
        <p className="text-ink/70 text-sm mt-1">Choose number of players and who controls each.</p>

        <div className="mt-6">
          <div className="text-sm font-semibold mb-2">Number of players</div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`btn ${
                  count === n
                    ? "bg-crimson text-parchment"
                    : "bg-ink/5 text-ink hover:bg-ink/10"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold mb-2">Board shape</div>
          <div className="grid grid-cols-2 gap-2">
            <ShapeOption
              active={boardShape === "classic"}
              title="Classic Square"
              subtitle="7 × 12 grid"
              shape="classic"
              onClick={() => setBoardShape("classic")}
            />
            <ShapeOption
              active={boardShape === "lok"}
              title="Jain Lok"
              subtitle="Lok Purusha silhouette around the board"
              shape="lok"
              onClick={() => setBoardShape("lok")}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold mb-1">Select your icon</div>
          <div className="text-xs text-ink/60 mb-3">
            Each token is the lanchhana (sacred sign) of a Tirthankar Bhagwan.
          </div>
        </div>

        <div className="space-y-3">
          {drafts.slice(0, count).map((d, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-ink/5 rounded-xl p-3"
            >
              <div className="flex flex-col items-center shrink-0 gap-1 w-24">
                <div
                  className="w-14 h-14 rounded-full bg-parchment shadow flex items-center justify-center text-3xl leading-none select-none"
                  style={{ borderWidth: 3, borderStyle: "solid", borderColor: PLAYER_COLORS[i] }}
                  aria-label={`Player token ${PLAYER_TOKENS[i]}`}
                >
                  <span>{PLAYER_TOKENS[i]}</span>
                </div>
                <div className="text-[10px] leading-tight text-ink/70 text-center">
                  <div className="font-semibold text-ink/85">{PLAYER_TOKEN_FACTS[i].animal}</div>
                  <div>sign of Bhagwan {PLAYER_TOKEN_FACTS[i].tirthankara} Ji</div>
                </div>
              </div>
              <input
                value={d.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder={`Player ${i + 1}`}
                className="flex-1 bg-parchment border border-ink/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron"
              />
              <div className="flex gap-2">
                <KindToggle
                  active={d.kind === "human"}
                  label="Human"
                  onClick={() => update(i, { kind: "human" })}
                />
                <KindToggle
                  active={d.kind === "computer"}
                  label="Computer"
                  onClick={() => update(i, { kind: "computer" })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button className="btn-ghost" onClick={() => goTo("welcome")}>
            Cancel
          </button>
          <button className="btn-primary" onClick={start}>
            Begin Game
          </button>
        </div>
      </div>
    </div>
  );
}

function KindToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        active ? "bg-saffron text-ink shadow" : "bg-parchment text-ink/70 border border-ink/10"
      }`}
    >
      {label}
    </button>
  );
}

function ShapeOption({
  active,
  title,
  subtitle,
  shape,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  shape: BoardShape;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
        active
          ? "bg-saffron/20 border-saffron shadow"
          : "bg-parchment border-ink/10 hover:bg-ink/5"
      }`}
    >
      <ShapePreview shape={shape} active={active} />
      <div>
        <div className="font-semibold text-sm text-ink">{title}</div>
        <div className="text-xs text-ink/60">{subtitle}</div>
      </div>
    </button>
  );
}

function ShapePreview({ shape, active }: { shape: BoardShape; active: boolean }) {
  const stroke = active ? "#a8261c" : "#1f2937";
  if (shape === "classic") {
    return (
      <svg viewBox="0 0 24 28" className="w-10 h-12 shrink-0">
        <rect x="3" y="3" width="18" height="22" fill="none" stroke={stroke} strokeWidth="1.5" rx="2" />
      </svg>
    );
  }
  // Lok Purusha: narrow apex → wide shoulders → narrow trasanadi column → bottom
  return (
    <svg viewBox="0 0 24 32" className="w-10 h-12 shrink-0">
      <path
        d="
          M 11 3 L 13 3
          L 19 8 L 22 13
          L 22 16 L 19 19
          L 13 22 L 13 29 L 11 29 L 11 22
          L 5 19 L 2 16
          L 2 13 L 5 8
          Z
        "
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="2" r="1.2" fill={stroke} />
    </svg>
  );
}
