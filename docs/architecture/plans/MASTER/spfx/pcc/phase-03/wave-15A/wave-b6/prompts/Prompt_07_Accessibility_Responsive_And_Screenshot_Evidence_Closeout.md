# Prompt 07 — Accessibility, Responsive, and Screenshot Evidence Closeout

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

Resolve Project Home-owned accessibility and responsive evidence issues, improve screenshot evidence coverage, and produce before/after evidence suitable for expert scorecard review.

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
e2e/pcc-live/
docs/architecture/evidence/pcc-live/
```

## Baseline problem

Project Home baseline evidence includes:

```text
Axe violations: 4
Touch issues: 18
Priority Actions phone height: 2573px
Project Home phone height: 8432px
Screenshot scroll segment: scrollY 0
```

## Implementation requirements

### 1. Contrast

Fix Project Home-owned axe contrast findings, especially command-card metric labels.

Do not globally change muted tokens unless proven safe. Prefer local CSS.

### 2. Touch targets

Classify Project Home touch issues:

- PCC-owned component issue;
- SharePoint-host-owned issue;
- evidence false positive / operator review.

Fix PCC-owned issues, especially in Ask HBI and any compact priority controls.

### 3. Responsive density

Verify the compressed Priority Actions rail materially reduces phone height.

If a local CSS/layout change can improve mobile scan without primitive changes, implement it.

Do not edit `footprints.ts` or bento primitives unless a blocking validation failure proves it is required.

### 4. Screenshot evidence

Improve evidence generation if local test harness allows:

- ensure Project Home scroll screenshots include real below-fold positions;
- add or adjust screenshot evidence labels if needed;
- avoid committing auth/state/test-results artifacts.

If the Playwright harness cannot be safely changed in this prompt, document the gap and exact recommended harness change.

### 5. Tests

Run targeted local tests and, if environment permits, Playwright evidence lanes:

```bash
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.breakpoint.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.accessibility.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.content.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.workflow.spec.ts
```

### 6. Evidence comparison

Report before/after:

| Metric                            |       Baseline |    New |
| --------------------------------- | -------------: | -----: |
| Project Home axe violations       |              4 | record |
| Project Home touch issues         |             18 | record |
| Priority Actions phone height     |         2573px | record |
| Project Home phone height         |         8432px | record |
| Project Home content needs-review |             27 | record |
| False-affordance needs-review     |              0 | record |
| Horizontal overflow               |              0 | record |
| Screenshot below-fold evidence    | not sufficient | record |

## Do not

- Commit storage state.
- Commit Playwright traces/HARs unless explicitly requested.
- Claim final scorecard pass.

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
