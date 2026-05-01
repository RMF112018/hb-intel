# PCC Phase 3 Wave 8 — Project Readiness Module Framework Prompt Bundle

Generated: 2026-05-01  
Repository: `RMF112018/hb-intel`  
Local execution path: `/Users/bobbyfetting/hb-intel`  
Target wave: **PCC Phase 3 / Wave 8 — Project Readiness Module Framework**  
User-facing surface: **Project Readiness Center**

## Purpose

This ZIP is a local-code-agent prompt bundle for implementing **Wave 8 — Project Readiness Module Framework** in a controlled, repo-truth-driven sequence.

Wave 8 is the reusable readiness framework and Project Readiness Center shell. It must establish normalized readiness domains, lifecycle gates, posture/status semantics, ownership, blockers, evidence posture, source health, degraded states, and downstream-module integration seams without implementing Wave 9 checklist content or later module-owned workflows.

## How to use this bundle

1. Unzip this package.
2. Give your local code agent one prompt file at a time, in sequence.
3. Do not skip Prompt 01. Prompt 01 is the authorization/scope-lock gate that resolves the current repo-truth tension: Wave 8 is correctly planned as a framework, but existing scope-lock language previously excluded runtime implementation.
4. Require a commit and closeout after each prompt before moving to the next prompt.
5. Do not allow broad staging. Each prompt requires explicit path staging only.

## Execution order

| Order | File | Purpose |
| ---: | --- | --- |
| 0 | `00_EXISTING_WAVE_8_PLANNING_DOCUMENTATION_MAP.md` | Planning/source map for the agent before Prompt 01. |
| 1 | `prompts/01_REPO_TRUTH_GATE_RESEARCH_SCOPE_LOCK.md` | Authorize bounded implementation posture and update docs. |
| 2 | `prompts/02_SHARED_READINESS_MODELS_FIXTURES.md` | Add shared readiness framework contracts and deterministic fixtures. |
| 3 | `prompts/03_BACKEND_MOCK_PROVIDER_GET_ROUTE.md` | Add GET-only backend mock read-model extension, if authorized. |
| 4 | `prompts/04_SPFX_FIXTURE_CLIENT_PARITY.md` | Add SPFx fixture/client parity and API guardrail tests. |
| 5 | `prompts/05_PROJECT_READINESS_CENTER_SHELL.md` | Build the Project Readiness Center framework shell/cards. |
| 6 | `prompts/06_READINESS_SUMMARIES_GUARDRAILS.md` | Add ownership, evidence, blocker, risk, source-health, and Priority Actions summaries. |
| 7 | `prompts/07_WAVE_8_CLOSEOUT_VALIDATION.md` | Final validation and Wave 8 closeout documentation. |

## Mandatory local-agent controls

Every prompt file repeats these controls, but they are listed here for package-level clarity:

- Begin with `git status --short`, `git branch --show-current`, `git log --oneline -20`, and `md5 pnpm-lock.yaml`.
- Record unrelated pre-existing changes and do not stage them.
- Do not use `git add .`.
- Use explicit path staging only.
- Run `git diff --check`.
- Record `pnpm-lock.yaml` md5 before and after.
- Do not run `pnpm install`, `pnpm add`, or `pnpm update` unless explicitly authorized.
- Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Package files

```text
README.md
00_EXISTING_WAVE_8_PLANNING_DOCUMENTATION_MAP.md
prompts/01_REPO_TRUTH_GATE_RESEARCH_SCOPE_LOCK.md
prompts/02_SHARED_READINESS_MODELS_FIXTURES.md
prompts/03_BACKEND_MOCK_PROVIDER_GET_ROUTE.md
prompts/04_SPFX_FIXTURE_CLIENT_PARITY.md
prompts/05_PROJECT_READINESS_CENTER_SHELL.md
prompts/06_READINESS_SUMMARIES_GUARDRAILS.md
prompts/07_WAVE_8_CLOSEOUT_VALIDATION.md
docs/01_REPO_TRUTH_AUDIT_FINDINGS.md
docs/02_WEB_RESEARCH_AND_PRODUCT_RATIONALE.md
docs/03_IMPLEMENTATION_STRATEGY_AND_OPEN_DECISIONS.md
docs/04_FUTURE_WAVE_HANDOFF_RISK_AND_STANDARDS.md
reference/PCC_Phase_3_Wave_8_Full_Web_Enhanced_Source_Package.md
```

## Scope boundary

Wave 8 may add framework contracts, deterministic fixtures, read-only read-model shape, mock provider support, fixture/client parity, and presentational SPFx UI.

Wave 8 must not implement live Graph file operations, SharePoint list mutation, tenant mutation, permission mutation, Procore runtime/writeback, external-system writeback, actual approval/workflow execution, Power Automate flows, secrets/app settings, SPFx packaging/deployment, or production rollout.
