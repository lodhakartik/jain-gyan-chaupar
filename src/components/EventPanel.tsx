import { useGame } from "../store/gameStore";

export default function EventPanel() {
  const log = useGame((s) => s.log);
  const players = useGame((s) => s.players);
  const idx = useGame((s) => s.currentPlayerIndex);
  const current = players[idx];

  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-4 h-full">
      <div>
        <div className="text-sm uppercase tracking-wider text-ink/50">Current Turn</div>
        {current && (
          <div className="mt-1 flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full border-2 border-parchment shadow"
              style={{ background: current.color }}
            />
            <span className="font-display text-xl">{current.name}</span>
            <span
              className={`chip ${
                current.kind === "human" ? "bg-saffron text-ink" : "bg-ink text-parchment"
              }`}
            >
              {current.kind}
            </span>
          </div>
        )}
      </div>

      <div>
        <div className="text-sm uppercase tracking-wider text-ink/50 mb-2">Players</div>
        <ul aria-label="Players in turn order" className="space-y-1.5 text-base">
          {players.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${
                i === idx ? "bg-ink/10" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-parchment shadow"
                  style={{ background: p.color }}
                />
                {p.name}
                {p.kind === "computer" && (
                  <span className="text-ink/50 text-xs">(cpu)</span>
                )}
              </span>
              <span className="font-mono text-ink/70">{p.position}/84</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 min-h-0">
        <div className="text-sm uppercase tracking-wider text-ink/50 mb-2">Event Log</div>
        <div role="log" aria-live="polite" aria-relevant="additions" className="overflow-y-auto pr-1 max-h-48 sm:max-h-72 space-y-1.5 text-base">
          {log.length === 0 && (
            <div className="text-ink/50 italic">Roll the dice to begin…</div>
          )}
          {log.map((e) => (
            <div
              key={e.id}
              className={`rounded-md px-2 py-1 ${
                e.tone === "snake"
                  ? "bg-crimson/10 text-crimson"
                  : e.tone === "ladder"
                  ? "bg-moss/10 text-moss"
                  : e.tone === "win"
                  ? "bg-saffron/30 text-ink font-semibold"
                  : "bg-ink/5 text-ink"
              }`}
            >
              {e.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
