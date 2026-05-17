import { useEffect, useRef, useState } from "react";

// Plays the recorded doha for a paap/punya. Auto-plays once when the modal
// opens; the button lets the player replay or stop it. Unmounting (modal
// dismissal) stops playback so the audio never outlives the modal.
export default function DohaAudio({
  src,
  accent = "crimson",
}: {
  src?: string;
  accent?: "crimson" | "moss";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audioRef.current = audio;
    const onEnd = () => setPlaying(false);
    audio.addEventListener("ended", onEnd);
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setBlocked(true));
    return () => {
      audio.removeEventListener("ended", onEnd);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src]);

  if (!src) return null;

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.currentTime = 0;
      a.play()
        .then(() => {
          setPlaying(true);
          setBlocked(false);
        })
        .catch(() => setBlocked(true));
    }
  };

  const ring =
    accent === "moss" ? "border-moss text-moss" : "border-crimson text-crimson";

  return (
    <button
      type="button"
      onClick={toggle}
      className={`mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold bg-parchment/70 hover:bg-parchment ${ring}`}
    >
      <span aria-hidden>{playing ? "⏸" : "▶"}</span>
      <span>
        {playing
          ? "रुकें · Pause"
          : blocked
          ? "▶ सुनें · Listen"
          : "फिर से सुनें · Replay"}
      </span>
    </button>
  );
}
