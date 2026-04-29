# HB Claude Rules File Set

## Purpose

This directory contains detailed Claude Code operating rules for the `hb-intel` repository.

The root router lives at:

```text
.claude/rules.md
```

The detailed rule files live under:

```text
.claude/rules/
```

Use this directory to preserve concise routing in `.claude/rules.md` while keeping detailed rule content modular and maintainable.

---

## Relationship to Other Claude Configuration

| Layer | Location | Role |
|---|---|---|
| Root operating brief | `CLAUDE.md` | High-level behavior, priorities, and invariant posture. |
| Rule router | `.claude/rules.md` | Detailed rule index and source-of-truth routing. |
| Detailed rules | `.claude/rules/*.md` | Modular rule files used by topic. |
| Project rules | `.claude/rules/projects/*.md` | Product/phase-specific rules. |
| Agents | `.claude/agents/*.md` | Specialist reviewers and investigators. |
| Skills | `.claude/skills/*/SKILL.md` | Repeatable workflow playbooks and slash-command-like procedures. |
| Hooks | `.claude/hooks/*` | Deterministic local enforcement where appropriate. |
| Settings | `.claude/settings*.json` | Tool permissions and environment-specific configuration. |

---

## Rule Files

| File | Purpose |
|---|---|
| `01-authority-and-reading-order.md` | Source-of-truth hierarchy, reading order, repo-truth discipline. |
| `02-architecture-invariants.md` | Architecture guardrails and durable platform constraints. |
| `03-package-boundaries.md` | Package ownership, dependency direction, exports, and shared-code placement. |
| `04-documentation-standards.md` | Documentation placement, authority, formatting, and drift control. |
| `05-implementation-quality.md` | Code-quality expectations and implementation discipline. |
| `06-planning-and-proposals.md` | Plans, prompt packages, proposals, saved artifacts, and better-path recommendations. |
| `07-plan-review-and-execution-gates.md` | Plan gates, scope locks, approval requirements, and sensitive execution controls. |
| `08-active-context-efficiency.md` | Avoiding repeated reads while preserving repo-truth verification. |
| `09-skills-and-agents-routing.md` | Choosing Skills, agents, direct work, and escalation order. |
| `projects/pcc-phase-3.md` | Active Project Control Center Phase 3 rules. |

---

## Maintenance Rules

- Keep `.claude/rules.md` concise.
- Put detailed policy in numbered rule files.
- Put project-specific rules under `.claude/rules/projects/`.
- Keep agents as reviewers/investigators.
- Keep Skills as reusable workflow playbooks.
- Do not duplicate long rule blocks across agents, Skills, and root files.
- When a rule changes, update all routing references that point to it.
- When current repo truth contradicts these rules, verify the current file and update the rule set rather than relying on stale guidance.
