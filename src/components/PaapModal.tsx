import { useGame } from "../store/gameStore";
import DohaAudio from "./DohaAudio";

export default function PaapModal() {
  const paap = useGame((s) => s.activePaap);
  const dismiss = useGame((s) => s.dismissPaap);

  if (!paap) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Paap doha"
        className="card relative w-full max-w-md p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-saffron text-[10px] sm:text-xs tracking-[0.3em] mb-2">
          PAAPSTHANAK
        </div>
        <div className="font-display text-2xl sm:text-3xl text-crimson font-bold mb-1">
          {paap.script ?? paap.label}
        </div>
        <div className="text-xs sm:text-sm text-ink/60 italic mb-4">
          {paap.label}
          {paap.hint ? ` — ${paap.hint}` : ""}
        </div>

        <DohaAudio src={paap.audio} accent="crimson" />

        {paap.doha && (
          <pre className="font-display whitespace-pre-wrap text-lg sm:text-2xl leading-loose text-ink mb-6 px-1">
            {paap.doha.replace(/, /g, ",\n")}
          </pre>
        )}

        <button
          onClick={dismiss}
          className="btn-primary w-full text-sm sm:text-base"
          autoFocus
        >
          आगे बढ़ें · Continue
        </button>
      </div>
    </div>
  );
}
