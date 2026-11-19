
#!/usr/bin/env bash
set -euo pipefail

EPISODE="${1:-1}"
STYLE="${2:-story}"

echo "Starting Riddle Town..."
echo "Episode: $EPISODE"
echo "Style: $STYLE"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ERROR: FFmpeg is missing."
  exit 1
fi

if ! command -v espeak-ng >/dev/null 2>&1; then
  echo "ERROR: espeak-ng is missing."
  exit 1
fi

npm run render -- "$EPISODE" "$STYLE"

echo "SUCCESS: Video rendering finished!"
