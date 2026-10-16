# Garageband factory box

A Docker container that runs the T3 Code server and every agent tool (Claude Code, Codex, OpenCode, Hermes) for unattended factory runs. Your T3 desktop app connects to it as a remote environment.

- **Set up:** follow [`sprint/START-HERE.md`](../sprint/START-HERE.md).
- **What's inside:** Ubuntu 24.04, Node 24, git, GitHub CLI, Python, Rust (for T3 builds), browser libraries for Playwright, the three npm-installed agent CLIs; T3 (nightly) and Hermes are installed by `first-run` into the persistent home volume so `t3 update` works.
- **Volumes:** `home` keeps logins, T3 state and Hermes; `workspace` keeps the repositories. Rebuilding the image keeps both.
- **Network:** T3 is published only on `127.0.0.1:3773` of your PC.
- **Push guard:** a git wrapper (`/opt/factory/bin/git`) runs `githooks/pre-push` on every push from any tool: no pushes to `main`/`master`/`production`/`release/*`, no force pushes or deletes except on ticket branches (`t/...`), and no `--no-verify`. It's a safety net for agents, not a security boundary.

| Command (from the repo folder) | Does |
|---|---|
| `docker compose -f box/compose.yaml up -d --build` | Build and start |
| `docker compose -f box/compose.yaml exec -it box first-run` | Installs and logins (safe to re-run) |
| `docker compose -f box/compose.yaml exec box box-smoke` | Checks every tool answers and the guard works |
| `docker compose -f box/compose.yaml exec box box-status` | Server, disk, memory, agent processes |
| `docker compose -f box/compose.yaml exec -it box bash` | A shell inside |
| `docker compose -f box/compose.yaml stop` | Stop (agents stop too) |
