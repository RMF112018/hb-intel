# HB Claude Hooks Index

## Purpose

This directory contains deterministic Claude Code hook scripts for the `hb-intel` repository.

Use hooks only for behavior that should be enforced outside model judgment. Hooks should be narrow, explainable, safe by default, and documented with their event, matcher, command, override path, and use case.

---

## Current Hook Inventory

| Hook | Recommended Event | Matcher | Purpose | Use Case | Override |
| --- | --- | --- | --- | --- | --- |
| `plan-library-guard.sh` | `PreToolUse` | `*` | Blocks accidental mutation of `docs/architecture/plans/**` unless explicitly authorized. | Prevents scratch plans or draft planning artifacts from being written into the canonical docs plan library. | `HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1` |

---

## Routing / Use Cases

| Situation | Use Hook? | Route |
| --- | --- | --- |
| Prevent accidental writes to protected canonical docs paths | Yes | `plan-library-guard.sh` |
| Enforce deterministic command/path restrictions | Possibly | Add a narrow hook after documenting the rule in this README. |
| Review whether a command is safe | No | Use `hb-sensitive-operation-gate` and the relevant specialist agents. |
| Decide whether a plan belongs in `.claude/plans/**` or `docs/architecture/plans/**` | No | Use `.claude/rules/04-documentation-standards.md` and `hb-doc-authority-cleanup`. |
| Enforce tenant/deployment permission posture | Usually no | Prefer settings allow/ask/deny plus `hb-sensitive-operation-gate`; use hooks only for local deterministic checks. |
| Perform repo research or contextual reasoning | No | Use Skills or agents. |

---

## Recommended Registration

Add this to `.claude/settings.local.json` or the appropriate project/user settings file if your local Claude Code setup uses hooks:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/plan-library-guard.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Hook Behavior: `plan-library-guard.sh`

### Allows

- Reads or searches that mention `docs/architecture/plans/**`.
- Read-only tools such as `Read`, `Grep`, `Glob`, `LS`, and `Task`.
- Clearly read-only Bash commands such as `git diff`, `git status`, `git log`, `git show`, `grep`, `rg`, `find`, `ls`, `cat`, `sed -n`, `awk`, `wc`, `head`, and `tail`.
- Explicitly authorized canonical plan-library writes when the override variable is set.

### Blocks

- `Write`, `Edit`, `MultiEdit`, or `NotebookEdit` calls that target or reference `docs/architecture/plans/**`.
- Mutating Bash commands that reference `docs/architecture/plans/**`.
- Unknown or ambiguous Bash commands that reference `docs/architecture/plans/**`.

### Override

Use only when the user explicitly authorizes a canonical docs-plan update:

```bash
HB_ALLOW_CANONICAL_PLAN_LIBRARY_WRITE=1
```

Do not use the override for scratch plans, draft outlines, or exploratory planning. Those belong in:

```text
.claude/plans/**
```

---

## Adding New Hooks

Before adding a new hook:

1. Confirm the behavior is deterministic and narrow.
2. Confirm it cannot be better handled by rules, Skills, agents, or settings.
3. Document the hook in this README before relying on it.
4. Include the event, matcher, command, purpose, use case, blocked behavior, allowed behavior, and override path.
5. Avoid hooks that perform broad repo mutation, network calls, tenant calls, deployment, package installs, or hidden side effects.
6. Keep outputs clear enough for Claude and the user to understand the block.

---

## Safety Rules

Hooks must not:

- mutate tenant resources;
- call live Graph/PnP;
- call Procore;
- deploy;
- upload app catalog packages;
- edit CI/CD;
- install dependencies;
- silently change repo files;
- bypass user approval;
- replace plan-gate review for sensitive operations.

Hooks may block or warn. They should not make judgment-heavy decisions that belong in Skills, agents, or user approval.
