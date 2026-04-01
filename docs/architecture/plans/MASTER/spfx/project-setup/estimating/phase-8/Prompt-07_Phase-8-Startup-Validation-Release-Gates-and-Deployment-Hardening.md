# Prompt-07 — Phase 8 Startup Validation, Release Gates, and Deployment Hardening

## Objective

Harden startup validation and release-readiness controls so missing production prerequisites fail clearly, intentionally, and in the right places, without broad false blockers or misleading narrow-demo success.

## Context

The current repo has improved tiered validation, but at least some production-critical settings still appear to fail at module-load time or remain only partially represented as release gates.

## Required Working Rules

- Do not over-harden local dev or UI-review paths unnecessarily.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction, inspect exact evidence, or resolve an ambiguity.
- Prefer precise, scope-aware validation over broad global blockers.
- Preserve production correctness over convenience.

## Tasks

### 1. Audit current startup validation behavior
Determine exactly which settings:
- fail at module import / host startup
- fail on first route invocation
- only warn
- should instead be represented as deployment or release gates

Pay special attention to:
- `API_AUDIENCE`
- identity-related settings
- SharePoint access settings
- any route families that still force broader-than-needed validation

### 2. Improve scope-aware hardening
Implement the best justified changes to:
- reduce inappropriate global boot blockers
- retain hard failure where a true production prerequisite is missing
- improve diagnostics so the reason is explicit
- prevent ambiguous partial startup success where production functionality is not actually viable

### 3. Reconcile readiness logic across layers
Ensure readiness posture is coherent across:
- packaging/build
- SPFx shell/runtime config
- frontend production-mode gating
- backend startup/config validation
- deployment/release documentation

### 4. Strengthen release gating artifacts
Update any relevant acceptance/readiness docs so that deployment cannot be honestly marked ready while critical prerequisites remain unmet.

## Deliverables

### Code / Repo Deliverables
- improved validation scope and diagnostics
- any justified readiness-gate refinements
- alignment improvements across shell/frontend/backend/deployment layers

### Documentation Deliverables
Update the Phase 8 report with:
- startup-validation findings
- changes made
- remaining true external blockers
- files changed
- closure statement for Prompt-07
- carry-forward items for Prompt-08+

## Completion Standard

This prompt is complete only when the repo’s readiness posture is coherent and does not depend on hidden assumptions or demo-path luck.
