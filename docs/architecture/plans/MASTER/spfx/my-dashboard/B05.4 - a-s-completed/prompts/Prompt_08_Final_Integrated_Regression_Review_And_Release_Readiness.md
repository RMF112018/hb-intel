# Prompt 08 — Final Integrated Regression Review and Release Readiness

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

Adobe Sign Completed Toggle — Prompt 08 — Integrated Regression Audit and Release-Readiness Closeout

## Objective

Perform the final integrated audit across the completed implementation, remediate any remaining **in-scope** defects discovered, run the full validation ledger, and return a release-readiness verdict.

## Why this prompt exists now

Prompts 02–07 land the feature in dependency order. Prompt 08 prevents partial closure by requiring an integrated review across:

- models;
- backend route/adapter/provider/search seam;
- frontend client/hook/view-model;
- header toggle rendering;
- docs;
- regression validation.

## Required integrated inspection

Review the implemented feature against these closed expectations:

### UI

- single Adobe card only;
- header title slot is now the `Action Queue` / `Completed` toggle;
- no body-level duplicate tab row;
- `Action Queue` selected by default;
- visual emphasis swaps correctly;
- completed view lazy-fetches;
- all completed states render correctly;
- toggle hidden in whole-card unavailable/auth/config/principal/loading states.

### Data architecture

- pending route untouched in behavior;
- completed lane uses sibling DTOs;
- completed route exists;
- home envelope remains pending-only;
- provider-side bounded completed search semantics are used;
- sourceOpenUrl policy reused.

### Telemetry

- query intent differentiates pending vs completed search;
- `adobeSign.read.recentCompletions.result` exists;
- diagnostics remain sanitized.

### Docs

- README, route map, state matrix, authorization doc, prompt authority, comprehensive plan reconciled.

## Files/seams to inspect

Use a targeted full-pass review across:

```text
packages/models/src/myWork/**
backend/functions/src/hosts/my-work-read-model/**
apps/my-dashboard/src/api/**
apps/my-dashboard/src/modules/adobeSign/**
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/README.md
docs/reference/spfx-surfaces/my-dashboard/adobe-sign-authorization-required-flow.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B04/02_B04_Target_Contracts_And_Route_Map.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/docs/05-Target-Module-State-Matrices.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.3 - ui remidiation/prompts/Prompt-03-Consolidate-Adobe-Sign-Into-One-Module-Card.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_My_Work_Adobe_Sign_Comprehensive_Development_Plan.md
```

## Required final validation ledger

Run all:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
git diff --check
md5 pnpm-lock.yaml
```

## Remediation authority

If a defect is discovered that is:

- clearly within the completed-toggle scope;
- necessary to satisfy this package’s closed acceptance criteria;
- safe to fix without deployment or unrelated drift;

then fix it in this prompt, validate it, and commit it.

If no defect remains, do not create a no-op commit. Return a no-change validation closeout.

## Explicit non-scope

Do not:

- deploy;
- run live tenant mutation;
- run live Adobe requests;
- alter unrelated modules;
- touch manifests, workflows, lockfile, package dependencies, or package versions;
- broaden into future analytics, pagination UI beyond current card preview requirements, or cross-user history.

## Required final output

Return:

1. **Release-readiness decision**
   - `READY`
   - `READY WITH EXPLICIT NON-BLOCKING NOTES`
   - `NOT READY`

2. **Integrated audit findings**
   - models
   - backend
   - frontend
   - docs
   - telemetry

3. **Residual remediation**
   - none, or exact changes made in Prompt 08

4. **Full validation ledger results**

5. **Lockfile MD5 before/after**

6. **Staged-file proof**
   - only when remediation changes occurred

7. **Commit result**
   - exact commit hash if changes were made
   - or `No commit — validation-only closeout`

8. **Final acceptance checklist**
   - every package acceptance criterion marked pass/fail.

## Expected commit summary

If remediation changes are required:

```text
adobe-sign: close completed toggle integration gaps
```

If no changes are required:

```text
No commit — validation-only closeout.
```

## Expected commit body

If remediation changes are required:

```text
Close the final in-scope integration gaps for the Adobe Sign completed header-toggle feature.

- Remediate only defects required to satisfy the locked single-card completed implementation contract.
- Preserve the working pending action queue, bounded recent-completions read-model lane, and sanitized telemetry posture.
- Complete full cross-package validation and final release-readiness review.

Validation:
- pnpm --filter @hbc/models check-types
- pnpm --filter @hbc/models test
- pnpm --filter @hbc/functions check-types
- pnpm --filter @hbc/functions test
- pnpm --filter @hbc/functions build
- pnpm --filter @hbc/spfx-my-dashboard check-types
- pnpm --filter @hbc/spfx-my-dashboard test
- pnpm --filter @hbc/spfx-my-dashboard build
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 08 is complete only when:

- the full feature is reviewed as one integrated system;
- every required validation command is run;
- any remaining in-scope defect is fixed;
- lockfile remains unchanged;
- the agent returns an explicit readiness verdict.
