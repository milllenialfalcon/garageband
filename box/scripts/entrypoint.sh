#!/usr/bin/env bash
# Container start: keep the T3 server running. Until first-run has installed T3,
# wait for it, then start serving on its own.
set -uo pipefail
export PATH="/opt/factory/bin:$HOME/.local/bin:/opt/npm-global/bin:$HOME/.cargo/bin:$HOME/.local/share/vite-plus/bin:$PATH"

# The home volume may arrive root-owned on first mount.
if [ "$(stat -c %U "$HOME")" != "factory" ]; then sudo chown -R factory:factory "$HOME"; fi
if [ "$(stat -c %U /workspace)" != "factory" ]; then sudo chown factory:factory /workspace; fi

mkdir -p "$HOME/.factory-box/logs"
log="$HOME/.factory-box/logs/t3-serve.log"

if ! command -v t3 >/dev/null 2>&1; then
  echo "Garageband box is up. T3 is not installed yet."
  echo "Run:  docker compose -f box/compose.yaml exec box first-run"
  until command -v t3 >/dev/null 2>&1; do sleep 10; hash -r; done
fi

echo "Starting T3 server on 0.0.0.0:${T3CODE_PORT:-3773} (log: $log)"
# Restart the server if it exits, with a short back-off, so a crash at 3am
# doesn't stop the sprint.
while true; do
  t3 serve --host 0.0.0.0 >>"$log" 2>&1
  code=$?
  echo "$(date -Is) t3 serve exited with $code; restarting in 10s" >>"$log"
  sleep 10
done
