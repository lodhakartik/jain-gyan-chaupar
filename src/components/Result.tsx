import { useEffect, useMemo, useState } from "react";
import { useGame } from "../store/gameStore";

// Hand-rolled confetti palette: gold, crimson, saffron, moss.
// Kept tasteful and parchment-friendly — no arcade neons.
const CONFETTI_COLORS = ["#C8A14B", "#7A1D1D", "#D97706", "#65A30D"];
const CONFETTI_COUNT = 36;

interface ConfettiPiece {
  id: number;
  x: number; // left position in percent
  delay: number; // seconds
  duration: number; // seconds
  color: string;
  rotate: number; // initial rotation deg
}

export default function Result() {
  const winner = useGame((s) => s.winner);
  const players = useGame((s) => s.players);
  const resetGame = useGame((s) => s.resetGame);
  const newGame = useGame((s) => s.newGameSameSetup);

  // One-shot confetti burst on mount. Pieces are deterministic per mount via
  // useMemo so we don't rebuild them on every re-render mid-animation.
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.floor(Math.random() * 360),
    }));
  }, [winner?.id]);

  // The burst is purely visual; we still gate it behind a mounted flag so
  // SSR/strict-mode double-invoke doesn't double-trigger any future audio.
  const [burstReady, setBurstReady] = useState(false);
  useEffect(() => {
    setBurstReady(true);
    // No cleanup needed — the elements unmount with the component when the
    // user clicks Play Again / Main Menu, and the keyframes run once
    // (forwards) over 2-3 seconds.
  }, []);

  if (!winner) return null;

  const ranking = [...players].sort((a, b) => b.position - a.position);
  const winnerToken = winner.token ?? "🌸";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Confetti burst — fixed full-screen layer behind interaction. */}
      {burstReady && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
          {pieces.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={
                {
                  left: `${p.x}%`,
                  "--x": `${p.x}%`,
                  "--delay": `${p.delay}s`,
                  "--duration": `${p.duration}s`,
                  background: p.color,
                  transform: `rotate(${p.rotate}deg)`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="card max-w-lg w-full p-8 text-center relative z-50">
        <div
          className="text-saffron text-sm tracking-[0.3em] mb-3 reveal-fade-up"
          style={{ animationDuration: "600ms" } as React.CSSProperties}
        >
          MOKSHA ATTAINED
        </div>

        <div
          className="reveal-pop mx-auto mb-4 w-24 h-24 rounded-full border-4 border-[#C8A14B] bg-parchment flex items-center justify-center text-5xl shadow-[0_6px_0_rgba(58,31,14,0.18),0_12px_24px_rgba(58,31,14,0.25)]"
          style={
            {
              animationDuration: "900ms",
              animationDelay: "300ms",
            } as React.CSSProperties
          }
          aria-hidden
        >
          <span>{winnerToken}</span>
        </div>

        <h2
          className="font-display text-3xl text-crimson font-bold reveal-fade-up"
          style={
            {
              animationDuration: "900ms",
              animationDelay: "300ms",
            } as React.CSSProperties
          }
        >
          {winner.name} wins
        </h2>
        <p
          className="font-display text-2xl text-saffron mt-1 reveal-fade-up"
          style={
            {
              animationDuration: "900ms",
              animationDelay: "450ms",
            } as React.CSSProperties
          }
        >
          मोक्ष प्राप्ति
        </p>
        <p
          className="text-ink/70 mt-1 reveal-fade-up"
          style={
            {
              animationDuration: "600ms",
              animationDelay: "600ms",
            } as React.CSSProperties
          }
        >
          Liberated from the cycle of 84 Jeev Yoni.
        </p>

        <div
          className="mt-6 text-left reveal-fade-up"
          style={
            {
              animationDuration: "600ms",
              animationDelay: "900ms",
            } as React.CSSProperties
          }
        >
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

        <div
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center reveal-fade-up"
          style={
            {
              animationDuration: "600ms",
              animationDelay: "1100ms",
            } as React.CSSProperties
          }
        >
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
