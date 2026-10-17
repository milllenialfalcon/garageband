# Relief for the Enigma build sprint

The Chief (Claude Opus) runs the sprint. Claude has a 5-hour and a weekly allowance; when it is resting, Relief keeps the line moving so the sprint never stops. Relief has two parts:

- **Relief watchdog**: GPT-6 Luna, a cheap hourly check. It never runs the line itself.
- **Relief orchestrator**: GPT-6.1 Sol, launched by the watchdog only while the Chief is out. It runs the line, then hands back and stops.

Paths are relative to `/workspace/garageband`. Never do anything in ORCHESTRATOR.md section 7.

## Watchdog thread start (Luna)
1. `list_scheduled_tasks`. If no task titled "Relief watchdog" is bound to this thread, `schedule_task` with `{type: "interval", everyMs: 3600000}`, title "Relief watchdog", bound to this thread, prompt: "Watchdog. Run sprint/RELIEF.md 'Each watchdog run'."
2. Run "Each watchdog run" once.

## Each watchdog run (Luna)
Keep it to a few tool calls.
1. `git -C .factory pull --rebase`, then read `.factory/chief-state.json`.
2. **Relief already active** (`threads.reliefActive` is set and that thread is running or idle with the lease): reply "Relief active" and stop.
3. **Launch the relief orchestrator** if either is true:
   - `lease.holder` is `relief` (the Chief handed over), or
   - the lease has expired (the Chief missed more than 90 minutes) **and** `t3_thread_read` on the Chief's thread (`lease.thread`) shows its latest run failed, or it is idle while tickets are in flight or ready.

   To launch: `t3_thread_launch` in this project, project root, full access, Codex · GPT-6.1 Sol, title "Relief (active)", message: "You are the relief orchestrator for the Enigma build sprint. Read /workspace/garageband/sprint/RELIEF.md and follow 'Relief orchestrator'." Record its id in `chief-state.json.threads.reliefActive` and save factory state.
4. Otherwise reply "Chief healthy" and stop.
5. If the Chief messages you, follow its message (it may hand over, or tell you the sprint is over: then delete your schedule and stop).

## Relief orchestrator (Sol)
1. **Lease.** If the lease has expired or is already yours, set `lease = {holder: "relief", thread: <your thread id>, until: now + 90 min}`, save, and write one line in `.factory/handoffs/` saying when and why you took over.
2. **Wake-ups.** `schedule_task` with `{type: "interval", everyMs: 3600000}`, title "Relief loop", bound to this thread, prompt: "Relief loop. Run sprint/RELIEF.md 'Relief orchestrator' step 3."
3. **Each loop**: run ORCHESTRATOR.md section 2 with these limits:
   - Use `sprint/TEAM.md` exactly as the Chief would, except that nothing goes to a Claude model while Claude is paused: no Opus, Sonnet or Haiku.
   - Backend and risky tickets wait for Sonnet's brief and review. You may still dispatch builds whose brief already exists, and gate their PRs with Luna; hold them for Sonnet's review.
   - Frontend tickets carry on fully: Sol briefs and reviews.
   - Heavy tickets carry on: you write the short brief (instead of Haiku), and GLM 5.3 Flash reviews.
   - Leave `chief`-lane tickets for the Chief. Escalation is allowed through attempts 4 (Kimi K3) and 5 (Gemini 4 Argon).
   - Read results of tasks the Chief started with `t3_thread_read` on their thread ids from `chief-state.json.tasks`.
   - Renew the lease (+90 min) every loop. Mark ledger builders with "(relief)" so the retro can compare.
   - Keep each loop under about 15 tool calls.
4. **Hand back.** At the start of each loop, check whether Claude is usable again: `node sprint/scripts/gb-quota.mjs` shows the Claude session window under 80%, or the time in `chief-state.json.paused.claude` has passed. If it is, or if the Chief messages you to release the lease:
   - finish this loop and write a handoff saying what you did and what's in flight, with ids;
   - set `lease.holder = "chief"`, `lease.until = now`, and `threads.reliefActive = null`, then save;
   - wake the Chief: re-enable its heartbeat with `update_scheduled_task` (enabled true) and then `run_scheduled_task_now`. If its thread is gone, `t3_thread_launch` a new Chief (Claude · Opus 5.5, project root, full access, title "Chief (after relief)", message: "You are the Chief for the Enigma build sprint. Read /workspace/garageband/sprint/ORCHESTRATOR.md and start with section 1.");
   - delete your "Relief loop" schedule and stop.
