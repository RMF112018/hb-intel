# Claude Code Context Rules – HB Intel

## Purpose

This file routes Claude Code to the correct detailed rule, Skill, agent, hook, or source of truth.

Keep this router concise. Put detailed policy in `.claude/rules/**`.

---

## Rule Index

| Rule | File | Use When |
| --- | --- | --- |
| Authority and Reading Order | `.claude/rules/01-authority-and-reading-order.md` | Choosing source of truth and reading order. |
| Architecture Invariants | `.claude/rules/02-architecture-invariants.md` | Architecture, runtime, and platform guardrails. |
| Package Boundaries | `.claude/rules/03-package-boundaries.md` | Package ownership, dependencies, exports, shared placement. |
| Documentation Standards | `.claude/rules/04-documentation-standards.md` | Documentation placement, source-of-truth hierarchy, stale docs. |
| Implementation Quality | `.claude/rules/05-implementation-quality.md` | Code quality and implementation discipline. |
| Planning and Proposals | `.claude/rules/06-planning-and-proposals.md` | Plans, prompt packages, proposals, better paths. |
| Execution Gates | `.claude/rules/07-plan-review-and-execution-gates.md` | Plan gates, approval, sensitive operations, completion reporting. |
| Active Context Efficiency | `.claude/rules/08-active-context-efficiency.md` | Avoiding token waste and repeated reads. |
| Skills and Agents Routing | `.claude/rules/09-skills-and-agents-routing.md` | Choosing Skills, agents, hooks, rules, or direct work. |
| PCC Phase 3 | `.claude/rules/projects/pcc-phase-3.md` | Project Control Center work. |

---

## Routing Indexes

| Need | Use |
| --- | --- |
| Configuration map | `.claude/README.md` |
| Skill selection | `.claude/skills/README.md` |
| Agent selection | `.claude/agents/README.md` |
| Hook inventory | `.claude/hooks/README.md` |
| Validation commands | `docs/reference/developer/verification-commands.md` |

---

## Default Posture

- Current repo truth controls.
- Read the smallest sufficient source set.
- Use Skills for recurring workflows.
- Use agents only when specialist review reduces risk.
- Do not inspect `.archive/claude-plans/**` unless the user explicitly asks for historical/archive material.
- Do not execute sensitive operations without explicit approval and the relevant gate.
