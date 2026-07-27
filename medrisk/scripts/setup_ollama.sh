#!/usr/bin/env sh
set -eu
ORIGIN="${1:-}"
if [ -z "$ORIGIN" ]; then
  echo "Usage: $0 https://YOUR-ACCOUNT.github.io" >&2
  exit 1
fi
ollama pull qwen3:0.6b
launchctl setenv OLLAMA_ORIGINS "$ORIGIN"
echo "Configured Ollama for $ORIGIN. Quit and reopen Ollama."
