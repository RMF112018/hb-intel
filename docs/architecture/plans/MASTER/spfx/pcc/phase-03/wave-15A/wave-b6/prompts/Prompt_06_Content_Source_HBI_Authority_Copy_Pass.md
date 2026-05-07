# Prompt 06 — Content, Source, and HBI Authority Copy Pass

## Role

You are the local code agent working in the `hb-intel` repository. You are implementing a controlled Project Home flagship remediation for the PCC SPFx application.

## Non-negotiable agent instructions

- Do not re-read files that are still within your current context or memory. Only re-open a file when you need to verify stale, missing, contradictory, or newly changed repo truth.
- Start with `git status --short` and `git branch --show-current`; do not touch unrelated dirty files.
- Treat `17e4273ebd070dd62ca477297393e6c787441111` and `docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/` as the baseline evidence named by this package.
- Use the canonical scorecard path: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`. Do not reference the old `_v2` scorecard filename.
- Preserve the Project Home two-path contract:
  - fixture-only path remains deterministic and no-read-model;
  - read-model-driven path remains opt-in through `readModelClient`.
- Preserve bento direct-child behavior: every rendered `[data-pcc-card]` must have `parentElement === [data-pcc-bento-grid]`.
- Do not nest `PccDashboardCard` inside another `PccDashboardCard`.
- Do not introduce live writes, uploads, syncs, approvals, deletes, saves, external launches, or mutation side effects.
- Keep HBI advisory. HBI may summarize, explain, ground, and route attention; HBI must not claim autonomous decision, approval, writeback, or mutation authority.
- Keep Procore/Sage/SharePoint/PCC source-of-record boundaries explicit. Do not imply PCC owns records that remain external-system-owned.
- Do not edit `package.json`, `pnpm-lock.yaml`, package-solution files, or manifests unless the prompt explicitly authorizes it. This package does not authorize those edits.
- Do not modify shared primitives (`PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell/tabs/hero primitives) unless a blocking validation failure proves the Project Home remediation cannot be completed otherwise. Stop and report the exact blocker before touching primitives.
- Prefer Project Home-local view-model, adapter, component, CSS, and test changes.
- Run the validation commands named in the prompt before closeout. If a command cannot run, report why and what evidence remains missing.

## Objective

Reduce Project Home content needs-review exposure by clarifying disabled/inert reason copy, source boundaries, construction-operational language, state copy, owner/action responsibility, mock/demo transparency, and HBI authority boundaries.

## Required repo check

Before editing:

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Primary files

```text
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
```

## Baseline problem

Project Home baseline content evidence shows 27 needs-review findings, including:

- disabled controls missing clear reason copy;
- HBI authority boundary risk terms;
- source-of-record language review support;
- state-copy quality review support;
- owner/action/responsibility review support;
- mock/fixture transparency review support.

## Implementation requirements

### 1. Disabled / inert copy

For every Project Home disabled or inert control, nearby copy should explain:

```text
condition: why this is not executable here;
impact: what the user can learn here;
next step: where the source action happens or who owns it.
```

Examples:

```text
Reference only — complete this action in Procore.
Preview only — source-system writeback is not enabled in PCC.
Display only — approvals are governed by the Approvals module/source system.
```

Avoid vague labels that look clickable but do not explain why.

### 2. HBI authority copy

Add or refine copy so HBI is clearly:

- advisory;
- grounded in cited/source-linked project records;
- not the source of truth;
- not authorized to approve, submit, sync, write back, create, modify, delete, or complete project records.

Avoid mutation-authority verbs unless explicitly negated or tied to the source system.

### 3. Source-of-record copy

Clarify:

- Procore owns Procore-native records.
- SharePoint/PCC owns PCC-native overlay/read-model records where applicable.
- PCC may summarize or link, but does not become a full Procore mirror.
- HBI answers are grounded summaries, not record authority.

### 4. Construction language

Use construction-specific terms where accurate:

- approvals;
- checkpoints;
- submittals;
- RFIs;
- permits;
- inspections;
- constraints;
- buyout;
- readiness gates;
- document control;
- closeout;
- warranty;
- source records;
- responsible persona/owner.

Avoid generic dashboard copy if a construction-specific phrase is available.

### 5. State copy

For missing setup, unavailable data, preview, read-only, error, and empty states, include:

- condition;
- impact;
- owner;
- next step.

### 6. Tests

Add or update text/contract tests for:

- HBI no-source-of-truth/no-writeback copy;
- disabled/inert reason copy;
- source-owned copy in Priority Actions;
- mock/demo/fixture marker where appropriate;
- absence of forbidden autonomous mutation claims.

Use a forbidden regex similar to:

```ts
/(hbi|ai).*(approves|submits|syncs|writes? back|creates|deletes|modifies|completes)/i;
```

Then allow explicit negation cases such as `HBI does not approve...`.

## Do not

- Add walls of explanatory text.
- Use legalistic copy that hurts usability.
- Remove construction-specific value.
- Hide controls solely to satisfy text scans unless the control is genuinely misleading.

## Required validation

Run the narrowest relevant tests first, then the broader Project Home suite.

```bash
git status --short
git branch --show-current
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml

pnpm --filter @hbc/spfx-project-control-center check-types
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccProjectHome )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccApp.optIn )
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts PccCardTierContract )

pnpm exec prettier --check   apps/project-control-center/src/surfaces/projectHome   apps/project-control-center/src/tests/PccProjectHome.test.tsx   apps/project-control-center/src/tests/PccApp.optIn.test.tsx

git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

If broader test impact is plausible, run:

```bash
( cd apps/project-control-center && pnpm exec vitest run --config vitest.config.ts )
```

## Closeout response

Return:

```text
Files changed:
Repo-truth confirmed:
Implementation summary:
Tests run:
Validation results:
Lockfile/package/manifest status:
Known residual risks:
```
