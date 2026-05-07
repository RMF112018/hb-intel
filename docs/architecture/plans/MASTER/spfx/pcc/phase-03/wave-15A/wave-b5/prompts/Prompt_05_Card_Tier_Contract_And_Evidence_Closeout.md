# Prompt 05 — Card-Tier Contract Updates and Evidence Closeout

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Readiness remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory.
- Do not touch unrelated dirty files.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, or manifests.
- Do not modify `PccBentoGrid`, `PccDashboardCard`, or `footprints.ts` unless a blocking validation failure proves this remediation cannot be completed otherwise. If that happens, stop and report the exact evidence before editing primitives.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, external launches, mutations, or API side effects.
- Preserve read-only/source-confidence/HBI/source-of-record boundary language.
- Keep all implementation within the Project Readiness surface and its tests unless this prompt explicitly names another file.

## Objective

Update card-tier/direct-child contract tests for the new command/detail structure and prepare evidence closeout guidance. This prompt should not change product behavior unless a test reveals a legitimate defect.

## Primary files

```text
apps/project-control-center/src/tests/PccCardTierContract.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx
```

Do not edit product code unless required to satisfy a legitimate contract failure.

## Implementation requirements

### 1. Update Project Readiness targeted card-tier assertions

`PccCardTierContract.test.tsx` currently contains targeted Project Readiness assertions for embedded detail cards. After the refactor, those cards are no longer present by default.

Update the tests so each targeted assertion:

1. renders Project Readiness;
2. activates/selects the relevant detail section using `data-pcc-readiness-drilldown-control`;
3. finds the target card;
4. asserts tier/region/source/direct-child semantics.

Examples:

- `Early closeout-risk surface` -> select `lifecycle-readiness`.
- `AHJ launcher panel` -> select `permits-inspections`.
- `Template and source-mapping admin` -> select `responsibility-matrix`.
- `Procore Reconciliation View` -> select `buyout`.
- `Procore source confidence` -> select `procore-source-confidence`.
- Unified Lifecycle cards -> select `unified-lifecycle` if covered in this contract.

### 2. Keep generic explicit-source loop

The generic loop should continue to include Project Readiness, but it will now inspect the default command overview only. That is correct.

### 3. Direct-child selected-section tests

Add or preserve selected-section direct-child tests in `PccProjectReadinessDensityContract.test.tsx`.

For each selected section:

- every rendered card parent is `[data-pcc-bento-grid]`;
- no card nesting exists;
- exactly one active panel marker exists.

### 4. Evidence closeout instructions

Do not run live Playwright unless the environment is configured and the user explicitly expects it locally. If run, capture the new evidence path and compare against:

```text
docs/architecture/evidence/pcc-live/20260507-134047/surface-screenshots-1778175753367/pcc-live-dom-card-summary.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-matrix.json
docs/architecture/evidence/pcc-live/20260507-134047/breakpoints-1778175676324/pcc-live-breakpoint-card-measurements.json
```

Expected result:

- default Project Readiness card count <= 12;
- measured Project Readiness heights materially reduced;
- no new false-affordance findings;
- no direct-child/card nesting regression.

### 5. Final validation

Run:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessSurface
pnpm --filter @hbc/project-control-center test -- PccProjectReadinessDensityContract
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm exec prettier --check apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx apps/project-control-center/src/tests/PccProjectReadinessDensityContract.test.tsx apps/project-control-center/src/tests/PccCardTierContract.test.tsx
git diff --check
git status --short
```

## Commit summary format

Use this structure:

```text
Commit summary

feat(pcc): command-first Project Readiness density remediation

Commit description

Converts Project Readiness from default-expanded embedded module rendering to a command-first surface with local drill-down detail sections.

- Adds command/detail section state and module index controls.
- Removes Lifecycle, Permit/Inspection, Responsibility Matrix, Constraints, Buyout, Procore, and Unified Lifecycle cards from the default DOM.
- Preserves selected detail rendering as direct bento children.
- Allows only local drill-down enabled controls and keeps workflow actions disabled/absent.
- Updates Project Readiness and card-tier tests for default density and selected-section contracts.
- Preserves read-only/source-confidence/HBI/source-of-record boundaries.
```

## Closeout response

Return:

```text
Files changed:
Final default Project Readiness card count:
Selected detail sections covered:
Validation:
Evidence run path, if executed:
Residual risks:
Commit summary:
Commit description:
```
