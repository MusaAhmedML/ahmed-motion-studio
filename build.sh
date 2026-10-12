#!/usr/bin/env bash
# Build every film: synthesise SFX first, then render video and mux the audio.
# Deterministic: same inputs produce a byte-identical MP4 every run.
set -u
cd "$(dirname "$0")"

FILMS=(
  "01-kinetic:38"
  "02-uimorph:9"
  "03-parallax:30"
  "04-character:30"
  "05-paper:34"
  "06-glide:30"
  "07-offer:26"
  "08-constellation:30"
)
FMT="${1:-9x16}"
ONLY="${2:-}"

mkdir -p out out/audio
START=$(date +%s)

for spec in "${FILMS[@]}"; do
  name="${spec%%:*}"; dur="${spec#*:}"
  if [ -n "$ONLY" ] && [ "$name" != "$ONLY" ]; then continue; fi

  wav="out/audio/${name}.wav"
  if [ ! -f "$wav" ]; then
    node sfx.mjs "films/${name}.js" "$wav" "$dur" || { echo "SFX FAIL $name"; continue; }
  fi

  out="out/${name}__${FMT}.mp4"
  if [ -f "$out" ] && [ "${FORCE:-0}" != "1" ]; then
    echo "[skip] $out exists"; continue
  fi

  echo "[build] $name ${FMT} ${dur}s"
  node render.mjs --film "$name" --fmt "$FMT" --dur "$dur" --sub 1 \
    --crf 16 --out "$out" --audio "$wav" 2>&1 \
    | grep -viE "favicon|^\[libx264|^ *i[0-9]|profile|kb/s|Press|frame=|deprecated" \
    | tail -2
done

echo "[build] total $(( $(date +%s) - START ))s"
ls -la out/*.mp4 2>/dev/null
