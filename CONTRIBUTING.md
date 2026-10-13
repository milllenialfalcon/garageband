# Contributing to Garageband

Thanks for helping. Garageband is a set of plain-text skills plus a few scripts and gates, so most contributions are a skill, a fix to an existing skill, or a fix to a script.

## Set up

You need git, Node.js 22 or newer and Bash. Then:

```
git clone https://github.com/milllenialfalcon/Garageband.git
cd Garageband
```

## Add or change a skill

Each skill is one folder under `skills/` with one file, `SKILL.md`:

```
skills/<skill-name>/SKILL.md
```

The validator enforces these rules for the frontmatter:

- `name` matches the folder name exactly.
- `name` uses lowercase letters, digits and single hyphens only, for example `write-spec`. It must not contain `claude` or `anthropic` as a word.
- `description` starts with "Use when", "Use at", "Use after" or a similar phrase. It is at most 1024 characters and contains no angle brackets.
- If the description contains `: ` or ` #`, wrap the whole value in double quotes so strict YAML parsers accept it.
- Scripts a skill refers to must exist under that skill's `scripts/` folder.

Keep the body short. A skill over about 220 lines triggers a warning; move detail into a `references/` file instead.

If you add a skill, also add it to the router in `skills/garageband/SKILL.md` and to the skills table in `README.md`. The validator checks that every skill named in the router and README exists, and that the router routes to every skill.

## Check your change

Both commands must pass before you open a pull request:

```
node scripts/validate-skills.mjs
bash tests/run-tests.sh
```

Then run `claude plugin validate . --strict` if you have the Claude Code CLI.

## Prove a skill works

A skill is only useful if a model actually follows it better with the skill than without. For a new or changed skill, use the `skill-lab` skill: write three to five realistic prompts, including one that tempts the model to skip the skill's discipline, and run each one with and without the skill on the models you use. Put the results in your pull request description.

## Pull requests

- Keep one change per pull request.
- Describe what changed and why, and paste the output of both check commands.
- Do not change a skill's behaviour and its tests in the same commit without saying so.

## Conduct

Be direct, be kind, and assume good faith. Report security problems privately as described in [SECURITY.md](SECURITY.md).
