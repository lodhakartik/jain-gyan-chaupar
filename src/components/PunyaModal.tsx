import { useGame } from "../store/gameStore";
import DohaAudio from "./DohaAudio";

export default function PunyaModal() {
  const punya = useGame((s) => s.activePunya);
  const dismiss = useGame((s) => s.dismissPunya);

  if (!punya) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4"
      onClick={dismiss}
    >
      <div
        className="card relative w-full max-w-md p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-moss text-[10px] sm:text-xs tracking-[0.3em] mb-2">
          PUNYA
        </div>
        <div className="font-display text-2xl sm:text-3xl text-moss font-bold mb-1">
          {punya.script ?? punya.label}
        </div>
        <div className="text-xs sm:text-sm text-ink/60 italic mb-4">
          {punya.label}
          {punya.hint ? ` — ${punya.hint}` : ""}
        </div>

        <DohaAudio src={punya.audio} accent="moss" />

        {punya.doha && (
          <pre className="font-display whitespace-pre-wrap text-lg sm:text-2xl leading-loose text-ink mb-6 px-1">
            {punya.doha.replace(/, /g, ",\n")}
          </pre>
        )}

        <button
          onClick={dismiss}
          className="btn-secondary w-full text-sm sm:text-base"
          autoFocus
        >
          आगे बढ़ें · Continue
        </button>
      </div>
    </div>
  );
}
