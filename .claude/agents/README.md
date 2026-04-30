# HB Claude Agents Index

## Purpose

Agents are specialist reviewers and investigators. Use them only when specialist review reduces risk.

---

## Agents

| Agent | Use For |
| --- | --- |
| `hb-security-and-secrets-auditor` | Secrets, tokens, app settings, auth proof, sensitive artifacts. |
| `hb-tenant-deployment-gatekeeper` | Tenant mutation, Azure, app catalog, Graph/PnP, CI/CD, permissions, rollout. |
| `hb-spfx-runtime-parity-auditor` | SPFx source/build/manifest/runtime/hosted parity. |
| `hb-boundary-auditor` | Package ownership, dependency direction, exports. |
| `hb-implementation-plan-reviewer` | Plan approval, overreach review, execution-scope review. |
| `hb-verification-runner` | Validation selection and failure classification. |
| `hb-docs-curator` | Documentation authority, placement, drift, redundancy. |
| `hb-ui-ux-conformance-reviewer` | UI doctrine, accessibility, responsive behavior, product quality. |
| `hb-commit-diff-auditor` | Post-execution diff scope and commit-summary accuracy. |
| `hb-claude-config-curator` | Claude config alignment across rules, agents, Skills, hooks, settings. |
| `hb-repo-researcher` | Unknown repo areas and broad repo-truth mapping. |

---

## Escalation Order

1. security/secrets
2. tenant/deployment
3. SPFx parity
4. package boundaries
5. plan review
6. verification
7. documentation
8. UI/UX
9. Claude config
10. repo research

Do not call agents as ceremony.
