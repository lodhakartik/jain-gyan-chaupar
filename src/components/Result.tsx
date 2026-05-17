import { useGame } from "../store/gameStore";

export default function Result() {
  const winner = useGame((s) => s.winner);
  const players = useGame((s) => s.players);
  const resetGame = useGame((s) => s.resetGame);
  const newGame = useGame((s) => s.newGameSameSetup);

  if (!winner) return null;

  const ranking = [...players].sort((a, b) => b.position - a.position);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="card max-w-lg w-full p-8 text-center">
        <div className="text-saffron text-sm tracking-[0.3em] mb-2">MOKSHA ATTAINED</div>
        <div
          className="mx-auto w-20 h-20 rounded-full border-4 border-parchment shadow-xl mb-4"
          style={{ background: winner.color }}
        />
        <h2 className="font-display text-3xl text-crimson font-bold">{winner.name} wins</h2>
        <p className="text-ink/70 mt-1">Liberated from the cycle of 84 Jeev Yoni.</p>

        <div className="mt-6 text-left">
          <div className="text-xs uppercase tracking-wider text-ink/50 mb-2">Final Standings</div>
          <ol className="space-y-1.5">
            {ranking.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center justify-between bg-ink/5 rounded-lg px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-ink/50 w-5">{i + 1}.</span>
                  <span
                    className="w-3 h-3 rounded-full border border-parchment shadow"
                    style={{ background: p.color }}
                  />
                  {p.name}
                  <span className="text-ink/50 text-xs">({p.kind})</span>
                </span>
                <span className="font-mono">{p.position}/84</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-primary" onClick={newGame}>
            Play Again
          </button>
          <button className="btn-ghost" onClick={resetGame}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
