import { useState } from "react";
import { useGame } from "../store/gameStore";
import { bumpPlayCount } from "../lib/playCount";
import RulesModal from "./RulesModal";

export default function Welcome() {
  const goTo = useGame((s) => s.goTo);
  const [rulesOpen, setRulesOpen] = useState(false);

  const handleStart = () => {
    bumpPlayCount();
    goTo("setup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="card max-w-2xl w-full p-10 text-center">
        <div className="text-saffron text-sm tracking-[0.3em] mb-3">JAIN GYAN CHAUPAR</div>
        <h1 className="font-display text-4xl sm:text-5xl text-crimson font-bold leading-tight">
          84 Jeev Yoni
        </h1>
        <p className="mt-4 text-ink/70 max-w-md mx-auto">
          A spiritual reimagining of the classic Snakes &amp; Ladders. Climb the ladders of{" "}
          <span className="text-moss font-semibold">punya</span>, beware the snakes of{" "}
          <span className="text-crimson font-semibold">paap</span>, and journey toward{" "}
          <span className="font-semibold">Moksha</span>.
        </p>

        <div className="grid grid-cols-3 gap-3 my-8 text-sm">
          <Stat n="84" label="Jeev Yoni" />
          <Stat n="18" label="Paap (Snakes)" />
          <Stat n="9" label="Punya (Ladders)" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-primary min-h-[44px]" onClick={handleStart} aria-label="Start a new game">
            Start Game
          </button>
          <button
            className="btn-ghost min-h-[44px]"
            onClick={() => setRulesOpen(true)}
            aria-label="Open rules"
          >
            Rules
          </button>
        </div>

        <p className="mt-8 text-xs text-ink/50">Play offline, on one device, 1 to 6 players.</p>
      </div>
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl bg-ink/5 py-4">
      <div className="font-display text-3xl text-crimson">{n}</div>
      <div className="text-ink/70 text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
