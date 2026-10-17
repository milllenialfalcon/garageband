# 03. Context, Memory and Working State

Scope: the "Context, Memory & Working State" section of `ahe/README.md` (lines 66-85), 12 resources. Gap status is judged against `CONTEXT.md` only. I did not open the Garageband repo, so every "no" below means "not described in CONTEXT.md" and needs a check before it becomes a ticket.

Source legend:
- **[clone]** cloned with `git clone --depth 1` into `src/` and read from disk.
- **[fetch]** read with WebFetch. The text is a small model's summary of the page. Quoted phrases are as the summary gave them and were not checked word for word against the live page.

Gap legend: **yes** = CONTEXT.md describes it; **partly** = a near equivalent exists but the key property is missing or unverified; **no** = not in CONTEXT.md.

---

## Part 1: Per resource

### 1. Anthropic, "Effective context engineering for AI agents" [fetch]
Guidance that the context window is a finite attention budget to be managed, not a dumping ground.

- **Smallest set of high-signal tokens.** "smallest possible set of high-signal tokens" makes the desired outcome likely. Context is curated every time something is passed to the model.
  - GB: partly. CONTEXT.md has no per-task selection step; briefs exist but their selection rule is not described.
  - Change: skill-level rule in the brief builder (rec 2). Each brief lists the files and facts it includes and why.
- **Just-in-time retrieval.** Keep identifiers (paths, queries, links) and load content with tools. Claude Code is quoted as using a hybrid of CLAUDE.md loaded up front and glob/grep at run time. Its advice is "do the simplest thing that works."
  - GB: partly. Workers receive briefs and handoffs, which are probably pre-loaded.
  - Change: AGENTS.md rule that a brief names pointers (path:line, ticket id, ledger entry) and the builder fetches the content itself.
- **Compaction and structured note-taking.** Compaction keeps architectural decisions and unresolved bugs and drops redundant tool output. Note-taking writes state outside the window (NOTES.md, to-do lists). Sub-agents return condensed summaries of about 1,000-2,000 tokens.
  - GB: partly. The factory ledger and Trello hold state, and sub-agents exist through delegate_task. CONTEXT.md does not mention a compaction rule or a bounded return size.
  - Change: handoff skill with a fixed return format and size cap (rec 3).
- **Choose the technique by work shape.** Compaction suits long back-and-forth. Note-taking suits milestone work. Multi-agent suits parallel research.
  - GB: partly. Garageband's unattended ticket sprint is milestone-shaped, so note-taking should be primary. Inferred.
  - Change: write this rule into AGENTS.md so the Chief picks the pattern per ticket.
- **Tools as contracts.** Keep tools token-efficient and non-overlapping. "If a human engineer can't clearly pick the right tool, the agent can't be expected to."
  - GB: partly. Tool surface is the T3 orchestration set (delegate_task, task_status, t3_thread_*, schedule_task, request_secret, worktrees). Overlap is unknown.
  - Change: in the Track B fork, audit the orchestration tool list for overlap before per-provider injection multiplies it.

### 2. Manus, "Context Engineering for AI Agents: Lessons from Building Manus" [fetch]
Production playbook from Yichao Ji (July 2025). Cache hit rate is the top metric.

- **Stable prefix, append-only context, deterministic serialization.** A timestamp at the top of the system prompt breaks caching. Unstable JSON key order silently breaks it too. The post says cached input is about 10% of uncached cost on Claude Sonnet.
  - GB: no (not in CONTEXT.md). Cost is not a stated concern yet.
  - Change: Track B, when injecting a constitution per provider, keep the injected block byte-stable and put volatile data (ticket state, time) after it. Sprint ticket to measure cache hits per provider first.
- **Mask tools, do not remove them.** Changing the tool list mid-task breaks the cache and confuses the model. Manus uses logit masking and prefill with Auto / Required / Specified modes, and groups tools by name prefix (browser_, shell_).
  - GB: no. Spend caps and guard layers are planned in Track B, but how tool access per role is set is not described.
  - Change: Track B feature "role tool masks" that fix each lane's tool set at start. Lowest-cost version: a fixed tool set per lane in TEAM.md.
- **File system as unlimited memory, with restorable compression.** Drop a web page's content but keep its URL. Drop a document but keep its sandbox path.
  - GB: partly. Briefs point to repo files, and worktrees hold code, so the working tree already works this way.
  - Change: state in handoffs that dropped material can be re-fetched by path or ledger id.
- **Recitation.** Rewrite a todo file on every loop so goals stay near the end of context. Manus runs about 50 tool calls per task.
  - GB: partly. The Chief re-reads ledger and Trello, which gives the same effect at the Chief level, not inside each builder.
  - Change: builder brief ends with a short "current step / remaining" block the builder updates each phase.
- **Keep failures in context.** "leave the wrong turns in the context." Error recovery is called a sign of real agency and is under-measured by benchmarks.
  - GB: partly. Escalation after 3 failed attempts is in CONTEXT.md, but whether the failed attempts' output goes into the next attempt is not stated.
  - Change: escalation handoff must include the failing output and the attempts made. Put this in the handoff template.
- **Avoid few-shot ruts.** Repetitive action-observation history makes the agent imitate itself. Manus fixes it with controlled variation in templates and phrasing.
  - GB: no. Batch-like sprints of identical tickets are exactly this risk. Inferred.
  - Change: low priority. Vary brief wording only if repeated-failure patterns show up in the ledger.

### 3. Thoughtworks (Böckeler), "Context Engineering for Coding Agents" [fetch]
Martin Fowler site, 5 Feb 2026. A taxonomy plus a warning against over-stuffing.

- **Instructions vs guidance.** Instructions say to do a task. Guidance states conventions. Rules can be scoped to file paths so they load only when relevant, which keeps the main file small.
  - GB: partly. TEAM.md and AGENTS.md are the main files. Whether any path-scoped rules exist is not stated.
  - Change: AGENTS.md (short) plus path-scoped rules for the stack areas that need them.
- **Progressive disclosure through skills.** Resources load when the model judges them relevant. Skills can bundle scripts and docs.
  - GB: yes. 37 skills in 19 stations is this pattern. Check that skill descriptions are short enough to be cheap when all loaded (see rec 7).
- **Hooks as deterministic lifecycle events.** Example: format after every edit.
  - GB: yes. Pre-push guard, Claude Code guard hook, and slop-lint cover this.
  - Change: none for context. For cost, the guard hook output should be quiet on success (see rec 4).
- **Build context up gradually.** The article warns against "pump[ing] too much stuff in there right from the start." It also says to use /context to see what fills the window, and to re-check setups as models improve.
  - GB: partly. The skill stack is large and loaded per provider in Track B. Inferred risk: 37 skills plus a full constitution per provider could load too much up front.
  - Change: sprint ticket to measure starting context per provider (the /context command or equivalent) and set a budget.
- **No unit tests for context.** "There are no unit tests for context engineering." Judge a setup by using it.
  - GB: no. There is no evaluation of brief quality in CONTEXT.md.
  - Change: Track B "learning loop" should record, per ticket, whether the review found a context gap (missing file, stale fact). That gives a measure.

### 4. HumanLayer (Dex), "Advanced Context Engineering for Coding Agents" [fetch]
Aug 2025. Research, then plan, then implement. Frequent intentional compaction.

- **Frequent intentional compaction.** Keep context utilization in the 40-60% range. When it fills, have the agent write a progress file (goal, approach, steps done, current failure). Commit messages can serve the same purpose.
  - GB: partly. Handoffs and the ledger exist. The utilization target and the progress-file trigger are not in CONTEXT.md.
  - Change: handoff skill with a "write progress at 50% utilization or before a fresh session" rule (rec 3).
- **Research, then plan, then implement, with a compacted artifact between each.** Research docs in `thoughts/shared/research/`, plans in `thoughts/shared/plans/`, slash commands per phase in `.claude/commands/`. Status is compacted back into the plan after each verified phase.
  - GB: partly. Garageband has spec, design, architect, slice, hand off, build, review stations, so the sequence exists. Whether each station leaves a compacted artifact that the next station reads is not stated.
  - Change: make each station's output a fixed-size artifact with a named path in the ledger. The next station reads that artifact and nothing else by default.
- **Context budget priorities.** Correctness, then completeness, then size, then trajectory. "Incorrect information" is the worst failure, then missing information, then noise.
  - GB: no. Briefs are not scored against these priorities in CONTEXT.md.
  - Change: write the order into the brief template so builders know a wrong fact costs more than a missing one, and say what to do when unsure (mark it, rec 6).
- **Human review at high-leverage points.** Read research docs and plans most, tests next, code least. "a bad line of a plan could lead to hundreds of bad lines of code."
  - GB: yes. Garageband has review stations and the founder is in the loop via Concierge. Track B needs-you queue fits this.
  - Change: Track B needs-you queue should surface plans and research artifacts before code.
- **Failure case.** The method failed on a 7-hour dependency-removal task, because research did not trace the dependency tree. The author says hard problems need someone who knows the codebase.
  - GB: partly. Relevant to the code map (Track B). Inferred: unattended builders are most exposed on hard cross-module tickets.
  - Change: escalate research gaps to the founder rather than letting the builder guess.

### 5. HumanLayer, "Context-Efficient Backpressure for Coding Agents" [fetch]
Test, build, and lint output is feedback, but verbose output wastes context.

- **Swallow success, dump failure.** A `run_silent` wrapper writes stdout and stderr to a temp file. On exit 0 it prints `✓ <description>` and deletes the file. On failure it prints `✗`, dumps the output, and returns the original exit code. Quoted rule: "Success = ✓. Failure = full output."
  - GB: partly. CI quality gates and pre-push guard exist, but CONTEXT.md does not say their output is quiet. Unknown.
  - Change: Track B guard layer ships a `run_silent` wrapper and the builder brief requires it for test, build and lint commands (rec 4).
- **Enforce deterministically, not by asking.** "deterministic is better than non-deterministic when you already know what matters." Tell the agent in CLAUDE.md or AGENTS.md not to truncate on its own.
  - GB: partly. Guard hooks are deterministic. Truncation behavior is not stated.
  - Change: one AGENTS.md line: "do not pipe test output to head or tail; use the wrapper."
- **Avoid two patterns.** Sending output to /dev/null with `||` fallback messages hides information. Piping to head or tail forces reruns, which costs more.
  - GB: no (not in CONTEXT.md). Inferred risk: builders that pipe to tail and rerun waste both tokens and sprint time.
  - Change: add to the same AGENTS.md line.
- **Fail fast.** `pytest -x`, `jest --bail`, `go test -failfast` work one failure at a time.
  - GB: no. Change: add to the wrapper's documented flags per stack.

### 6. OpenHands, "Context Condensation for More Efficient AI Agents" [fetch]
Vendor blog (Calvin Smith, April 2025). Bounded conversation memory.

- **Keep recent exchanges intact, summarize the rest.** The summary encodes the user's goals, progress so far, what remains, and for code tasks the critical files and failing tests.
  - GB: partly. Handoffs do this at ticket boundaries, not inside a long builder run.
  - Change: builder handoff summary uses the same four fields: goal, progress, remaining, critical files and failing tests (rec 3).
- **Trigger only past a size threshold.** Condensation runs only when context passes a set size, so the cached prefix is reused across turns.
  - GB: no. Inferred: a hard token threshold per builder run is missing.
  - Change: Track B spend caps and circuit breaker can add a per-run context ceiling that forces a handoff. Sprint ticket if Track B is deferred.
- **Cost numbers.** Up to 2x per-turn cost reduction. Quadratic baseline cost growth vs linear condensed growth (theoretical). Solve rate 54% vs 53% on a SWE-bench Verified subset.
  - Caveat: vendor evaluation on a subset. The one-point gap is noise. Treat the cost claim as directional. Do not cite the solve rate as a gain.

### 7. HumanLayer (Kyle), "Writing a good CLAUDE.md" [fetch]
Nov 2025. CLAUDE.md is the only file loaded into every conversation.

- **Size and count limits.** "< 300 lines is best, and shorter is even better"; HumanLayer's own root file is under 60 lines. Frontier thinking models follow about 150-200 instructions "with reasonable consistency." Claude Code's own system prompt already uses about 50.
  - GB: no (not in CONTEXT.md). AGENTS.md is called a "constitution," which suggests it is long. Length is unknown and must be measured.
  - Change: sprint ticket to measure AGENTS.md lines and instruction count. Set a target (for example, under 150 lines in the root, rest in skills). Track B injects the constitution per provider, so this is a precondition.
- **Include only what applies to every task.** Exclude command lists, style rules and task-specific detail. Move the rest to `agent_docs/` with self-describing names and list them with one-line descriptions.
  - GB: partly. Skills do this. Whether AGENTS.md is slimmed to pointers is unknown.
  - Change: AGENTS.md keeps only universal rules and a table of pointers to skills and templates.
- **Why agents ignore a rule.** Claude Code wraps CLAUDE.md in a note that it "may or may not be relevant," so off-topic lines get skipped. More off-topic text means more skipping everywhere.
  - GB: partly. Inferred: constitution lines that do not apply to the ticket type are likely being skipped.
  - Change: same fix as above, plus path- or role-scoped rules.
- **Pointers, not copies.** Use file:line references instead of code snippets, which go stale.
  - GB: partly. Briefs should follow this. Change: brief template uses path:line only.
- **Use deterministic tools, not an LLM, for lint.** A Stop hook runs formatter and linter and reports errors for the model to fix.
  - GB: yes. Pre-push guard, guard hook and slop-lint fit this. Change: none beyond rec 8.

### 8. sawinyh, "Greenfield AI, Brownfield AI, and the Vibecode You Just Inherited" [fetch]
Three codebase types, and playbooks for each. The core test is whether the repo has "working, enforced guardrails."

- **Layered rules.** Root CLAUDE.md for project-wide rules, `.claude/rules/*.md` for domain rules, local overrides for module quirks. The agent composes them.
  - GB: partly. AGENTS.md plus TEAM.md plus skills are the layers. Domain-scoped layers are not described. Change: rule layers by stack area (rec 7).
- **Ratcheted hooks.** `check-file-size` requires new files to be 300 lines or fewer. Existing big files can be edited, but "the line count can only stay the same or shrink." Silent-catch detection works the same way.
  - GB: no (not in CONTEXT.md). This is the most direct answer to "keep context small per file" (rec 8).
- **Baselined lint.** A checked-in `.lint-baseline.json` (or betterer). CI fails only when the violation count grows. Auto-fix runs first.
  - GB: partly. CI quality gates exist. Whether they baseline existing violations is unknown.
  - Change: if the Garageband target repos have legacy lint debt, unattended builders will fail on it. Baseline before the sprint.
- **Diff-scoped CI.** Lint only changed files against origin/main. Full-tree lint runs on a schedule as a trend check.
  - GB: partly. Unknown. Change: sprint ticket to check whether the gate is diff-scoped. Diff-scoped gates keep a builder's failure output small.
- **Feature-folder refactors.** An 847-line file was split into a folder with a thin entry plus constants, errors, security, validate and types files. Typed errors replace generic throws.
  - GB: no. Change: for a target repo, a refactor ticket that splits any file over 300 lines before feature work. Inferred value, not measured.

### 9. Deterministic Context Routing (ai-erp-collab) [clone]
Methodology, templates and a README. Repo: `src/ai-erp-collab_deterministic-context-routing/`. Read: README, Methodology sections 03 and 02 (in part), Templates/project-workspace (AGENTS.md, session_state.md), Derivatives. The Evidence/ folder is not in the clone.

- **Fixed routing chain.** A request resolves in order: module registry (`modules.md`) -> module concept page -> wiki and contracts -> artifact index -> session state. An agent reads only what the chain needs.
  - GB: partly. Garageband routes by lane and TEAM.md (which model builds what). It does not route context by module or concept.
  - Change: brief builder follows the same chain: ticket -> area registry -> concept page -> code pointers -> ledger entry (rec 2).
- **Session state with a stop marker.** `session_state.md` holds dated entries. Each entry ends with `<!-- AGENT-SESSION-STOP -->`, and agents read only up to the first marker. Template fields: last active module, workspace docs changed, verification run, next useful action. Quoted rule: session state "should not become the durable knowledge itself."
  - GB: no. The ledger and Trello are status, not per-lane restart notes. This is the highest-value gap for the hourly Chief wake (rec 1).
  - Change: sprint ticket: add `session_state.md` per lane (or per ticket) in the ledger branch, with the stop marker and the template fields. AGENTS.md rule: read only the latest entry.
- **Confidence labels.** `confirmed`, `inferred`, `runtime-unverified`, `blocked-by-access`. Agents act confidently on confirmed facts and cautiously on the rest.
  - GB: no. Rec 6.
- **Layered memory with lifetimes.** System memory (not editable), agent instruction file (AGENTS.md or CLAUDE.md or GEMINI.md), short memory (session_state), medium memory (plans and reviews), long memory (curated wiki pages), project and module memory, source evidence. The doc says layers are "ranked by retrieval purpose," not importance.
  - GB: partly. Garageband has instruction file, ledger, plans and TEAM.md. It lacks a curated long-memory layer and an explicit rule for which layer a fact goes to. Change: a one-page "where does this fact go" table in AGENTS.md, and the same table as the B5 scope rule (rec 5).
- **Never copy another module's rule; call its owner.** Cross-module work goes through the owner's API and leaves a mark on both sides.
  - GB: no. Relevant if Garageband runs several target repos. Inferred: a shared rule should live once and be referenced.
- **Claim: about 30% lower cost against a flat memory-bank pattern.** Six tasks, three small services. This is the author's own test. I could not verify it because the Evidence/ folder is not in the repo.
  - Status: unverified. Do not cite as a result.

### 10. plasma-ai/wiki [clone]
Indexed Markdown knowledge bases with a CLI, SKILL.md, and deterministic `_index.md` generation. Repo: `src/plasma-ai_wiki/`. Read: README, `wiki/skills/wiki/SKILL.md`, and the file list. I did not run the CLI.

- **Indexes at every level, read the index first.** Each folder has `_index.md` that links to children. Agents read the index and open only the pages a task needs. The README calls this the LLM Wiki shape from Karpathy.
  - GB: no. The ledger and skills are flat lists, not indexed. Change: Track B code map and learning loop can keep an `_index.md` per area. Start with the skills folder.
- **Deterministic generation of indexes.** A CLI writes the index and cross-links. Content below a `***` delimiter is authored; the generated region merges automatically on parallel edits.
  - GB: no. Relevant to parallel builders writing the same index. Change: Track B shared memory uses the same split, generated region plus authored region, so parallel builders do not conflict.
- **Default to sub-agents for wide work.** SKILL.md says "Default to sub-agents and dynamic workflows rather than authoring or auditing page by page yourself." Each page goes to its own sub-agent, then one index pass stitches them.
  - GB: partly. delegate_task covers the mechanism. The pattern "fan out, then one stitch step" is not described.
  - Change: for any wiki-like memory Garageband builds, use fan-out then a single index step.
- **Exclusions and naming rules in settings.** `.wiki/settings.json` holds gitignore-style excludes and naming policy. Excluded paths are never walked or linted, but still readable.
  - GB: no. Change: exclude build output, vendor and generated folders from any memory index so context search does not pull them.
- **Plugin install for Claude Code and Codex.** The skill installs as a plugin for both. Copied skills need a re-install after upgrade.
  - GB: partly. Track B installs skills once for every provider. Note the upgrade-refresh issue: a copied skill goes stale unless re-synced.

### 11. data-olympus (knaisoma) [clone]
Git-native, governed decision store with an MCP server, single-writer pipeline, and a consult gate. Repo: `src/knaisoma_data-olympus/`. Read: README, WHY.md, docs/enforcement.md (in part). Did not run the server or benchmarks.

- **Governed decisions with status and supersession.** Each document has a stable `id`, controlled `type`, `status` and `tier`, and a `supersedes` chain. Queries filter by `status: accepted`. WHY.md: "the agent had no durable memory of the team's decisions."
  - GB: no. Decisions live in plans, ledger and skills without status or supersession. Change: Track B "B5 shared memory" should store decisions as records with `status` (proposed / accepted / superseded) and `supersedes`. Retrieval filters on accepted.
- **Scope levels.** Universal (company or team), project, component. Rules are captured and retrieved at the scope that owns them.
  - GB: partly. TEAM.md is per project. Change: B5 uses three scopes: factory-wide (constitution), project (AGENTS.md / TEAM.md), ticket or lane.
- **Git as the store, plus a single writer.** Markdown plus YAML frontmatter in git. Writes go through one pipeline with advisory locks, per-session worktrees and a durable push queue. "prevents concurrent write races without requiring distributed locking infrastructure."
  - GB: partly. The ledger lives on its own git branch, and worktrees exist. Whether the Chief is the single writer is not stated. Change: B5 rule that only the Chief writes decisions; builders propose.
- **Consult gate with clearance bound to intent.** A prompt-hook consult injects rules every turn but never clears the gate. Only an explicit consult clears a governed action, and only for the topics its intent covered. Quoted: "A consult about the database schema no longer clears a `pip install`."
  - GB: partly. The Claude Code guard hook and pre-push guard exist. Injection-per-turn and topic-scoped clearance are not in CONTEXT.md. Change: Track B guard layer, with two parts: inject governing rules on every turn (cheap), and require an explicit consult before governed actions (dependency edits, schema changes, releases).
- **Audit trail.** Every consult and gate decision is recorded for compliance.
  - GB: partly. Track B audit log covers this. Change: none beyond recording consult ids in the ledger.

### 12. OpenViking (volcengine) [clone]
"The Context Database for AI Agents." A virtual `viking://` filesystem for knowledge, memories and skills, with generated summaries per directory. Repo: `src/volcengine_OpenViking/`. Read: README (value props, tiers), docs/en/concepts/08-session.md (in part), docs/en/context-compilation/06-memory-consolidation.md. Did not run the Rust/C++ engine or the benchmark.

- **Three loading tiers.** L0 abstract (one sentence), L1 overview (structure and usage scenarios), L2 full content read only on demand. Each directory carries `.abstract.md` and `.overview.md`. Quoted: "Read the summary before the source."
  - GB: no. Change: each area folder in a target repo gets a short `.abstract.md` and `.overview.md` (or `_index.md` per rec 10). The brief builder reads L0 for every candidate and L1 only for the chosen ones. Cheapest context win in this set.
- **Scoped search.** Search a directory or project subtree, not a flat index.
  - GB: no. Change: Track B code map queries by area first.
- **Sessions become files.** Committing a session archives the conversation and extracts memories as Markdown that can be read, edited and merged. Session commit creates a background task for summary and memory extraction.
  - GB: partly. Handoffs and ledger entries are the equivalent, written by hand. Change: B5 adds an "archive on finish" step per ticket that writes the handoff and extracted decisions to the ledger.
- **Memory consolidation.** A periodic pass deduplicates, merges and compacts existing memories "without losing facts," and keeps distinct objects separate. Runs as a task you can check and cancel.
  - GB: no. Change: a sprint maintenance task (the `maintain` station already exists in the skill stack) that consolidates the decision store monthly and proposes merges for review rather than writing them.
- **Caveat.** The "file system for agents" framing is a vendor claim. OpenViking runs its own store and server, which is heavier than the markdown-in-git model Garageband uses. Inferred: copy the ideas (tiers, scoped search, consolidation), not the server.

### 13. DevProjex [clone]
Local, read-only codebase context packer with an MCP server, Live Context, token estimates, code compression, and an agent journal. Repo: `src/Avazbek22_DevProjex/`. Read: Docs/McpServer.md, Docs/AgentJournal.md, Docs/CodeCompression.md (first ~3 KB each). Did not run the tool.

- **Code compression for context.** Keep declarations, signatures, constants and field initializers; empty named method bodies. Quoted rule: "compression removes what a body does, never what a declaration says." Works for 14 languages via pinned tree-sitter grammars. Unsupported files stay complete.
  - GB: no. Change: brief builder or code-map step can produce a signatures-only view of files the builder only needs to call, not edit. Track B code map is the place. Start with a small script, not a dependency.
- **Reduced tool set and fixed-at-startup tools.** `--tool-set reduced` exposes six tools instead of eight. The set is fixed at startup, and omitted tools return an error naming them.
  - GB: partly. Change: fixed tool set per lane, as in idea I12 (Manus, resource 2).
- **Live context with an explicit focus line.** Results are limited to the selected focus. Each result adds one line with counts only: "focus: 1 of 9 selectable files; 8 outside the focus were not searched." The file is still readable by name.
  - GB: no. Change: when a brief scopes a builder to certain files, the builder's tool output should state how much was excluded. Prevents silent blind spots.
- **Agent journal.** Logs every context delivery per session: files actually sent, tokens estimated, masked values, and calls. Says what counts as "delivered" (whole text, line range, search lines) and what does not (names in a listing).
  - GB: no. This is the measurement gap from resource 3 (no evaluation of context). Change: Track B audit log records per ticket: files sent to the builder, token estimate, and whether the review found a missing fact. That is the learning-loop input.

---

## Part 2: Ideas, gap status and changes

Each idea is tagged with its resource(s). "Change" points at the type of work: skill, AGENTS.md, sprint ticket, or Track B feature.

| # | Idea | Source(s) | GB now (per CONTEXT.md) | Change |
|---|---|---|---|---|
| I1 | Per-ticket context pack, smallest high-signal set, pointers over copies | 1, 3, 7, 9, 12 | partly | Skill: brief builder |
| I2 | Stop-marker session state per lane, read only latest entry | 9 | no | Sprint ticket + AGENTS.md rule |
| I3 | Progress / handoff file with fixed size, written before context fills | 4, 6, 1 | partly | Skill: handoff; template |
| I4 | Quiet success, full output on failure; no piping to head/tail | 5 | partly | Track B guard feature; AGENTS.md line |
| I5 | Governed decision store: status, supersedes, scope, single writer | 11, 9 | no | Track B "B5 shared memory" |
| I6 | Consult gate: per-turn injection, explicit clearance for governed actions | 11 | partly | Track B guard layer |
| I7 | Short root instruction file, pointer table to skills; measured budget | 7, 3 | no | Sprint ticket (measure); AGENTS.md (slim) |
| I8 | Confidence labels on facts in briefs, handoffs, reviews | 9 | no | Template change; skill |
| I9 | Ratchets: new files 300 lines or less, baselined lint, diff-scoped CI | 8, 7 | partly / no | Sprint ticket per target repo; CI |
| I10 | Layered rules by stack area; path-scoped | 3, 8 | partly | AGENTS.md + skills |
| I11 | Cache-stable prefix, volatile data last; measure hit rate per provider | 2 | no | Track B constitution injection |
| I12 | Fixed tool set per lane, not removed mid-task | 2, 13 | partly | TEAM.md + Track B role masks |
| I13 | Tiered summaries L0/L1/L2 per area folder | 12, 10 | no | Skill + small generated files |
| I14 | Deterministic index generation with authored region below a delimiter | 10 | no | Track B B5 (same split) |
| I15 | Fan out sub-agents, one stitch step; bounded return size | 1, 10 | partly | Skill: handoff / orchestration |
| I16 | Memory consolidation as a maintain-station task (propose, do not write) | 12 | no | Sprint ticket |
| I17 | Signatures-only view for files a builder only calls | 13 | no | Track B code map |
| I18 | Learning loop: record files sent, tokens, and context gaps found in review | 3, 4, 13 | no | Track B learning loop |
| I19 | Escalation includes failing output and attempts made | 2 | partly | Handoff template |
| I20 | Re-check context setup as models change; measure starting context | 3 | no | Sprint ticket |

---

## Part 3: Top 8 recommendations (ranked by value for Garageband)

1. **Stop-marker session state per lane (I2).** Sprint ticket. Each builder or Chief run appends one dated entry to a `session_state.md` on the ledger branch, ending in `<!-- AGENT-SESSION-STOP -->`. AGENTS.md says read only up to the first marker. This fixes the hourly Chief wake, which starts fresh each time.
2. **Deterministic brief builder with a fixed routing chain (I1, I17 later).** Skill. Ticket -> area registry -> concept page -> pointers (path:line) -> latest ledger entry. The brief lists what it included and why. Builders fetch content themselves.
3. **Handoff and progress template with a size cap (I3, I15, I19).** Skill + template. Four fields: goal, progress, remaining, critical files and failing tests. Write at about 50% context use or before a fresh session. Escalations also carry the failing output. Sub-agent returns capped in size.
4. **Quiet-by-default check wrapper plus one AGENTS.md line (I4).** Track B guard feature, and one line now. Tests, builds and lints print a single check mark on success and full output on failure. Builders do not pipe to head or tail.
5. **Track B "B5 shared memory" as governed records in git (I5, I14, I16).** Track B feature. Decisions carry `status` and `supersedes`, live in three scopes, are written only by the Chief, and retrieval filters on `accepted`. Use a generated index region plus an authored region so parallel builders do not conflict. Cross-model: the store is plain markdown in git, read by any provider through its own instruction file (AGENTS.md, CLAUDE.md, GEMINI.md) or MCP.
6. **Measure, then slim, the constitution (I7, I11, I20).** Sprint ticket first. Count AGENTS.md lines and instructions per provider and the starting context size. Move anything that is not universal into skills. Keep the injected block byte-stable for caching. This is a precondition for Track B's per-provider injection.
7. **Confidence labels on every brief and handoff fact (I8).** Template change now. `confirmed`, `inferred`, `runtime-unverified`, `blocked-by-access`. Reviewers reject unlabeled claims. Cheap and it stops the worst failure (wrong facts) from travelling silently to the next station.
8. **Ratchet gates per target repo: new files at or under 300 lines, baselined lint, diff-scoped CI (I9, I10).** Sprint ticket. Stops large files growing and gives unattended builders small, readable files and small failure output. Baseline existing violations first so the sprint is not blocked by legacy debt.

Not in the top 8 but worth tracking: consult gate with per-turn injection (I6, Track B guard layer), learning loop (I18), memory consolidation (I16), signatures-only code view (I17).

---

## Part 4: What I could not open or verify

- **Garageband repo (github.com/milllenialfalcon/Garageband).** Not opened, per the instruction to base gaps on CONTEXT.md. Every "no" is "not described in CONTEXT.md". Before ticketing any item, check the repo for AGENTS.md length, skill descriptions, the ledger format, and the CI gate configuration. Those answers can change several ratings.
- **Fetched articles (WebFetch).** Anthropic, Manus, Thoughtworks, the three HumanLayer posts, OpenHands and sawinyh were read through a summarizing model, not as page text. Quoted phrases are as relayed and were not checked word for word. Specific numbers (10% cache cost, 40-60% utilization, 150-200 instructions, 54% vs 53%, 847 lines) should be re-checked against the live page before they go into a shared doc.
- **HumanLayer "Advanced Context Engineering" templates.** The post names file locations but not the template contents. The compaction output is an image I could not read.
- **Routing repo Evidence/ folder.** Not in the clone. The 30% cost-saving claim is unverified.
- **OpenViking.** Read the README value props and two docs pages only. Did not read the server, the L0/L1 generation code, the retrieval algorithm, or the benchmark. The Rust/C++ index code was not studied.
- **data-olympus.** Read README, WHY.md and the enforcement doc. Did not read the server, the benchmarks folder, or the consult ledger code. Did not run anything.
- **wiki.** Read README and SKILL.md. Did not run the CLI, read the `_index` generator, or read the merge driver in `_assets/git/merge_index.sh`.
- **DevProjex.** Read three docs (first ~3 KB each). Did not read Ranking.md, SmartIgnore.md, or the token-estimation method. Did not run the tool.
- **Karpathy LLM Wiki gist and Google OKF.** Linked from the wiki README. Not opened (not in this slice).
- **No code was run from any clone.** Read-only inspection with `cat`, `head`, `find` and `grep`.

Clones are in `/tmp/claude-0/-home-claude/80fb1f52-60ae-56e0-8a79-b145fdd1f249/scratchpad/ahe-study/src/`:
- `plasma-ai_wiki/`
- `knaisoma_data-olympus/`
- `volcengine_OpenViking/`
- `ai-erp-collab_deterministic-context-routing/`
- `Avazbek22_DevProjex/`
