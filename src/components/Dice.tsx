import { useGame } from "../store/gameStore";

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

export default function Dice() {
  const dice = useGame((s) => s.dice);
  const rolling = useGame((s) => s.rolling);
  const moving = useGame((s) => s.moving);
  const winner = useGame((s) => s.winner);
  const roll = useGame((s) => s.rollDice);
  const players = useGame((s) => s.players);
  const idx = useGame((s) => s.currentPlayerIndex);

  const player = players[idx];
  const isComputerTurn = player?.kind === "computer";
  const disabled = rolling || moving || !!winner || isComputerTurn;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-parchment border-2 border-ink/30 shadow-xl grid grid-cols-3 grid-rows-3 p-2 ${
          rolling ? "dice-rolling" : ""
        }`}
      >
        {dice == null ? (
          <div className="col-span-3 row-span-3 flex items-center justify-center text-ink/40 text-2xl">
            ?
          </div>
        ) : (
          Array.from({ length: 9 }).map((_, i) => {
            const r = Math.floor(i / 3);
            const c = i % 3;
            const filled = PIPS[dice]?.some(([pr, pc]) => pr === r && pc === c);
            return (
              <div key={i} className="flex items-center justify-center">
                {filled && <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ink" />}
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => void roll()}
        disabled={disabled}
        className={`btn-primary w-32 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {rolling ? "Rolling…" : isComputerTurn ? "Computer…" : "Roll Dice"}
      </button>
    </div>
  );
}
