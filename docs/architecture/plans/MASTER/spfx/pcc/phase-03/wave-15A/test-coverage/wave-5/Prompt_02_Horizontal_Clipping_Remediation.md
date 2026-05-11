# Prompt 02 — Remediate Horizontal Clipping and Tab-Induced Scroll Drift

## Role

You are my local code agent for `RMF112018/hb-intel`.

Prompt 01 forensics has identified the horizontal scroll/offset source causing Cost & Time and Systems Administration screenshot clipping. Your task is to remediate that defect forcefully.

Do not re-read files that are still in your current context or memory. Use Prompt 01 forensics and current repo truth.

## Objective

Fix screenshot capture so right-side tab surfaces do not capture with left-side clipping.

The fix must handle:

- Cost & Time
- Systems Administration
- any future right-side tab surface

## Non-Negotiable Outcome

After this prompt, the screenshot capture lane must fail if either Cost & Time or Systems Administration has:

- `activeSurfacePanelLeft < -2`
- `bentoGridLeft < -2`
- first visible heading/card left boundary clipped
- any horizontal scroll drift warning
- any visible left clipping in focused screenshot review

Do not let the test pass with warnings.

## Scope Decision

Use Prompt 01 forensics to decide the scope:

### If the root cause is Playwright/capture-state only:
Fix only `e2e/pcc-live/**`.

### If the root cause is production layout:
Fix the production PCC shell/layout source explicitly and add regression tests. Do not hide it in the capture harness.

### If the root cause is both:
Fix both, with separate commits.

## Required Remediation Targets

Update the capture lane to include a stronger horizontal state normalizer:

1. Run after every tab navigation.
2. Run before every screenshot.
3. Run after Playwright auto-scrolls a tab into view.
4. Preserve vertical position for scroll-segment captures.
5. Reset horizontal scroll on:
   - document/documentElement/body;
   - active panel;
   - bento grid;
   - project hero band;
   - PCC root/shell/surface wrappers;
   - ancestors of active tab;
   - ancestors of active panel;
   - ancestors of bento grid;
   - all visible overflow-x scroll containers unless they are intentionally excluded.
6. Record excluded containers and why.

## Critical Rule

If the horizontal state cannot be normalized, do not silently capture a screenshot. Mark the artifact as failed and make the live screenshot test fail for focused surfaces.

## Navigation Hardening

Replace or augment `tab.click()` navigation if Prompt 01 proves Playwright click actionability is inducing horizontal scroll drift.

Acceptable strategies:

- capture scroll state before click and restore all relevant horizontal scroll containers after click;
- use a controlled DOM click only after verifying accessibility state remains correct;
- click normally but immediately normalize the entire horizontal ancestor tree;
- if a production layout bug causes shared tab/panel horizontal scroll, fix production layout so tab-strip scroll is isolated from panel content.

Do not crop the screenshot to hide the problem.

## Required Tests

Add/strengthen tests so these fail if clipping persists:

1. Synthetic tab-scroll fixture:
   - create a horizontal tab strip with right-side tab;
   - simulate click/scroll into view;
   - verify active panel and bento grid remain left-aligned after capture normalization.

2. Live screenshot gate:
   - Cost & Time: all artifacts must have no left clipping warnings and left bounds within tolerance.
   - Systems Administration: same.
   - If warnings exist, the Playwright test must fail.

3. Evidence writer:
   - must surface clipping failures clearly.

## Required Validation

Run:

```bash
git status --short
PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" pnpm exec tsx -e "import { resolvePccLiveEnv } from './e2e/pcc-live/pcc-live.env.ts'; console.log(JSON.stringify(resolvePccLiveEnv(), null, 2));"
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
PCC_EXPECTED_PACKAGE_VERSION="1.0.0.219" PCC_EVIDENCE_OUTPUT_DIR="docs/architecture/evidence/pcc-live/phase-06-v1.0.0.219-screenshot-reliability-rerun" pnpm exec playwright test --config=playwright.pcc-live.config.ts e2e/pcc-live/pcc-live.screenshot.spec.ts
pnpm exec playwright test --config=playwright.pcc-live.config.ts --list
pnpm pcc:e2e:evidence:registry
git diff --check
```

## Required Final Response

Return:

```text
Summary:
- ...

Root cause remediated:
- ...

Files changed:
- ...

Validation:
- ...

Live evidence:
- Cost & Time clipping status:
- Systems Administration clipping status:
- warnings:
- evidence path:

Commit recommendation:
- ...
```
