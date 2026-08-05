#!/bin/bash
# Installs dependencies in Claude Code cloud sessions only.
# CLAUDE_CODE_REMOTE is "true" on the cloud VM and never true locally,
# so this is a no-op on the laptop where node_modules already exists.

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

if [ -d node_modules ]; then
  exit 0
fi

npm ci || npm install
exit 0
