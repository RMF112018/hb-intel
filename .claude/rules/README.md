# HB Claude Rules File Set Index

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

| Layer | Location | Role | Use When |
| --- | --- | --- | --- |
| Root operating brief | `CLAUDE.md` | High-level behavior, priorities, and invariant posture. | Starting a task or checking overall Claude behavior. |
| Rule router | `.claude/rules.md` | Detailed rule index and source-of-truth routing. | Choosing which rule, Skill, agent, or source applies. |
| Detailed rules | `.claude/rules/*.md` | Modular durable policy files. | Applying topic-specific operating guidance. |
| Project rules | `.claude/rules/projects/*.md` | Product/phase-specific rules. | PCC or other project-specific work. |
| Agents | `.claude/agents/*.md` | Specialist reviewers and investigators. | Focused expert review or investigation is needed. |
| Skills | `.claude/skills/*/SKILL.md` | Repeatable workflow playbooks. | A known workflow repeats often enough to standardize. |
| Hooks | `.claude/hooks/*` | Deterministic local enforcement. | Path/command behavior should be blocked or allowed without model judgment. |
| Settings | `.claude/settings*.json` | Tool permissions and environment-specific configuration. | Tool allow/ask/deny posture or hook registration is needed. |

---

## Rule Inventory and Use Cases

| Rule | File | Use When |
| --- | --- | --- |
| 01 — Authority and Reading Order | `01-authority-and-reading-order.md` | Choosing source of truth, reading order, repo-truth evidence, specialist agent, Skill, or verification source. |
| 02 — Architecture Invariants | `02-architecture-invariants.md` | Protecting package direction, shared primitives, architecture guardrails, app shell behavior, auth, provisioning, routing, or runtime doctrine. |
| 03 — Package Boundaries | `03-package-boundaries.md` | Adding/moving code across packages, changing exports, adding dependencies, deciding ownership, or reviewing shared-code placement. |
| 04 — Documentation Standards | `04-documentation-standards.md` | Creating/updating docs, deciding doc placement, preserving canonical docs, avoiding scratch-plan pollution, or resolving documentation authority overlap. |
| 05 — Implementation Quality | `05-implementation-quality.md` | Writing or reviewing code for correctness, maintainability, testability, typing, minimal scope, and behavior preservation. |
| 06 — Planning and Proposals | `06-planning-and-proposals.md` | Preparing plans, proposals, prompt packages, better-path recommendations, saved planning artifacts, or canonical plan updates. |
| 07 — Plan Review and Execution Gates | `07-plan-review-and-execution-gates.md` | Prompt-package, phase/wave, risky, cross-cutting, architecture, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permissions, or CI/CD work. |
| 08 — Active Context Efficiency | `08-active-context-efficiency.md` | Avoiding unnecessary repeated reads while preserving repo-truth verification. |
| 09 — Skills and Agents Routing | `09-skills-and-agents-routing.md` | Deciding whether to use a Skill, specialist agent, rule file, hook, or direct work path. |
| PCC Phase 3 Active Rules | `projects/pcc-phase-3.md` | Project Control Center work, especially Phase 3 shell-frame, UI/UX, module, planning, roadmap, or provisioning-boundary work. |

---

## Routing by Situation

| Situation | Start With |
| --- | --- |
| Need to know what to read first | `01-authority-and-reading-order.md` |
| Architecture or platform boundary risk | `02-architecture-invariants.md` |
| Package ownership or dependency direction | `03-package-boundaries.md` |
| Documentation placement or stale docs | `04-documentation-standards.md` |
| Code implementation quality | `05-implementation-quality.md` |
| Plan, proposal, prompt package, or better path | `06-planning-and-proposals.md` |
| Approval gate, sensitive operation, or execution control | `07-plan-review-and-execution-gates.md` |
| Avoiding repeated file reads | `08-active-context-efficiency.md` |
| Whether to use a Skill or agent | `09-skills-and-agents-routing.md` |
| PCC work | `projects/pcc-phase-3.md` |

---

## Skill / Agent Cross-Routing

| Rule Area | Related Skill | Related Agent |
| --- | --- | --- |
| Repo-truth reading order | `hb-repo-truth-audit` | `hb-repo-researcher` |
| Package boundaries | None by default | `hb-boundary-auditor` |
| Documentation standards | `hb-doc-authority-cleanup` | `hb-docs-curator` |
| Planning and prompt packages | `hb-prompt-package-builder`; `hb-plan-gate-review` | `hb-implementation-plan-reviewer` |
| Execution closeout | `hb-post-execution-closeout` | `hb-commit-diff-auditor` |
| Validation | `hb-verification-router` | `hb-verification-runner` |
| Sensitive operations | `hb-sensitive-operation-gate` | `hb-security-and-secrets-auditor`; `hb-tenant-deployment-gatekeeper` |
| SPFx parity | `hb-spfx-runtime-parity` | `hb-spfx-runtime-parity-auditor` |
| UI doctrine | `hb-ui-doctrine-conformance` | `hb-ui-ux-conformance-reviewer` |
| PCC | `hb-pcc-phase-router` | context-dependent |
| Claude config | `hb-skill-author` where Skills are involved | `hb-claude-config-curator` |

---

## Maintenance Rules

- Keep `.claude/rules.md` concise.
- Put detailed policy in numbered rule files.
- Put project-specific rules under `.claude/rules/projects/`.
- Keep agents as reviewers/investigators.
- Keep Skills as reusable workflow playbooks.
- Keep hooks deterministic and indexed.
- Do not duplicate long rule blocks across agents, Skills, and root files.
- When a rule changes, update all routing references that point to it.
- When current repo truth contradicts these rules, verify the current file and update the rule set rather than relying on stale guidance.
