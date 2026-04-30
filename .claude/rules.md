# Claude Code Context Rules — HB Intel

## Purpose

Route Claude Code to the smallest effective rule, Skill, agent, hook, or source of truth.

Do not duplicate detailed rule bodies here.

---

## Rule Index

| Rule | File | Use When |
| --- | --- | --- |
| Authority and Reading Order | `.claude/rules/01-authority-and-reading-order.md` | Choosing source of truth and reading order. |
| Architecture Invariants | `.claude/rules/02-architecture-invariants.md` | Architecture, runtime, and platform guardrails. |
| Package Boundaries | `.claude/rules/03-package-boundaries.md` | Package ownership, dependencies, exports, shared placement. |
| Documentation Standards | `.claude/rules/04-documentation-standards.md` | Documentation placement, classification, stale docs. |
| Implementation Quality | `.claude/rules/05-implementation-quality.md` | Code quality and implementation discipline. |
| Planning and Proposals | `.claude/rules/06-planning-and-proposals.md` | Plans, proposals, prompt packages. |
| Execution Gates | `.claude/rules/07-plan-review-and-execution-gates.md` | Approval gates, sensitive operations, completion reporting. |
| Active Context Efficiency | `.claude/rules/08-active-context-efficiency.md` | Avoiding token waste and repeated reads. |
| Skills and Agents Routing | `.claude/rules/09-skills-and-agents-routing.md` | Choosing Skills, agents, hooks, rules, or direct work. |
| Workspace Surface Routing | `.claude/rules/10-workspace-surface-routing.md` | Apps/packages/features/backend/tools/docs routing. |
| Documentation Classification Routing | `.claude/rules/11-document-classification-routing.md` | Current-state/normative/historical/deferred/ADR decisions. |
| Platform Primitive Adoption | `.claude/rules/12-platform-primitive-adoption.md` | Mandatory shared primitive checks. |
| SPFx Runtime and Manifest Routing | `.claude/rules/13-spfx-runtime-and-manifest-routing.md` | SPFx manifests, package truth, hosted/runtime parity. |
| Backend Functions Artifact Routing | `.claude/rules/14-backend-functions-artifact-routing.md` | Azure Functions route/health/artifact/runtime identity. |
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
| Documentation standard | `docs/reference/developer/documentation-authoring-standard.md` |

---

## Default Posture

- Current repo truth controls.
- Read the smallest sufficient source set.
- Route by workspace surface before broad search.
- Use Skills for repeatable workflows.
- Use agents only when specialist review reduces risk.
- Do not inspect archives, logs, build outputs, dependency folders, or historical plans unless explicitly needed.
- Do not execute sensitive operations without explicit approval and the relevant gate.
