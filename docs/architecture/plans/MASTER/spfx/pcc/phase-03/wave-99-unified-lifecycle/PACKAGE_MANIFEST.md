# Package Manifest — PCC Unified Lifecycle Implementation Prompt Set

## Package Name

`pcc_unified_lifecycle_implementation_prompt_set`

## Purpose

Provide a staged implementation prompt package for the PCC Unified Lifecycle layer, aligned to the current Phase 3 PCC implementation posture and the unified lifecycle developer-contract documentation baseline.

## Current Known Baseline

- Latest verified GitHub PCC documentation baseline: `58f53d49d59f8c70683725c999e8f55e2bc2dfef` — `docs(pcc): close unified lifecycle developer documentation`.
- Lockfile MD5 expected from recent closeouts: `c56df7b79986896624536aab74d609f4`.
- Local repo truth must still be revalidated by Prompt 01 before edits.

## Content Inventory

| Path | Purpose |
|---|---|
| `README.md` | Package usage, execution rule, guardrails, prompt sequence. |
| `PACKAGE_MANIFEST.md` | Package inventory and hard usage rules. |
| `manifest.json` | Machine-readable package inventory. |
| `docs/00_EXISTING_UNIFIED_LIFECYCLE_DOCUMENTATION_MAP.md` | Live doc and code seam map. |
| `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` | Required audit questions and baseline assumptions. |
| `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` | Stage sequencing, dependencies, and stop conditions. |
| `prompts/01_*.md` through `prompts/08_*.md` | Local-code-agent prompt sequence. |
| `reference/00_CONTROLLING_OBJECTIVE.md` | Controlling feature identity and architecture objective. |
| `reference/01_REQUIRED_REPO_TRUTH_FILES.md` | Required docs/source files to inspect. |
| `reference/02_REQUIRED_CONTRACTS_STATE_AND_GUARDRAILS.md` | Required contracts, states, security posture, and no-route rules. |
| `reference/03_HARD_GUARDRAILS.md` | Hard implementation prohibitions. |
| `reference/04_VALIDATION_COMMAND_REFERENCE.md` | Validation command catalogue. |
| `reference/05_RESEARCH_PATTERN_REFERENCE.md` | External research/source pattern reference. |

## Hard Usage Rules

1. Prompt 01 is read-only and must run before any implementation prompt.
2. Every prompt must start from current repo truth, not commit summaries alone.
3. Each prompt is no-op aware: if repo truth already satisfies the objective, do not churn files.
4. Do not edit `docs/architecture/plans/**` unless separately authorized.
5. Do not perform broad formatting.
6. Do not change package manifests, lockfiles, deployment manifests, workflows, or tenant state unless a later user-approved prompt explicitly authorizes it.
7. Do not introduce live external integrations. Unified lifecycle remains fixture-first/read-model-safe until tenant/live gates are cleared.

## Package Limitations

This package was generated from available conversation context, the attached Wave 13 package template, GitHub connector commit context, and public web research. It cannot prove the current local worktree state. Prompt 01 must re-run local shell checks inside `/Users/bobbyfetting/hb-intel`.
