# 04 - Constraints, Guardrails and Safe Autonomy

Scope: the "Constraints, Guardrails & Safe Autonomy" section of `ahe/README.md` (lines 86-106), 10 resources.
Garageband status is judged from `CONTEXT.md` only. I did not open the Garageband repo itself, so every "Garageband today" call is a reading of that file, not a check of the code.

Quote provenance:
- **Exact**: text I read directly from a cloned repo file or the README in the clone.
- **Summary-quoted**: the article was fetched through WebFetch, which returns a model-written summary. Quoted fragments are as the fetch returned them and may not be verbatim. Treat them as pointers, and check the original before quoting it anywhere.

Status key: **yes** = already there, **partly** = some of it, **no** = absent, **planned** = named in Track B only.

---

## Part 1. Resource by resource

### R1. Code execution with MCP (Anthropic engineering)
- URL: https://www.anthropic.com/engineering/code-execution-with-mcp (summary-quoted)
- What it is: an argument that agents should call tools through code they can inspect, with intermediate data kept in the execution environment instead of passing through the model.
- Key ideas:
  1. Tool definitions loaded up front and every intermediate result passing through the model are the main cost. The article's example cuts tokens from about 150,000 to 2,000.
  2. Progressive disclosure: each tool becomes a file, and the agent reads only the definitions it needs.
  3. Filter and aggregate in code before the model sees anything ("only sees what you explicitly log or return").
  4. PII tokenisation at the client boundary (`[EMAIL_1]` placeholders, restored at tool-call time).
  5. The article names sandboxing, resource limits and monitoring as requirements for agent-generated code, and says these add operational overhead.
- Mechanisms worth copying: progressive disclosure of skills and tools (load a skill's SKILL.md only when the station needs it); summarise long logs into the Chief's context instead of pasting them.
- Garageband today: **partly**. The 37 skills are plain text loaded per station, which is already progressive. Nothing in CONTEXT.md says tool output is capped or summarised before reaching the Chief.
- Recommended change: **sprint ticket**. Cap the size of `task_status` and `t3_thread_read` results the Chief receives (summary plus pointer to the full log). Track B: put the cap in the orchestration MCP server, not in prompts.

### R2. Writing effective tools for agents (Anthropic engineering)
- URL: https://www.anthropic.com/engineering/writing-tools-for-agents (summary-quoted)
- What it is: guidance on tool interfaces that models call correctly and safely.
- Key ideas:
  1. Unambiguous parameter names (`user_id`, not `user`).
  2. Namespacing by service and resource so related tools are easy to tell apart.
  3. Cap tool responses. The article gives one figure: Claude Code limits tool responses to 25,000 tokens by default. Truncation should steer the agent toward narrower queries.
  4. Error messages that tell the agent how to fix the call.
  5. Fewer, purpose-built tools rather than one tool per endpoint ("More tools don't always lead to better outcomes").
  6. Evaluate tools on realistic multi-step tasks with verifiable outcomes.
- Mechanisms worth copying: error text from `delegate_task` and the T3 tools should say what to change (missing field X, unknown station Y), and the Chief's loop should use those errors instead of retrying the same call.
- Garageband today: **partly**. The orchestration toolset is small and named clearly (delegate_task, task_status, t3_thread_*, schedule_task, request_secret). Error-message quality and response caps are not described in CONTEXT.md.
- Recommended change: **sprint ticket** to audit the error strings and response sizes of the seven orchestration tools, with a short eval (one scripted delegation that fails in each way).

### R3. mcp-guardian (S1LV3RJ1NX) - MCP proxy with scope allow/block lists
- URL: https://github.com/S1LV3RJ1NX/mcp-guardian (cloned at `ahe-study/src/mcp-guardian`; read README, `src/mcp_guardian/proxy.py`, `audit.py`, `config.py`)
- What it is: a proxy that puts three meta-tools (`search_tools`, `get_schema`, `execute_tool`) in front of upstream MCP servers, with per-scope allowed and blocked tool lists and a JSONL audit log. The README says it was presented at MCP Dev Summit Bengaluru, June 2026.
- Key ideas:
  1. Scopes: a named scope (e.g. `support-agent`) lists allowed tools per upstream server, and `"*"` plus `blocked_tools` for broad scopes.
  2. Enforcement sits in `execute_tool`: a tool not in the active scope's index returns `TOOL_NOT_IN_SCOPE` and is never forwarded. Hiding a tool from discovery is not the security control; the execute-time lookup is.
  3. Every call is logged to an append-only JSONL file before it is forwarded, and the result (ok / error / auth_required, with duration) is logged after.
  4. Progressive discovery cuts context from about 160k tokens to about 456 (the README's own figure, 99.7%).
  5. Auth is per upstream and resolved from env or the dashboard, not from the agent.
- Exact quote (README): "Tool '{tool_name}' not found in scope '{self.config.active_scope}'." and "`include_params: true`" in the audit block, which writes the full parameters to the log.
- Caveat I found: the audit logger writes raw params by default, so anything secret-shaped sent as a parameter lands in the log in clear text. There is no redaction step in `audit.py` (I read the file). There is also no rate limiting or call-count cap in the source (a grep for rate limit in `src/` returned nothing), so a runaway agent can call tools without a ceiling through this proxy.
- Garageband today: **partly**. Read-only Concierge and "Chief merges only into sprint branches" are scope rules, but they are enforced by convention in CONTEXT.md, not by a tool-level allowlist. Audit exists as the factory ledger on a git branch; redaction is not described.
- Recommended change: **Track B guard layer (B6 safety)**. Define a per-role scope file for the orchestration MCP server: Builder gets read, edit and test tools; Reviewer gets read only; Chief gets delegate and merge-into-sprint; Concierge stays read-only; `request_secret` and schedule tools are Chief-only. Add a redaction filter to the audit writer. Borrow the pattern, not the package (it is young and I did not run it).

### R4. Beyond permission prompts: Claude Code sandboxing (Anthropic engineering)
- URL: https://www.anthropic.com/engineering/claude-code-sandboxing (summary-quoted)
- What it is: Anthropic's account of replacing per-action approval prompts with OS-level sandboxing that has both filesystem and network limits.
- Key ideas:
  1. Approval fatigue is a safety problem: constant prompts make people approve without looking.
  2. Filesystem: writes are allowed in the working directory and blocked elsewhere. This stops a prompt-injected agent from changing system files.
  3. Network: traffic leaves the sandbox only through a proxy outside it, which allows known domains and asks before new ones.
  4. Enforcement is OS-level (bubblewrap on Linux, seatbelt on macOS) and covers subprocesses and scripts, not only the agent's direct calls.
  5. The article says "effective sandboxing requires both filesystem and network isolation" and gives the failure case of each missing half (no network limit: SSH keys can be stolen; no filesystem limit: the agent can escape and reach the network).
  6. Credentials are kept outside the sandbox, so a compromised process has less to take. The reported figure is an 84% reduction in permission prompts internally.
- Garageband today: **partly**. The factory box is a Docker container (CONTEXT.md), which gives filesystem isolation of a sort. CONTEXT.md does not mention egress limits, and the box runs all provider CLIs and holds their keys (see Part 3, risk 2).
- Recommended change: **box push guard plus Track B guard**. Add an egress allowlist for the box (model APIs, GitHub, package registries) and mount each provider's key only to the provider that needs it. This also removes most approval prompts in unattended runs, which matters for R3-style stalls (Part 3, risk 5).

### R5. Mitigating prompt injection in software agents (OpenHands)
- URL: https://openhands.dev/blog/mitigating-prompt-injection-attacks-in-software-agents (summary-quoted)
- What it is: a practitioner survey of defences: confirmation mode, a security analyser, container sandboxing and hard network policy.
- Key ideas:
  1. Confirmation mode is called a stopgap. It slows the agent without adding much security.
  2. A security analyser checks each intended action for threats and can stop, ask, or refuse. The article reports this was built with Invariant Labs.
  3. Each conversation runs in its own Docker container, but secrets, source code and `curl` remain reachable inside it. The article says this openly.
  4. Hard policies: network policy or eBPF to block `curl` or specific hosts; "The principle of least privilege is at least as important for agents as it is for humans."
  5. The LLM's own refusal is a soft defence: "We're relying on the fuzzy, non-deterministic behavior of an LLM to prevent the attack above."
- Garageband today: **partly**. Different-model review is a useful soft check. The box is a container. No content-level injection defence is described: nothing says fetched web pages or ticket text are treated as untrusted, and research agents (free models) can read the open web.
- Recommended change: **AGENTS.md + sprint ticket**. Add a rule to AGENTS.md: text from web pages, issues, PR comments and third-party READMEs is data, never instructions. Research or read-the-web steps get no write, merge or secret tools (enforced by the role scope in R3, not by the prompt). A Claude Code guard hook can flag Bash commands that pipe fetched content into a shell.

### R6. APort Agent Guardrails (aporthq)
- URL: https://github.com/aporthq/aport-agent-guardrails (cloned; read README, `docs/SECURITY_MODEL.md`, `hooks/`, `bin/aport-claude-code-hook.sh`, `bin/lib/command-hook-adapter.sh`)
- What it is: deterministic pre-action authorization. A hook runs before each tool call, evaluates it against a "passport" (policy), and denies or allows. Adapters exist for Claude Code, Cursor, Codex, Gemini and others. It also ships a GitHub repository guard action. The README's CTF figures (0 of 879 restrictive-level breaches) are the vendor's own claim and I did not verify them.
- Key ideas:
  1. Pre-action hooks run in the host, so the agent cannot skip them by prompt. Exact (SECURITY_MODEL.md): "APort enforcement runs in the platform hook, not the prompt" and "Agent cannot bypass this by prompt."
  2. Fail-closed by default: empty or unknown tool input is denied (`oap.unknown_tool`, `oap.missing_required_context`), and a runtime error in the hook is denied, not allowed.
  3. Per-tool limits: allowed commands, blocked patterns (`rm -rf`, `sudo`, `chmod 777`, `nc`, `find -exec rm`), file read and write paths, max execution time, MCP server and tool allowlists.
  4. A decision log for every evaluation.
  5. Most useful for this study: the document states what the policy does not see. Exact (SECURITY_MODEL.md): "`cat .env`, `cp ~/.ssh/id_rsa /tmp/k` and `echo secret > out.txt` are never checked against `data.file.read` or `data.file.write` limits." Also: "'No push to main' is not something the local Bash policy can enforce; use GitHub Repository Guard or a branch ruleset." And: "curl https://example.com is not checked against web.fetch domain limits."
  6. The doc's own recommendation for unattended agents: pair per-tool policy with a sandbox or container, and a GitHub ruleset or branch protection.
- Garageband today: **partly**. The Claude Code guard hook and the pre-push guard exist. CONTEXT.md does not say whether the guard hook matches shell commands or only the file tools. If it only covers Read, Write and Edit, it has exactly the gap APort describes.
- Recommended change: **guard hook (Claude Code and each provider)**. Check the guard hook for shell coverage. Add blocked patterns for `git push` to protected branches, `rm -rf`, `sudo`, `curl`/`wget` to hosts outside the allowlist, and reads of `.env`, `~/.ssh`, `~/.netrc`, `~/.npmrc`. Add a GitHub branch ruleset on `main` and on sprint branches so a push that passes the string check still cannot land. Their default list of "not covered by default" secret files is a good starting point.

### R7. Lurkr (agentveil-protocol) - static CI scanner for agent capability risk
- URL: https://github.com/agentveil-protocol/lurkr (cloned; read README, `docs/LURKR_LIMITATIONS.md`, `src/lurkr/rules/` file list)
- What it is: a local, read-only scanner, run in CI before deploy, that flags risky agent capability surfaces in a repo (not in a running agent). Reports are redacted. It does not execute the code it scans.
- Key ideas:
  1. Rules that matter here: `agent.credential_to_llm_context` (secrets reaching the model), `agent.python_tool_without_approval` and `tool.shell_without_approval` (tools that run without a gate), `agent.unverified_mcp_endpoint`, `agent.dynamic_prompt_from_user_input` (prompt injection surface), `workflow.deploy_without_approval`, `workflow.pull_request_target_secrets_risk`, `bypass.direct_github_token`, `identity.private_key_unencrypted`.
  2. Baseline mode: `--save-baseline` then `--baseline ... --fail-on high`, so CI fails only on new findings. This is the practical way to add a gate to an existing repo.
  3. Exact (LIMITATIONS): "False negatives are expected by design. A finding that Lurkr does not report is not a proof that a repository has no risky capability surface."
  4. Prioritises confidence over recall: a clean result is not a safety claim.
  5. The v0.4.0 rule for FastAPI/Starlette BadHost (CVE-2026-48710) shows the rule set moves with the ecosystem.
- Garageband today: **partly**. CI quality gates and slop-lint exist for design and accessibility. There is no capability scan for the apps the factory builds, which is the product. Given Garageband is an app factory, generated apps that call LLMs with secrets in context or run shell tools without approval would pass today's gates.
- Recommended change: **CI gate (add to the factory's CI quality gates)**. Run lurkr with a baseline on every generated app before the release station, with `--fail-on high`. Treat it as a floor, not a clearance. Add the rule IDs to the release checklist so a reviewer knows what was and was not checked.

### R8. HEAAL and AIL (hyun06000) - language-enforced harness
- URL: https://github.com/hyun06000/AIL (cloned; read README, `CLAUDE.md`, `docs/HEAAL.md` in Korean)
- What it is: a philosophy (HEAAL, "Harness Engineering As A Language") and a language concept (AIL) in which forbidden actions are made inexpressible or unrunnable by the grammar and runtime. The README says the repo is "Concept stage — honestly": no grammar, parser or runtime exists yet.
- Key ideas:
  1. Split all safety into recommendation (prompts, lint warnings, review) versus enforcement (parser rejection, type failure, runtime block, permission denial). The doc's table says recommendations are "silently violated" and enforcement has "no failure mode."
  2. Exact (README, English): "make it *inexpressible or unrunnable* through the language's grammar, parser, and runtime."
  3. A program must declare purpose, observable success criteria and what is forbidden. "A program missing any of the three does not parse."
  4. The gap they target: outside-language harnesses (permissions, sandboxes, CI) "don't understand what the program intends".
- Garageband today: **partly**. A sprint ticket already has a template, and station gates exist. CONTEXT.md does not say the ticket is machine-checked for success criteria or a forbidden list.
- Recommended change: **ticket template plus Track B**. Do not adopt the language (it does not exist). Borrow the contract: `delegate_task` refuses a ticket that lacks success criteria, a "Forbidden" list, a budget and allowed paths. This is a small validator, and it turns "the ticket says don't touch X" into something that can be checked before a worker starts.

### R9. Spend rails for autonomous agents (joeyycli, agent-ops-kit guide)
- URL: https://joeyycli.github.io/agent-ops-kit-guide/docs/spend-rails-for-autonomous-agents.html (summary-quoted)
- What it is: a short pattern for giving a scheduled agent spending authority with fixed limits. The page sells a paid kit, so its claims are a practitioner's view and not independently tested.
- Key ideas:
  1. Three numbers set in advance: a per-transaction autonomy line (spend and log below it), an escalation threshold (stop and ask at or above it, and for any recurring charge), and a lifetime ceiling only a human can raise, in writing.
  2. "The gap between rule 1 and rule 3 is where autonomy actually lives."
  3. Sub-caps for categories that can compound (their example: an ads budget of $50 lifetime).
  4. A raise request must state the exact amount and the realised return from the ledger. Projections do not count. "Silence means no."
  5. Enforcement is a ledger, not the model's judgement. "an invented number poisons every decision made after it." Record every transaction when learned of.
  6. "Stop and ask" is enforced by the session runner, and the agent works on other tasks while it waits.
- Garageband today: **no** for model spend. CONTEXT.md lists spend caps as Track B B6 and does not describe any current per-run or per-day ceiling. Relief covers quota exhaustion, which is a different thing: it keeps the factory running, it does not limit cost.
- Recommended change: **Track B B6 (spend caps), and bring it forward**. Concretely:
  - a per-ticket budget in tokens or dollars, written into the ticket (the autonomy line);
  - a Chief-level escalation to the needs-you queue at a threshold, and for any new provider or new model tier;
  - a hard daily and weekly ceiling that only the founder can raise, held in the box config and not in the Chief's prompt;
  - a spend ledger built from provider billing or CLI usage output, not from the agent's own estimate.

### R10. Distributed retry patterns (loopandretry)
- URL: https://loopandretry.github.io/posts/fleet-retry-patterns/ (summary-quoted)
- What it is: practitioner guidance on bounding retries across a fleet of workers, not one call.
- Key ideas:
  1. Core claim: "a per-step retry cap bounds a step, never a run and never a fleet." Limits have to sit above single calls.
  2. Fleet-wide retry budget: a token bucket shared by all workers, where each success adds 0.1 tokens and each retry spends 1, with refill of 1 per second (as the article describes it). Retries stop by themselves when a dependency breaks.
  3. Circuit breaker shared across the fleet: default threshold 5 failures, cooldown 30 seconds, one probe after cooldown. Sharing it means one worker's failures protect the rest.
  4. Decorrelated jitter: `min(cap, random.uniform(base, prev * 3))` with base 0.5 and cap 30 (seconds). Without jitter, workers "retry in synchronized waves".
  5. Poison quarantine: after a bounded number of attempts, move the item to a dead-letter queue, and classify errors first ("Retryability is a property of the specific error").
  6. Note: the article does not cover idempotency in the sense I expected. I did not treat that as a gap in my reading; I mark it as not covered.
- Garageband today: **partly**. Escalation after 3 failed attempts is a per-ticket cap, which is exactly the "per-step, not per-fleet" case the article warns about. There is no fleet-wide budget and no per-provider breaker in CONTEXT.md. Track B lists a circuit breaker.
- Recommended change: **Track B B6 circuit breaker, plus a sprint ticket**. Per-provider breaker: after N failures from one provider (e.g. DeepSeek via Hermes) in a window, stop routing to it, put the ticket in the needs-you queue, and try the Relief provider. Add a fleet-wide cap on retries per wake. Add error classification (quota, auth, transient, permanent) so a quota error goes to Relief and a permanent error goes to quarantine, not to another retry.

---

## Part 2. Top 8 recommendations, ranked by value

1. **Hard model-spend ceiling with a ledger (R9, R3-style budget).** Per-ticket budget, escalation threshold, daily and weekly ceiling only the founder can raise, ledger from billing data. Track B B6, but move it ahead of any further unattended runs.
2. **Shell-aware guard plus GitHub branch rulesets (R6, R3).** Extend the Claude Code guard hook to Bash (blocked patterns, secret-file reads, unknown-host fetches), and add a GitHub ruleset so no sprint or main push lands regardless of the local hook.
3. **Egress allowlist and per-provider key scoping for the factory box (R4, R5).** The box holds all provider keys and open internet access (inferred from CONTEXT.md). Limit outbound hosts and mount each key only to its provider.
4. **Per-provider circuit breaker and fleet retry budget (R10).** Stops the same failing provider being retried on every hourly wake. Errors classified as quota, auth, transient or permanent.
5. **No-stall rule for unattended runs (R4, R3).** Any approval request in an unattended run is auto-denied and written to the needs-you queue with the exact command, instead of waiting. Pair with the allowlist from item 3 to cut prompts.
6. **Role-scoped tool allowlists on the orchestration MCP server, plus audit redaction (R3, R2).** Builder, Reviewer, Chief and Concierge each get a named tool list enforced at execute time. Audit writer redacts secret-shaped fields.
7. **Ticket as a checked contract (R8, R5).** `delegate_task` refuses tickets missing success criteria, a Forbidden list, a budget and allowed paths. Research steps get no write, merge or secret tools; fetched text is marked untrusted in AGENTS.md.
8. **Capability scan in the factory's release gate (R7).** Run lurkr with a baseline on every generated app before release, and record which rule IDs were checked.

**Risks the sprint currently carries (my reading, mostly inferred):**
- No model-spend ceiling is described. An hourly Chief running a top-tier model across several tickets has no stated upper bound (inferred, from CONTEXT.md silence plus B6 being planned).
- One box holds all provider keys and probably has open egress. A compromised or prompt-injected free model with build access can reach every key (inferred).
- Local guard hooks may cover file tools only. APort's own docs say shell reads, writes and network calls are not seen by a string-matching policy (verify the Garageband hook).
- Escalation is per ticket, not per provider. If one provider or the quota breaks, several tickets retry against it in each wake (partly inferred from the 3-attempt rule).
- Unattended runs can stall on an approval prompt rather than fail, which uses up wake slots without showing up as an error (inferred).
- Generated apps ship without any capability scan (CONTEXT.md lists only design and accessibility lint).

---

## Part 3. Recommendation-to-change map (where each change lands)

| # | Change | Where it lands | Source |
|---|---|---|---|
| 1 | Spend ceiling, per-ticket budget, ledger | Track B B6 (pull forward); box config | R9 |
| 2 | Bash coverage in guard hook; GitHub branch ruleset | guard hook; box push guard; GitHub settings | R6 |
| 3 | Egress allowlist; per-provider key mounts | box (Docker config); Track B guard layer | R4, R5 |
| 4 | Per-provider circuit breaker; retry budget; error classes | Track B B6; orchestration MCP | R10 |
| 5 | Auto-deny approvals in unattended runs; needs-you entry | sprint ticket; guard hook; Chief loop | R4 |
| 6 | Role scope lists; audit redaction | orchestration MCP server; Track B audit log | R3 |
| 7 | Ticket validator; untrusted-text rule; research step with no write tools | ticket template; AGENTS.md; orchestration MCP | R8, R5 |
| 8 | Lurkr baseline in release gate | CI quality gates | R7 |

---

## Part 4. What I could not open or verify

- **Garageband repo and CONTEXT.md detail**: I did not open the Garageband repo (github.com/milllenialfalcone/Garageband). Every status call above rests on CONTEXT.md. Items marked "partly" or "no" need a check of the actual guard hook, pre-push guard, AGENTS.md and the orchestration MCP server before anyone acts on them.
- **Anthropic articles (R1, R2, R4)**: fetched through WebFetch summaries. I could not read the full pages. Quotes are as returned by the fetch and may not be verbatim.
- **OpenHands, joeyycli, loopandretry (R5, R9, R10)**: also summary-quoted. The joeyycli page sells a paid kit whose internals I could not see. The loopandretry numbers are its own worked examples, not measurements I could repeat.
- **APort's CTF results and "0 breaches"**: vendor claim, not checked.
- **mcp-guardian, APort, lurkr, AIL**: I read the README and selected source and docs with `cat`/`grep`/`sed`. I did not run any of them, install them, or run their tests, per the brief.
- **lurkr rule behaviour**: I read rule names and the limitations doc; I did not run the scanner against anything.
- **HEAAL**: read the Korean doc only at the opening section; the translation in this note is mine.
- **Idempotency** (R10): the article does not cover it, and I did not find another source in this slice.
- **Spend-rails "kit" internals**: not available.
- **Live factory state**: no check of the box, its config, its keys or its egress rules. Those risks are inferred.

---

## Summary

Ten resources read; four GitHub repos cloned and read at README and source level; six articles read through WebFetch summaries.
Most useful for us: APort's list of what a shell-string policy cannot see, mcp-guardian's execute-time scope check with audit, and the spend-rails and fleet-retry patterns that map directly onto Track B B6.
The biggest unbounded risks in the sprint are model spend (no ceiling described), one box holding every provider key with probable open egress, and guard hooks that may not cover Bash.
Top change to pull forward: a hard spend ceiling with a billing-derived ledger, then a Bash-aware guard with GitHub branch rulesets.
Full report: /tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe-study/04-guardrails.md
