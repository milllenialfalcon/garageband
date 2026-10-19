# Start the Enigma build sprint

About 30 minutes of your time, once. After step 8 the sprint runs by itself until Sunday 25 October, 22:00, and you only talk to the Concierge when you want news.

**What it builds:** **Enigma**, your own harness app: T3 Code forked and turned into the Garageband factory (skills installed once for every tool, Hermes as a built-in provider, a live factory board, spend and safety controls). It lives in its own private repo, created by the agents in the first hour.

**What you'll have:** a Linux "factory box" in Docker Desktop running the T3 server and every agent tool. Your T3 desktop app connects to it like a second computer. Three threads run there: the **Chief** (Claude Opus) runs the work, **Relief** (Codex) takes over when Claude's allowance is resting, and the **Concierge** (GLM) answers your questions. **DeepSeek (through Hermes) builds every ticket.** Claude leads the backend work and Codex leads the frontend work: they write DeepSeek's instructions and check its work, so their allowances go on thinking, not typing. Trello board: https://trello.com/b/qjhCSnQQ/garageband-build

## Before you start
- Docker Desktop installed, using the WSL 2 engine (Settings → General).
- Give WSL enough memory: create or edit `%USERPROFILE%\.wslconfig` with these two lines, then run `wsl --shutdown` in PowerShell and restart Docker Desktop:
  ```
  [wsl2]
  memory=14GB
  ```
- **Stop the PC sleeping while it's plugged in** (Settings → System → Power → Screen and sleep → "Never" when plugged in). If the PC sleeps, the agents stop; they pick up again when it wakes.

## 1. Get the box files (PowerShell)
```powershell
cd D:\AI
git clone https://github.com/milllenialfalcon/Garageband.git garageband-box
cd garageband-box
git checkout sprint/track-a
copy box\box.env.example box\box.env
notepad box\box.env
```
In `box.env`, fill in your **OpenCode Go API key** (it lets the agents see how much of the plan is left). The Trello key and token are optional: with them the board updates itself every 2 hours. The board id is already filled in.

## 2. Build and start the box (10–15 minutes the first time)
```powershell
docker compose -f box/compose.yaml up -d --build
```

## 3. Set up inside the box
```powershell
docker compose -f box/compose.yaml exec -it box first-run
```
It installs T3 and Hermes, then walks you through logging in to GitHub, Claude, Codex, OpenCode (pick OpenCode Go) and Hermes. Each login prints a link: open it in your normal browser. For Hermes, the quickest route is copying your Windows settings in (first-run prints the two `docker cp` commands). At the end it prints a **pairing link**.

## 4. Connect your T3 desktop app
T3 desktop → **Settings → Connections → Add environment** → paste the pairing link, but change the address at the start to `http://127.0.0.1:3773`. Name it "Factory box".
If the desktop app won't accept it, open the same link (with `127.0.0.1:3773`) in Chrome instead: T3's web app works the same way, and you can retry the desktop app later.

## 5. Providers in the Factory box environment
T3 → **Settings → Providers**, with the Factory box environment selected:
- Claude, Codex and OpenCode should show as signed in. If one doesn't, press its **Sign in** button.
- OpenCode → **Environment variables** → add `OPENCODE_API_KEY` = your OpenCode Go key → **Refresh provider status**.
- **Add provider → Local ACP command**: executable `hermes`, one argument `acp`, display name `Hermes`. Refresh, and check its model list includes DeepSeek V4.1 Flash, MiMo V2.6 Flash, GLM 5.3 Flash, Kimi K3 and Muse Spark 1.3 (your OpenCode Go models; the docker cp commands from first-run copy your PC's Hermes setup).
- **Antigravity** (for Gemini 4 Argon on your AI Pro plan): enable it, let T3 install its runtime, then **Sign in** with your Google account. Because the box is a separate machine, the last Google page won't load: copy that page's full address (including everything after `?`) into T3's return-URL field and press **Continue**. Check Gemini 4 Argon is in its model list.
- **OpenCode**: check the free DeepSeek V4.1 Flash and GLM 5.3 Flash appear (used for research and the Concierge).

## 6. Smoke test
```powershell
docker compose -f box/compose.yaml exec box box-smoke
```
Everything should say PASS. Fix any failure before step 7. Hermes matters most: all the building runs through it.

## 7. Start the Chief
In T3, Factory box environment, **Garageband** project → new thread:
- Where: the project folder (**no new worktree**)
- Model: **Claude · Opus 5.5**
- Access: **Full access** (otherwise every agent stops to ask permission and the sprint stalls)
- Message:
  > You are the Chief for the Enigma build sprint, shift 1. Read /workspace/garageband/sprint/ORCHESTRATOR.md and start with section 1.

## 8. Check it started (10 minutes later)
Two more threads appear: **Relief** and **Concierge**. Say hello to the Concierge. That's it.

## 9. Optional: follow it from your phone
T3's phone app can show every thread, let you chat with the Concierge or the Chief, and send you a notification when an agent finishes, fails, needs approval or asks a question.
1. In PowerShell: `docker compose -f box/compose.yaml exec -it box t3 connect`. It prints a link and a short code; open the link on any device, check the code matches, and sign in. Say yes if it offers the background service.
2. Install the T3 Code app on your phone, sign in to the same T3 Connect account, and choose the Factory box environment.
3. In the app: **Settings → Notifications → Device Notifications** on (and Live Activity / Ongoing Agent Activity if you like).

T3 Connect reaches the box through T3's own tunnel service. T3 says its relay never receives your session token, but you are trusting T3's servers to broker the connection; skip this step if you'd rather not. Without it, the box stays reachable only from this PC.

## While it runs
- **Want news?** Ask the Concierge anything: "how far along are we?", "when will the Enigma installer build?", "what's Hermes doing?", "how much Claude is left this week?". It only reads; asking never slows the work.
- **Want to change something?** Tell the Concierge ("do B2 before B1", "the app name is …"). It passes your request to the Chief, who acts on it within the hour. Urgent: write in the Chief's thread directly.
- **Needs you:** the Concierge and the Trello "Needs you" list show the few decisions that are yours, each with what happens if you don't answer. Nothing waits for you.
- **Pause everything:** tell the Chief "pause the sprint", or stop the box: `docker compose -f box/compose.yaml stop`. Start again with `up -d`; the Chief carries on from the ledger.
- **Health check:** `docker compose -f box/compose.yaml exec box box-status`.

## What never happens without you
Nothing is merged into `main`, nothing is published, no repo is made public or deleted, nothing is bought. Agents merge only into the two sprint branches (`sprint/track-a`, `sprint/enigma`), and only after a different model has reviewed the work and the tests are green. At the end you get one pull request into `main` to look at, plus the final report.
