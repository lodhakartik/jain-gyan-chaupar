import { useEffect } from "react";
import { useGame } from "../store/gameStore";
import Board from "./Board";
import Dice from "./Dice";
import EventPanel from "./EventPanel";

export default function GameBoard() {
  const resetGame = useGame((s) => s.resetGame);
  const players = useGame((s) => s.players);
  const idx = useGame((s) => s.currentPlayerIndex);
  const roll = useGame((s) => s.rollDice);
  const rolling = useGame((s) => s.rolling);
  const moving = useGame((s) => s.moving);
  const winner = useGame((s) => s.winner);

  // If first player is computer, kick off their turn
  useEffect(() => {
    const p = players[idx];
    if (!p) return;
    if (p.kind === "computer" && !rolling && !moving && !winner) {
      const t = setTimeout(() => void roll(), 700);
      return () => clearTimeout(t);
    }
  }, [idx, players, rolling, moving, winner, roll]);

  return (
    <div className="min-h-screen px-1 sm:px-6 py-2 sm:py-6">
      <header className="flex items-center justify-between mb-2 sm:mb-4 max-w-6xl mx-auto px-2 sm:px-0">
        <div>
          <div className="text-saffron text-xs sm:text-sm tracking-[0.3em]">JAIN GYAN CHAUPAR</div>
          <h1 className="font-display text-2xl sm:text-3xl text-crimson font-bold">84 Jeev Yoni</h1>
        </div>
        <button onClick={resetGame} className="btn-ghost text-sm min-h-[44px]">
          Exit
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-2 sm:gap-4 max-w-6xl mx-auto">
        <div className="card p-1 sm:p-4">
          <Board />
        </div>

        <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-0">
          <div className="card p-3 sm:p-4 flex items-center justify-center">
            <Dice />
          </div>
          <EventPanel />
        </div>
      </div>
    </div>
  );
}
