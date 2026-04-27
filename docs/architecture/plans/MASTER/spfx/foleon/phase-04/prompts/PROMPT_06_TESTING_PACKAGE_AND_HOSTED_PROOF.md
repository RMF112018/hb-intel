# Prompt 06 — Testing, Package Proof, Hosted Proof, and Full-Window Viewer Proof

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, and the repo’s existing no-assumption / repo-truth posture.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon accepted-origin / iframe governance, Foleon routes, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.

---

## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md
```

Also inspect the full-window viewer reports if present:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_TESTING_PROOF.md
```

Use equivalent repo-truth documents if the prior prompts used different names.

---

## Objective

Validate the full Foleon reader redesign through unit tests, interaction tests, browser layout tests, package proof, and hosted SharePoint proof.

This validation must now include the new product decision:

> Foleon homepage article cards are direct launch points into a full-window immersive Foleon viewer. Users should click the card to open the selected Foleon document in the shared viewer, rather than relying only on an embedded lane iframe.

This prompt should confirm:

- all three lanes have lane-owned compositions;
- preview and production share lane-specific composition frames;
- article/card interaction opens the shared full-window viewer where a valid target exists;
- preview/sample cards do not open live Foleon documents;
- iframe/origin/route/telemetry governance remains intact;
- Prompt 01 edge-to-window contract remains safe and dormant by default unless explicitly opted in;
- package proof and hosted proof are accurate.

---

## Required Repo-Truth First Step

Inspect relevant tests and source:

```text
packages/foleon-reader/src/readers/**
packages/foleon-reader/src/readers/layouts/**
packages/foleon-reader/src/readers/__tests__/**
packages/foleon-reader/src/components/**
packages/foleon-reader/src/types/**
packages/foleon-reader/src/viewer/**

apps/hb-webparts/src/webparts/hbHomepage/**
apps/hb-webparts/src/webparts/hbHomepage/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/**
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

Use actual repo paths. If `packages/foleon-reader/src/viewer/**` does not exist, locate the full-window viewer implementation by search.

---

## Required Test Coverage

### Reader Layout Tests

Prove:

1. Project Spotlight resolves to `data-foleon-layout="project-spotlight-feature"`.
2. Company Pulse resolves to `data-foleon-layout="company-pulse-briefing"`.
3. Leadership Message resolves to `data-foleon-layout="leadership-message"`.
4. Each lane retains its Prompt 02 lane marker:
   - `data-foleon-reader-layout="project-spotlight"`
   - `data-foleon-reader-layout="company-pulse"`
   - `data-foleon-reader-layout="leadership-message"`
5. Preview and production for each lane share the same composition frame.
6. Project Spotlight does not render Company Pulse briefing structure.
7. Company Pulse does not render Project Spotlight feature structure.
8. Leadership Message does not render as a generic compatibility feature card.
9. The old generic three-card support skeleton is absent from all migrated active lane layouts.
10. Preview sample labeling remains present in all lanes.

### Full-Window Viewer Interaction Tests

Prove:

1. A ready-state Project Spotlight card opens the shared full-window viewer.
2. A ready-state Company Pulse lead card opens the shared full-window viewer.
3. A ready-state Leadership Message card opens the shared full-window viewer.
4. Preview-state cards do not open a live viewer.
5. Missing/invalid viewer targets render honest unavailable behavior and do not create dead clickable cards.
6. The viewer renders selected title/metadata accurately.
7. The viewer mounts the Foleon iframe only through the existing governed iframe host/path.
8. The viewer can be closed through close/back control.
9. ESC closes the viewer where supported.
10. Focus returns to the invoking card after close where testable.
11. Mobile behavior remains safe and does not double-mount iframes.
12. Viewer launch telemetry/lifecycle callbacks remain preserved or intentionally documented.

### Iframe / Governance Tests

Prove:

- accepted-origin / route gating remains unchanged;
- blocked state remains blocked;
- loading and error states remain intact;
- mobile lazy-mount behavior remains intact or is intentionally superseded by the full-window viewer with documented behavior;
- no preview state emits live Foleon telemetry;
- no test weakens `FoleonIframeHost` behavior.

### Shell Contract Tests

Prove:

- Row 1 Project Spotlight major-left = visual left / eligible left bleed.
- Row 2 Company Pulse major-right in right-dominant band = visual right / eligible right bleed.
- Row 3 Leadership Message major-left = visual left / eligible left bleed.
- Stacked layout = visual full / eligible both bleed.
- Non-Foleon lanes remain ineligible.
- Existing shell data attributes remain intact.
- Default edge policy remains dormant unless explicitly tested in opt-in mode.

### Browser / Playwright Geometry Proof

JSDOM cannot prove real CSS Grid geometry. Add or update Playwright/browser proof to verify actual layout behavior using `getBoundingClientRect()`.

At minimum, prove:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

at multiple widths and for each relevant state.

Also prove, where applicable:

- left-bleed surfaces align with intended left edge in opt-in edge mode;
- right-bleed surfaces align with intended right edge in opt-in edge mode;
- stacked surfaces align to both sides in opt-in edge mode;
- default standard mode does not unexpectedly change hosted layout;
- full-window viewer overlay covers the intended viewport/window area;
- full-window viewer does not introduce horizontal overflow;
- viewer close/back control is visible and keyboard reachable;
- focusable elements remain inside safe content area.

If hosted Playwright is not available, document the gap and provide a manual hosted proof script.

---

## Package Proof

Prove generated package contents, not just successful build.

Required package-string proof should include:

```text
project-spotlight-feature
company-pulse-briefing
leadership-message
data-foleon-reader-layout
data-foleon-layout
data-shell-slot-visual-side
data-shell-slot-edge-bleed
data-hb-homepage-edge-mode
```

Also prove full-window viewer strings/markers, using the actual implementation names. Examples may include:

```text
data-foleon-full-window-viewer
data-foleon-viewer-state
FoleonFullWindowViewer
```

Use actual markers from repo truth; do not invent proof strings if different markers were used.

Prove version authority lockstep across:

```text
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

If the generated `.sppkg` exists, record its path and hash.

Do not infer package inclusion from a successful build alone.

---

## Hosted SharePoint Proof

On the hosted SharePoint homepage, capture and document:

1. runtime DOM attribute proof for all three Foleon lanes;
2. screenshot proof at standard desktop width;
3. screenshot or DOM proof for mobile/stacked width if possible;
4. no-horizontal-overflow proof;
5. Row 1/2/3 edge metadata proof;
6. full-window viewer open proof for:
   - Project Spotlight;
   - Company Pulse;
   - Leadership Message;
7. viewer close/back proof;
8. focus/keyboard proof where practical;
9. preview-state proof if live content is unavailable;
10. production-state proof if live content is configured;
11. confirmation that Safety, HB Kudos, and People & Culture are unaffected.

If hosted proof cannot be run, explicitly state it was not run and provide the exact script/checklist needed.

---

## Browser Console Proof Snippets

Include these or equivalent snippets in the report when hosted validation is performed.

### No overflow

```js
(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  ok: document.documentElement.scrollWidth <= document.documentElement.clientWidth
}))();
```

### Lane markers

```js
[...document.querySelectorAll('[data-foleon-reader-layout]')].map((el) => ({
  readerLayout: el.getAttribute('data-foleon-reader-layout'),
  lane: el.getAttribute('data-foleon-reader-lane'),
  state: el.getAttribute('data-foleon-reader-state'),
  layout: el.getAttribute('data-foleon-layout')
}));
```

### Shell visual side / edge

```js
[...document.querySelectorAll('[data-shell-slot-edge-bleed]')].map((el) => ({
  occupant: el.getAttribute('data-shell-occupant'),
  role: el.getAttribute('data-shell-slot-role'),
  columnSpan: el.getAttribute('data-shell-column-span'),
  visualSide: el.getAttribute('data-shell-slot-visual-side'),
  edgeBleed: el.getAttribute('data-shell-slot-edge-bleed')
}));
```

### Full-window viewer

```js
(() => {
  const viewer = document.querySelector('[data-foleon-full-window-viewer], [data-foleon-viewer-state]');
  return viewer ? {
    present: true,
    state: viewer.getAttribute('data-foleon-viewer-state'),
    title: viewer.getAttribute('aria-label') || viewer.textContent?.slice(0, 120)
  } : { present: false };
})();
```

Adjust selectors to actual repo markers.

---

## Required Documentation Deliverable

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/06_TEST_PACKAGE_HOSTED_PROOF.md
```

The report must include:

```text
# Test, Package, Hosted, and Viewer Proof Report

## Scope

## Baseline Inputs

## Source Files Changed

## Unit / Component Tests

## Viewer Interaction Tests

## Shell Contract Tests

## Browser / Playwright Geometry Proof

## Package Proof

## Version Lockstep Proof

## Hosted SharePoint Proof

## Accessibility Proof

## Iframe / Origin / Route Governance Proof

## Pre-Existing Failures

## Known Gaps

## Rollback Plan
```

---

## Validation Commands

Use repo-approved scripts after inspecting `package.json`.

Minimum expected validation:

```text
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/spfx-hb-webparts check-types
```

Add package-proof commands according to repo conventions.

If Playwright tests exist for homepage/SPFx surfaces, add the narrowest relevant Playwright run.

Do not claim commands passed unless they actually ran and passed.

---

## Versioning / Package Authority

If this prompt only adds tests/docs/proof and no deployable source changes, do not bump versions.

If source changes are required to fix defects found during validation, follow repo version authority. Expected current direction after Prompt 05 may be:

```text
HB Homepage 1.1.85.0
```

Bump only if source changes require it and repo authority supports the bump.

---

## Hard Do-Nots

Do not:

- add new product behavior beyond fixes required for validation;
- weaken viewer iframe governance;
- weaken origin policy;
- change SharePoint list schemas;
- change backend sync behavior;
- fabricate hosted proof;
- hide overflow defects with global `overflow-x: hidden`;
- claim package proof from build success alone;
- redesign lane layouts;
- change Safety, HB Kudos, or People & Culture.

---

## Final Response Required From Agent

When complete, respond with:

```text
Summary:
<one-line summary>

Description:
<commit-style description if source changed, otherwise proof summary>

Files changed:
<list>

Validation:
<commands run and pass/fail result>

Package proof:
<artifact path/hash and string proof result>

Hosted proof:
<run/not run and result>

Report:
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/06_TEST_PACKAGE_HOSTED_PROOF.md

Follow-up:
Prompt 07 should complete the final closure audit across layouts, edge contract, viewer interaction, package proof, and hosted proof.
```
