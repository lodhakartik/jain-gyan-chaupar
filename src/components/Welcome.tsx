import { useGame } from "../store/gameStore";
import { bumpPlayCount } from "../lib/playCount";

export default function Welcome() {
  const goTo = useGame((s) => s.goTo);

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
          <button className="btn-primary" onClick={handleStart}>
            Start Game
          </button>
          <button
            className="btn-ghost"
            onClick={() => alert(rulesText)}
          >
            Rules
          </button>
        </div>

        <p className="mt-8 text-xs text-ink/50">Play offline, on one device, 1 to 6 players.</p>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl bg-ink/5 py-4">
      <div className="font-display text-2xl text-crimson">{n}</div>
      <div className="text-ink/70 text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

const rulesText = `Rules
─────
• 1 to 6 players take turns rolling a single die.
• Move your token forward by the dice value.
• Land on a Punya (ladder) → climb up.
• Land on a Paap (snake) → slide down.
• To win, you must land exactly on square 84 (Moksha).
• If your roll overshoots 84, you bounce back.

Players can be Human or Computer in any mix.`;
