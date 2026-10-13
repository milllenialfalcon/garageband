#!/usr/bin/env bash
# Garageband guard for Claude Code (PreToolUse on Bash).
# Reads the tool call JSON on stdin. Exit 2 blocks the command and shows the reason to the agent.
# This is a safety net, not a security boundary: branch protection and CI are the real gates.
input="$(cat)"

block() {
  echo "garageband guard: blocked. $1 If this is truly intended, it is a Founder Call: ask the founder to run it themselves." >&2
  exit 2
}

# Collapse whitespace so spacing tricks don't slip through
cmd="$(printf '%s' "$input" | tr -s '[:space:]' ' ')"

# Git: pushing to protected branches, force pushes, history and work destruction
printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? push[^"]*(--force|-f( |")|--force-with-lease|\+[a-zA-Z/]*:?)' \
  && block "Force push rewrites shared history."
printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? push[^"]* (origin|upstream) (HEAD:)?(main|master|production)( |"|$)' \
  && block "Direct push to main. Open a pull request instead."
printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? reset --hard' \
  && block "git reset --hard throws away uncommitted work."
printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? clean -[a-zA-Z]*f' \
  && block "git clean -f deletes untracked files permanently."
printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? branch -D ' \
  && block "Force-deleting a branch can lose unmerged work."
printf '%s' "$cmd" | grep -Eq 'git( -C [^ ]+)? (checkout|restore) (-- )?\.( |"|$)' \
  && block "Discarding all local changes."
printf '%s' "$cmd" | grep -Eq 'gh pr merge|gh api [^"]*/merge' \
  && block "Agents never merge pull requests. The founder merges."

# Filesystem destruction
printf '%s' "$cmd" | grep -Eq 'rm -[a-zA-Z]*r[a-zA-Z]*f?[a-zA-Z]* +(/|~|\$HOME|\*|\.)( |"|$)|rm -[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]* +(/|~|\$HOME|\*|\.)( |"|$)' \
  && block "Recursive delete of a root, home or whole working directory."

# Databases
printf '%s' "$cmd" | grep -Eiq '(drop (table|database|schema)|truncate table)' \
  && block "Destroying database tables. Use safe-migration with a backup and rollback."
printf '%s' "$cmd" | grep -Eiq 'prisma migrate reset|prisma db push --force-reset|supabase db reset --linked' \
  && block "Resetting a database wipes its data."

# Secrets leaving the machine
printf '%s' "$cmd" | grep -Eq '(cat|less|more|head|tail) [^"|]*\.env([^.a-z]|$)[^"]*\| *(curl|nc|wget)' \
  && block "Piping secrets to a network command."

exit 0
