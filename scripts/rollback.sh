#!/usr/bin/env bash
# Alias of scripts/promote.sh: moving v3/latest to a pinned version is the same operation in both directions.
exec "$(dirname "$0")/promote.sh" "$@"
