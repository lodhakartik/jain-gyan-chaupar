#!/usr/bin/env bash
# Speed-up every source recording in ../doha_audio/{Paap,Punya} by 1.5x
# (pitch-preserving) and write the result to ../public/audio/{paap,punya}.
# Run from anywhere: ./scripts/build-audio.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/doha_audio"
DST="$ROOT/public/audio"
SPEED="${SPEED:-1.5}"   # override with SPEED=1.7 ./scripts/build-audio.sh

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found — install it (e.g. 'brew install ffmpeg')" >&2
  exit 1
fi

process() {
  local kind="$1"             # Paap | Punya
  local out_kind="$2"         # paap | punya
  local in_dir="$SRC/$kind"
  local out_dir="$DST/$out_kind"
  mkdir -p "$out_dir"

  shopt -s nullglob
  local count=0
  for f in "$in_dir"/*.mp3 "$in_dir"/*.m4a "$in_dir"/*.wav; do
    local name="$(basename "$f")"
    local stem="${name%.*}"
    local out="$out_dir/${stem}.mp3"
    if [[ -f "$out" && "$out" -nt "$f" ]]; then
      echo "  skip (up-to-date): $name"
      continue
    fi
    echo "  encode: $name → ${stem}.mp3 @ ${SPEED}x"
    ffmpeg -y -hide_banner -loglevel error -i "$f" \
      -filter:a "atempo=${SPEED}" -vn -b:a 128k "$out"
    count=$((count+1))
  done
  echo "$kind: ${count} file(s) processed."
}

echo "Building doha audio (speed=${SPEED}x)..."
process Paap paap
process Punya punya
echo "Done. Output: $DST"
