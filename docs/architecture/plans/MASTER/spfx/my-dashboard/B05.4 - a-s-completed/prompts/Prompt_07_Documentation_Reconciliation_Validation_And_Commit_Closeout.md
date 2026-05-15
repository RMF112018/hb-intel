# Prompt 07 — Documentation Reconciliation, Validation, and Commit Closeout

You are working in the HB Intel repo.

## Context-efficiency rule

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

You may reopen a file only when:

1. it is not currently in context;
2. repo state has changed after an earlier prompt;
3. you need exact wording, exact exported symbols, or exact line-accurate edit context;
4. you need to resolve a contradiction or implementation blocker.

## Mandatory preflight

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

Rules:

- Record unrelated pre-existing working-tree changes.
- Do not stage unrelated files.
- Do not use `git add .`.
- Do not change `pnpm-lock.yaml`.
- Do not run dependency-install commands.

## Prompt title

Adobe Sign Completed Toggle — Prompt 07 — Documentation Reconciliation and Scoped Validation Closeout

## Objective

Reconcile the repo documentation so it accurately describes the completed implementation and no stale `Action Queue`-only posture remains where the new feature must be documented.

## Why this prompt exists now

The feature changes not only code but also the product doctrine:

- the Adobe card is still one card;
- the header/title slot is now a view toggle;
- the card has two read-model lanes;
- the completed route exists;
- the state matrices and route map must reflect completed view behavior.

Leaving stale docs would create the next implementation drift.

## Current repo truth

Inspect as required:

```text
apps/my-dashboard/README.md
docs/reference/spfx-surfaces/my-dashboard/adobe-sign-authorization-required-flow.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B04/02_B04_Target_Contracts_And_Route_Map.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/docs/05-Target-Module-State-Matrices.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/prompts/Prompt-03-Consolidate-Adobe-Sign-Into-One-Module-Card.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_My_Work_Adobe_Sign_Comprehensive_Development_Plan.md
```

## Intended future state

### README

Update to describe:

- Adobe Sign single card;
- header views:
  - `Action Queue`
  - `Completed`
- lazy completed retrieval;
- completed route/read-only posture;
- pending route preserved.

### Authorization-required reference

Clarify:

- when Adobe auth is required, the whole card remains connect-focused;
- the completed header toggle is hidden in auth-required posture;
- after Adobe access is available, the data-capable card exposes both views.

### B04 route/contract map

Add:

- new route key/path;
- new completed DTO family;
- route/query validation posture;
- fixture matrix.

### B05.3 module-state matrix

Add:

- header-toggle behavior;
- toggle visibility rules;
- completed view loading/empty/populated/partial/degraded states;
- copy expectations.

### B05.3 single-card prompt authority

Reconcile the prior prompt doctrine so “one card per module” explicitly allows this **in-header view selector** and does not imply a static `Action Queue` card title forever.

### Comprehensive development plan

Update stale posture so it no longer describes:

- focused-module assumptions that are now inaccurate;
- Adobe Sign as pending-only after the completed feature exists.

## Exact documentation scope

Allowed files:

```text
apps/my-dashboard/README.md
docs/reference/spfx-surfaces/my-dashboard/adobe-sign-authorization-required-flow.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B04/02_B04_Target_Contracts_And_Route_Map.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/docs/05-Target-Module-State-Matrices.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/prompts/Prompt-03-Consolidate-Adobe-Sign-Into-One-Module-Card.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_My_Work_Adobe_Sign_Comprehensive_Development_Plan.md
```

## Explicit non-scope

Do not:

- add product code changes;
- add tests unless a documentation-adjacent test string reference must be updated to keep current tests passing;
- touch backend/frontend code merely to match preferred prose;
- touch manifests, workflows, lockfile, package files, or deployment code.

## Required verification / burden of proof

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/spfx-my-dashboard check-types
git diff --check
md5 pnpm-lock.yaml
```

Run targeted prettier/markdown formatting check if the repo provides one; otherwise run prettier check on the touched docs only if that is already repo-standard and available.

Before commit:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Stage only Prompt 07 documentation files explicitly.

## Required output artifacts

Return:

1. implementation decision;
2. docs updated;
3. exact stale-posture contradictions removed;
4. validations run/results;
5. lockfile MD5 before/after;
6. staged-file proof;
7. commit hash.

## Expected commit summary

```text
docs(my-dashboard): document Adobe Sign completed header-toggle lane
```

## Expected commit body

```text
Reconcile My Dashboard Adobe Sign documentation after the completed-agreements implementation.

- Document the in-header Action Queue / Completed view selector inside the single Adobe Sign card.
- Add the recent-completions route, DTO family, and lazy read-model posture to the contract map and README.
- Extend the Adobe state matrices and authorization-required reference with completed-view visibility and state rules.
- Correct stale prompt/development-plan language that no longer matches the implemented single-card, dual-view posture.

Validation:
- pnpm --filter @hbc/models check-types
- pnpm --filter @hbc/functions check-types
- pnpm --filter @hbc/spfx-my-dashboard check-types
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 07 is complete only when:

- docs accurately reflect the implemented behavior;
- no governed doc still presents the Adobe card as permanently pending-only where it discusses current state;
- route/DTO/state documentation is complete;
- check-types and diff checks pass;
- lockfile remains unchanged;
- docs commit landed.
