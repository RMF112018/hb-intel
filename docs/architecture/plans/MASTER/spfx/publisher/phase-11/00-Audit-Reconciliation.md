# Audit Reconciliation — Original Package vs. Live `main`

## Purpose
This file explains how the original remediation package was reconciled against the live `main` branch of `RMF112018/hb-intel` for `apps/hb-publisher/`.

The original package was not reused as-is. Several prompts described issues that were valid in earlier audit snapshots but are no longer true open remediation items on `main`.

## Original prompt-by-prompt disposition

### Original Prompt 01 — `Realign draft persistence with tenant-required fields`
**Disposition:** retained, substantially rewritten, and narrowed.

**Why:** the underlying issue is still real, but the old prompt under-described the live implementation surface. The current repo already has:
- `createDraftSaveOrchestrator()`
- partial-persistence truthfulness in `useDraftLifecycle.handleSave()`
- template resolution at save time
- publish validation and readiness state derived elsewhere

The replacement prompt focuses on the actual remaining defect: the shell still exposes a misleading first-persistence boundary and does not model save readiness truthfully enough before the user clicks **Save draft**.

### Original Prompt 02 — `Close companyPulse destination contract drift`
**Disposition:** removed as an active remediation prompt.

**Why:** this branch is already operationally quarantined on `main`.
Repo truth now shows:
- schema-complete enum support for `companyPulse`
- `SUPPORTED_DESTINATIONS` currently resolves only `projectSpotlight`
- queue loading is destination-scoped to supported destinations
- unsupported destination messaging and action gating already exist
- closure documentation already records destination scoping

No additional code prompt is warranted unless a fresh audit identifies a new regression.

### Original Prompt 03 — `Close milestoneSpotlight content-type contract drift`
**Disposition:** removed as an active remediation prompt.

**Why:** this branch is already hard-blocked and closure-documented on `main`.
Repo truth now shows:
- `milestoneSpotlight` remains schema-readable but not operational
- publish/republish are blocked in orchestration
- publish/republish are blocked in readiness gating
- milestone validation profile is intentionally removed
- milestone persistence is intentionally omitted from the writer
- targeted tests already pin the policy

The original prompt would have sent the local code agent after a branch that the repo has already intentionally closed.

### Original Prompt 04 — `Close scheduled state dead branch`
**Disposition:** removed as an active remediation prompt.

**Why:** the dead-branch issue is already closed on `main`.
Repo truth now shows:
- `scheduled` included in `DRAFT_GROUP_ORDER`
- `scheduled` included in `COLLAPSED_GROUPS_BY_DEFAULT`
- legacy notice is rendered in the shell
- inbound transitions remain forbidden
- targeted queue-rail tests already exist
- closure documentation already records the chosen policy

The original prompt is stale.

### Original Prompt 05 — `Harden promotion-rule failure handling`
**Disposition:** retained, substantially rewritten.

**Why:** the issue is still open.
Repo truth still shows silent fallback:
- promotion rules are loaded in `useDraftWorkspace`
- repository failure is caught
- the workspace silently substitutes `[]`
- the shell does not clearly distinguish **true empty configuration** from **failed rule load**

The replacement prompt expands the affected implementation surface and adds explicit health-state, messaging, and regression expectations.

### Original Prompt 06 — `Add template-registry preflight health checks`
**Disposition:** retained, substantially rewritten, and strengthened.

**Why:** the issue is still open, but the old prompt was too narrow.
Repo truth shows:
- template resolution is critical to save and publish
- empty/unusable template registry is only discovered reactively
- bootstrap health is not modeled as a first-class shell state
- the queue/readiness surfaces do not provide an early, explicit environment-health signal

The replacement prompt closes this as an authoring-health problem, not just a later save failure.

## Added remediation prompt

### New Prompt 04 — `Regression proof, build validation, and closure reporting`
**Why it was added:** the original package lacked a hard closure step that forces the local code agent to prove the remediation package actually closes cleanly in the live application.

The replacement package now requires:
- targeted regression tests
- `check-types`
- `build`
- scoped closure reporting that explains exactly what changed and what was proven

## Net package change
The enhanced package is intentionally smaller in issue count than the original package, because it removes stale items and adds one explicit closure-proof step.

That is a feature, not a loss of coverage.
The package is now aligned to the actual live gaps instead of older audit-state shorthand.
