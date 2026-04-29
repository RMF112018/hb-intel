# HB Claude Agent Index

## Purpose

This directory contains specialist reviewer agents for the `hb-intel` repository. Use them to reduce context load, improve repo-truth review quality, and enforce the correct boundary for implementation, documentation, UI/UX, verification, security, deployment, and post-execution validation work.

Specialists are reviewers/investigators unless their individual file explicitly says otherwise. They should not replace the root agent’s responsibility to follow `CLAUDE.md` and `.claude/rules.md`.

---

## Agent Index

| Agent | Use For | Do Not Use For |
|---|---|---|
| `hb-repo-researcher` | Unfamiliar repo areas, cross-package impact, authority/doc routing, current repo-truth mapping, plan-to-repo alignment. | Routine local edits when the root agent already has enough context. |
| `hb-boundary-auditor` | Package placement, dependency direction, ownership, shared-boundary questions, layer-fit review. | Documentation routing or test-command selection. |
| `hb-implementation-plan-reviewer` | Reviewing local implementation plans and post-execution reports before proceeding. | Acting as the implementation agent. |
| `hb-verification-runner` | Choosing/running the smallest credible validation set and interpreting failures. | Package-boundary placement or documentation routing. |
| `hb-docs-curator` | Documentation impact, placement, drift, redundancy, source-of-truth routing, authority overlap. | Test-command selection or package-boundary placement unless the issue is documentation ownership. |
| `hb-ui-ux-conformance-reviewer` | UI ownership, `@hbc/ui-kit` fit, token/primitive/surface-family placement, SPFx/PWA UX consistency, basis-of-design review. | Editing files or forcing centralization when local ownership is better. |
| `hb-security-and-secrets-auditor` | Secrets, tokens, app settings, auth proofs, Key Vault, Graph/PnP, Procore, sensitive logs/reports, redaction posture. | General package placement or routine validation. |
| `hb-tenant-deployment-gatekeeper` | Tenant mutation, app catalog deployment, Azure deployment, CI/CD, Graph/PnP live calls, SharePoint provisioning, permission mutation, rollout gates. | Normal local implementation review when no tenant/deployment risk exists. |
| `hb-spfx-runtime-parity-auditor` | SPFx source/build/manifest/runtime/hosted parity, Vite/IIFE mounts, full-page shell behavior, app catalog readiness review. | General UI aesthetics or non-SPFx package review. |
| `hb-commit-diff-auditor` | Post-execution diff scope, unrelated churn, package/manifest/lockfile drift, commit summary accuracy. | Initial planning or implementation. |

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
9. `hb-repo-researcher`

This is not a strict call order. Use judgment. For unfamiliar areas, `hb-repo-researcher` may come first to establish repo truth.

---

## Common Routing Examples

| Task | Recommended Agent |
|---|---|
| “Where should this code live?” | `hb-boundary-auditor` |
| “Does this plan overreach?” | `hb-implementation-plan-reviewer` |
| “Did the execution match the approved scope?” | `hb-commit-diff-auditor` |
| “What validation should we run?” | `hb-verification-runner` |
| “Do docs need to change?” | `hb-docs-curator` |
| “Is this UI consistent with the basis of design?” | `hb-ui-ux-conformance-reviewer` |
| “Could this leak tokens or app settings?” | `hb-security-and-secrets-auditor` |
| “Does this touch tenant/deployment risk?” | `hb-tenant-deployment-gatekeeper` |
| “Will this SPFx source actually run in SharePoint?” | `hb-spfx-runtime-parity-auditor` |
| “What exists in this area?” | `hb-repo-researcher` |

---

## Operating Rules

- Use the smallest useful specialist.
- Do not call specialists for trivial local tasks.
- Do not use specialists as ceremony.
- Do not let a specialist override explicit user instructions or current repo truth.
- If a specialist finds uncertainty, report it clearly.
- If a specialist recommends escalation, identify the specific next source or next agent.
- For phase/wave work, check the active prompt package and current closeouts before relying on historical plans.
- For security, tenant, deployment, Graph/PnP, Procore, or CI/CD risk, require explicit authorization before execution.