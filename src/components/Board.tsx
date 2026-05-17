import { useMemo } from "react";
import { useGame } from "../store/gameStore";
import { BOARD_SIZE, findLadder, findSnake } from "../data/board";
import { getLayout, type BoardLayout } from "../data/boardLayout";
import type { Player } from "../types/game";
import BoardOverlay from "./BoardOverlay";
import LokFrame from "./LokFrame";
import { useLokEditor } from "../store/lokEditorStore";

export default function Board() {
  const players = useGame((s) => s.players);
  const boardShape = useGame((s) => s.boardShape);
  const layout = useMemo(() => getLayout(boardShape), [boardShape]);
  const lokEditorEnabled = useLokEditor((s) => s.enabled);
  const toggleLokEditor = useLokEditor((s) => s.toggle);

  const occupancy = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      if (p.position < 1) return;
      const arr = map.get(p.position) ?? [];
      arr.push(p);
      map.set(p.position, arr);
    });
    return map;
  }, [players]);

  const benched = players.filter((p) => p.position === 0);

  const gridBlock = (
    <div className="relative">
      <BoardGrid layout={layout} occupancy={occupancy} />

      {/* SVG overlay aligned to the inner grid (inset matches p-1.5 / sm:p-2) */}
      <div className="absolute inset-1.5 sm:inset-2 pointer-events-none">
        <BoardOverlay layout={layout} />
      </div>

      {/* Player tokens rendered above the snakes/ladders */}
      <div className="absolute inset-1.5 sm:inset-2 pointer-events-none">
        <TokenLayer layout={layout} occupancy={occupancy} />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {boardShape === "lok" && (
        <div className="mb-2 flex justify-end">
          <button
            onClick={toggleLokEditor}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition ${
              lokEditorEnabled
                ? "bg-crimson text-parchment hover:bg-crimson/90"
                : "bg-ink/10 text-ink hover:bg-ink/20"
            }`}
            title="Drag silhouette corners and overlay a tracing image"
          >
            {lokEditorEnabled ? "✓ Editing Lok shape" : "✏️ Edit Lok shape"}
          </button>
        </div>
      )}
      {boardShape === "lok" ? <LokFrame layout={layout}>{gridBlock}</LokFrame> : gridBlock}

      {benched.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink/70">
          <span className="font-semibold">Start:</span>
          {benched.map((p) => (
            <span key={p.id} className="flex items-center gap-1.5">
              <span
                className="w-7 h-7 rounded-full inline-flex items-center justify-center bg-parchment shadow text-base leading-none select-none"
                style={{ borderWidth: 2, borderStyle: "solid", borderColor: p.color }}
              >
                <span>{p.token ?? ""}</span>
              </span>
              {p.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BoardGrid({
  layout,
  occupancy,
}: {
  layout: BoardLayout;
  occupancy: Map<number, Player[]>;
}) {
  // Build an array of {square, row, col} entries placed on a width × height CSS grid.
  // `col` is the absolute column position — the layout already accounts for narrow rows
  // (centred) and the central trasanadi gap (skipped) in Lok mode.
  const placed = useMemo(() => {
    const items: { square: number; row: number; col: number }[] = [];
    for (let s = 1; s <= BOARD_SIZE; s++) {
      const { row, col } = layout.squareToCell(s);
      items.push({ square: s, row, col });
    }
    return items;
  }, [layout]);

  const isLok = layout.shape === "lok";
  return (
    <div
      className={`grid gap-1 sm:gap-1.5 p-1.5 sm:p-2 ${
        isLok ? "" : "rounded-xl bg-ink/10 shadow-inner"
      }`}
      style={{
        gridTemplateColumns: `repeat(${layout.width}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${layout.height}, minmax(0, 1fr))`,
      }}
    >
      {placed.map(({ square, row, col }) => (
        <div
          key={square}
          style={{
            gridRow: row + 1,
            gridColumnStart: col + 1,
          }}
        >
          <Cell square={square} occupants={occupancy.get(square) ?? []} />
        </div>
      ))}
    </div>
  );
}

function Cell({ square, occupants: _occupants }: { square: number; occupants: Player[] }) {
  const snake = findSnake(square);
  const ladder = findLadder(square);
  const isFinal = square === BOARD_SIZE;

  const bg = isFinal
    ? "bg-gradient-to-br from-saffron to-crimson text-parchment"
    : snake
    ? "bg-crimson/5"
    : ladder
    ? "bg-moss/5"
    : "bg-parchment";

  const tooltip = snake
    ? `${snake.script ?? snake.label} — ${snake.hint ?? ""}`
    : ladder
    ? `${ladder.script ?? ladder.label} — ${ladder.hint ?? ""}`
    : undefined;

  return (
    <div
      title={tooltip}
      className={`relative aspect-square rounded-md sm:rounded-lg border border-ink/10 ${bg} flex flex-col p-1 sm:p-1.5 overflow-hidden`}
    >
      <div className="text-[10px] sm:text-xs font-bold text-ink/60">{square}</div>
    </div>
  );
}

function TokenLayer({
  layout,
  occupancy,
}: {
  layout: BoardLayout;
  occupancy: Map<number, Player[]>;
}) {
  const entries: { square: number; players: Player[] }[] = [];
  occupancy.forEach((players, square) => entries.push({ square, players }));

  return (
    <div className="relative w-full h-full">
      {entries.map(({ square, players }) => {
        const xy = layout.squareToXY(square);
        const cellW = 100 / layout.width;
        const cellH = 100 / layout.height;
        const leftPct = ((xy.x - 0.5) / layout.width) * 100;
        const topPct = ((xy.y - 0.5) / layout.height) * 100;
        return (
          <div
            key={square}
            className="absolute flex flex-wrap gap-0.5 justify-end items-start p-1"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${cellW}%`,
              height: `${cellH}%`,
            }}
          >
            {players.slice(0, 6).map((p) => (
              <span
                key={p.id}
                title={p.name}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-parchment shadow-md flex items-center justify-center text-base sm:text-xl leading-none select-none"
                style={{ borderWidth: 2, borderStyle: "solid", borderColor: p.color }}
              >
                <span>{p.token ?? ""}</span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
