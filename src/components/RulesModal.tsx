import { useEffect } from "react";

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

const rules: { icon: string; text: React.ReactNode }[] = [
  { icon: "🎲", text: "1 to 6 players take turns rolling a single die." },
  {
    icon: "🪜",
    text: (
      <>
        Land on a <strong>Punya</strong> (ladder) — climb up the path of merit.
      </>
    ),
  },
  {
    icon: "🐍",
    text: (
      <>
        Land on a <strong>Paap</strong> (snake) — slide down the karma you carry.
      </>
    ),
  },
  {
    icon: "🌸",
    text: (
      <>
        Reach square <strong>84 (Moksha)</strong> exactly to win. Overshooting bounces you back.
      </>
    ),
  },
  {
    icon: "↩️",
    text: "Each turn, the active player's token glows. The game saves your dice and event log on the right.",
  },
  {
    icon: "👥",
    text: "Players can be Human or Computer in any mix — pick on the next screen.",
  },
];

export default function RulesModal({ open, onClose }: RulesModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How to Play"
        className="card max-w-lg w-[92vw] max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-3xl text-crimson">How to Play</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-11 h-11 -mr-2 -mt-2 rounded-full text-ink/70 hover:bg-ink/10 active:scale-95 transition text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="mt-2 text-ink/70">
          84 Jeev Yoni reimagines Snakes &amp; Ladders as a Jain spiritual journey.
        </p>

        <ul className="mt-5 space-y-3">
          {rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xl leading-7 shrink-0" aria-hidden="true">
                {rule.icon}
              </span>
              <span className="text-ink/85">{rule.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button className="btn-primary min-h-[44px]" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
