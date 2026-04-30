# HB Claude Configuration Index

## Purpose

This directory contains active Claude Code configuration for `hb-intel`.

Keep this directory lean. Historical plans, logs, execution evidence, and generated artifacts belong outside active `.claude/` context.

---

## Active Configuration Packages

| Package | Path | Use For |
| --- | --- | --- |
| Rule router | `.claude/rules.md` | Top-level rule selection and guardrails. |
| Detailed rules | `.claude/rules/` | Modular durable rules. |
| Skills | `.claude/skills/` | Repeatable workflows. |
| Agents | `.claude/agents/` | Specialist review and investigation. |
| Hooks | `.claude/hooks/` | Deterministic local enforcement. |
| Active draft plans only | `.claude/plans/` | Current short-lived working plans only. |
| Settings | `.claude/settings.json`, `.claude/settings.local.json` | Permissions, deny rules, and local tool posture. |

---

## Not Active Context

Do not store old plans, logs, run outputs, generated JSON, deployment evidence, or historical archives in `.claude/`.

Use:

```text
.archive/claude-plans/
```

Archived material is denied from normal Claude Code access by project settings.

---

## Routing

| Situation | Route |
| --- | --- |
| Need a standing rule | `.claude/rules.md` |
| Need repeatable workflow | `.claude/skills/README.md` |
| Need specialist review | `.claude/agents/README.md` |
| Need deterministic local enforcement | `.claude/hooks/README.md` |
| Need validation command selection | `docs/reference/developer/verification-commands.md` |
| Need documentation placement rules | `docs/reference/developer/documentation-authoring-standard.md` |

---

## Token Discipline

- Keep `CLAUDE.md` short.
- Keep indexes routing-focused.
- Keep Skills focused on workflows.
- Keep agents focused on specialist review.
- Keep rules modular.
- Keep `.claude/plans/` nearly empty and active-only.
- Never store logs under `.claude/`.
