# HB Claude Agent Index

## Purpose

This directory contains project-level Claude Code subagents for the `hb-intel` repository.

Use these agents as specialist reviewers and investigators. They preserve the main Claude Code thread by moving focused research, audit, review, verification-routing, and risk-gating work into separate context windows.

Agents are **not** workflow prompts. Reusable workflows belong in `.claude/skills/`.

---

## Operating Model

| Layer | Purpose |
| --- | --- |
| `CLAUDE.md` | Root operating brief and standing posture. |
| `.claude/rules.md` and `.claude/rules/**` | Durable guardrails, reading order, architecture invariants, and project rules. |
| `.claude/skills/**` | Repeatable workflows and user/model-invoked playbooks. |
| `.claude/agents/**` | Specialist reviewers/investigators with separate context windows. |
| `.claude/hooks/**` | Deterministic enforcement. |
| `.claude/settings*.json` | Permissions, ask/allow/deny posture, and local configuration. |

---

## Agent Inventory and Use Cases

| Agent | Use For | Do Not Use For |
| --- | --- | --- |
| `hb-repo-researcher` | Unfamiliar repo areas, cross-package impact, authority/doc routing, current repo-truth mapping, plan-to-repo alignment. | Routine local edits when the main thread already has enough current context. |
| `hb-boundary-auditor` | Package placement, dependency direction, ownership, shared-boundary questions, layer-fit review, public export impact. | Documentation routing or validation-command selection. |
| `hb-implementation-plan-reviewer` | Reviewing implementation plans before execution and evaluating whether a plan is safe to approve. | Performing the implementation. |
| `hb-verification-runner` | Choosing/running the smallest credible validation set and interpreting validation failures. | Package-boundary ownership or documentation-authority review. |
| `hb-docs-curator` | Documentation impact, placement, drift, redundancy, source-of-truth routing, authority overlap. | Test-command selection or package-boundary placement unless the issue is documentation ownership. |
| `hb-ui-ux-conformance-reviewer` | UI ownership, `@hbc/ui-kit` fit, token/primitive/surface-family placement, SPFx/PWA UX consistency, accessibility, basis-of-design review. | Editing files or forcing centralization when local ownership is better. |
| `hb-security-and-secrets-auditor` | Secrets, tokens, app settings, auth proofs, Key Vault, Graph/PnP, Procore, sensitive logs/reports, redaction posture. | General package placement or routine validation. |
| `hb-tenant-deployment-gatekeeper` | Tenant mutation, app catalog deployment, Azure deployment, CI/CD, Graph/PnP live calls, SharePoint provisioning, permission mutation, rollout gates. | Normal local implementation review when no tenant/deployment risk exists. |
| `hb-spfx-runtime-parity-auditor` | SPFx source/build/manifest/runtime/hosted parity, Vite/IIFE mounts, full-page shell behavior, app catalog readiness review. | General UI aesthetics or non-SPFx package review. |
| `hb-commit-diff-auditor` | Post-execution diff scope, unrelated churn, package/manifest/lockfile drift, validation-claim accuracy, commit-summary accuracy. | Initial planning or implementation. |
| `hb-claude-config-curator` | Claude Code configuration consistency across `CLAUDE.md`, rules, agents, Skills, hooks, settings, indexes, and package routing. | Product implementation or repo-wide feature audits. |

---

## Routing by Situation

| Situation | Recommended Agent |
| --- | --- |
| Unknown repo area or unclear source of truth | `hb-repo-researcher` |
| "Where should this code live?" | `hb-boundary-auditor` |
| New package dependency, changed export, shared UI ownership | `hb-boundary-auditor` |
| "Does this plan overreach?" | `hb-implementation-plan-reviewer` |
| "Can I approve this agent plan?" | `hb-implementation-plan-reviewer` |
| "What validation should we run?" | `hb-verification-runner` |
| Failing validation with unclear scope | `hb-verification-runner` |
| Documentation drift, stale references, README updates | `hb-docs-curator` |
| UI doctrine, `@hbc/ui-kit`, basis-of-design, accessibility | `hb-ui-ux-conformance-reviewer` |
| Secrets, tokens, app settings, auth proofs, sensitive artifacts | `hb-security-and-secrets-auditor` |
| Azure, app catalog, Graph/PnP, Procore, CI/CD, tenant mutation | `hb-tenant-deployment-gatekeeper` |
| SPFx package/runtime/manifest/hosted parity | `hb-spfx-runtime-parity-auditor` |
| "Did the execution match the approved scope?" | `hb-commit-diff-auditor` |
| "Are the Claude Code config files aligned?" | `hb-claude-config-curator` |

---

## Skill-to-Agent Bridge

| Skill | Primary Agent Partner |
| --- | --- |
| `hb-repo-truth-audit` | `hb-repo-researcher` |
| `hb-plan-gate-review` | `hb-implementation-plan-reviewer` |
| `hb-post-execution-closeout` | `hb-commit-diff-auditor` |
| `hb-verification-router` | `hb-verification-runner` |
| `hb-sensitive-operation-gate` | `hb-tenant-deployment-gatekeeper`; `hb-security-and-secrets-auditor` |
| `hb-spfx-runtime-parity` | `hb-spfx-runtime-parity-auditor` |
| `hb-ui-doctrine-conformance` | `hb-ui-ux-conformance-reviewer` |
| `hb-doc-authority-cleanup` | `hb-docs-curator` |
| `hb-pcc-phase-router` | `hb-repo-researcher`; `hb-implementation-plan-reviewer`; domain-specific rules |
| `hb-skill-author` | `hb-claude-config-curator` |
| `hb-brand-asset-governance` | `hb-ui-ux-conformance-reviewer`; `hb-docs-curator` |

---

## Escalation Priority

When multiple specialists could apply, use the highest-risk relevant specialist first:

1. `hb-security-and-secrets-auditor`
2. `hb-tenant-deployment-gatekeeper`
3. `hb-spfx-runtime-parity-auditor`
4. `hb-boundary-auditor`
5. `hb-implementation-plan-reviewer`
6. `hb-verification-runner`
7. `hb-docs-curator`
8. `hb-ui-ux-conformance-reviewer`
9. `hb-commit-diff-auditor`
10. `hb-claude-config-curator`
11. `hb-repo-researcher`

This is not a rigid call order. For unfamiliar areas, `hb-repo-researcher` may come first to establish repo truth.

---

## Operating Rules

- Use the smallest useful specialist.
- Do not call specialists as ceremony.
- Do not call specialists for trivial local tasks.
- Do not let a specialist override explicit user instructions, current repo truth, or higher-priority system instructions.
- Specialists should return findings, evidence, uncertainty, and recommended next action.
- Specialists do not stage, commit, push, deploy, mutate tenants, or make product edits unless an individual file explicitly says otherwise.
- For phase/wave work, inspect the active prompt package and closeouts before relying on historical plans.
- For security, tenant, deployment, Graph/PnP, Procore, CI/CD, or permission risk, require explicit authorization before execution.
- If a specialist finds a config/path mismatch, report the mismatch directly and recommend the smallest correction.

---

## Subagent Format Notes

Each agent uses current Claude Code subagent frontmatter:

```yaml
---
name: agent-name
description: Natural-language invocation description.
tools: Read, Glob, Grep
model: sonnet
---
```

Unsupported or nonstandard frontmatter fields are intentionally omitted. Permissions should be governed through Claude Code settings and command allow/ask/deny rules, not agent-local custom fields.
