#!/usr/bin/env bash
# Garageband worktree setup. Run inside any new git worktree of the project, for example the
# worktree T3 Code (or another tool) creates for a thread. It links the shared factory state
# (.factory/, the factory-state branch checked out in the main folder) into this worktree, so
# every agent reads and writes the same ledger, tickets and briefs.
#
# Usage: bash scripts/gb-worktree-setup.sh
# Safe to run more than once, and does nothing in the main folder itself.
set -euo pipefail

here="$(git rev-parse --show-toplevel)"
main="$(git worktree list --porcelain | sed -n 's/^worktree //p' | head -n 1)"

if [ "$here" = "$main" ]; then
  echo "garageband: this is the main folder; .factory is already here."
  exit 0
fi

if [ -L "$here/.factory" ]; then
  echo "garageband: .factory already linked -> $(readlink "$here/.factory")"
elif [ -e "$here/.factory" ]; then
  echo "garageband: $here/.factory exists and isn't a link; left as is." >&2
  exit 1
elif [ -d "$main/.factory" ]; then
  ln -s "$main/.factory" "$here/.factory"
  echo "garageband: linked .factory -> $main/.factory"
else
  echo "garageband: no .factory in the main folder ($main). Run project-bootstrap there first." >&2
  exit 1
fi

# Worktrees share the repository's git config, but set it anyway in case this repo was cloned without it.
git config core.hooksPath .githooks
