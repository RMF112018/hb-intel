# Prompt 04C — Full-Window Viewer Validation, Package Proof, and Hosted Proof

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repository.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless verification is required.

Follow existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, no-assumption rules, and the repo’s established lockstep versioning pattern.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon routes, accepted-origin policy, Foleon iframe governance, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.

---

## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md
```

Use these as controlling baseline documents.

Do not reopen the shell edge contract, shared view-model registry, Project Spotlight layout, Company Pulse layout, shared full-window viewer contract, or clickable-card retrofit unless implementation evidence proves a defect.

---

## Current Expected State

The expected repo state after Prompt 04B is:

- HB Homepage / launcher lockstep is at `1.1.86.0`.
- Prompt 01 edge-to-window behavior remains real but dormant by default.
- Project Spotlight has a lane-owned layout with:
  - `data-foleon-reader-layout="project-spotlight"`
  - `data-foleon-layout="project-spotlight-feature"`
  - clickable article-card launch into the shared full-window viewer
  - no inline iframe rendering path
- Company Pulse has a lane-owned layout with:
  - `data-foleon-reader-layout="company-pulse"`
  - `data-foleon-layout="company-pulse-briefing"`
  - clickable lead-update card launch into the shared full-window viewer
  - no inline iframe rendering path
- The full-window viewer infrastructure from Prompt 04A is in place:
  - `FoleonViewerTarget`
  - `FoleonArticleCardViewModel`
  - `FoleonViewerOpenResult`
  - `FoleonFullWindowViewerProvider`
  - `useFoleonFullWindowViewer`
  - internal `FoleonFullWindowViewer`
  - governed iframe rendering through `FoleonIframeHost`
- Spotlight and Pulse use the viewer telemetry path:
  - `onViewerOpen`
  - `onViewerClose`
  - `onViewerIframeLoaded`
  - `onViewerIframeError`
- Spotlight and Pulse no longer use the legacy inline iframe telemetry path:
  - `onReaderOpen`
  - `onReaderClose`
  - `onEmbedError`
- Leadership Message still delegates to `FoleonReaderCompatibilityLayout` and keeps the inline iframe path pending Prompt 05.
- `onGateBlocked` remains unaffected for all lanes.
- Ready-state cards use real record-backed viewer targets only.
- Disabled/refusal paths are observable and accessible, not silent.
- Prompt 05 should not begin until this validation pass proves the shared viewer/card model is safe enough for Leadership Message.

---

## Objective

Validate the shared full-window Foleon viewer and clickable article-card behavior before Prompt 05 begins.

This is a validation/proof pass. Add or tighten tests and documentation needed to prove the viewer contract is safe, reusable, accessible, package-correct, and ready for Leadership Message.

Only fix defects discovered in the viewer/card work. Do not redesign Leadership Message in this prompt.

---

## Required Repo-Truth First Step

Inspect:

```text
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css
packages/foleon-reader/src/components/FoleonFullWindowViewerProvider.tsx
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderCompatibilityLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/__tests__/**
packages/foleon-reader/src/components/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
```

Also inspect the package/version authority files that govern the HB Homepage lockstep version and package proof.

---

## Required Validation Areas

Validate:

1. Project Spotlight article card opens the full-window viewer.
2. Company Pulse lead-update card opens the full-window viewer.
3. The whole visible card surface is clickable through one accessible launch control.
4. The launch pattern does not introduce nested interactive controls.
5. Preview cards are honest and do not mount a live iframe.
6. Ready cards use real record-backed viewer targets only.
7. Disabled targets are not silent no-ops.
8. Disabled/refusal reasons are visible, accessible, and observable.
9. The full-window viewer uses `FoleonIframeHost`, not a raw iframe.
10. Accepted-origin / iframe gate behavior is not weakened.
11. Viewer telemetry remains distinct from inline reader telemetry.
12. ESC closes the viewer.
13. Close/back button closes the viewer.
14. Focus enters the viewer and returns to the launch control where feasible.
15. Mobile-safe behavior remains intact.
16. No horizontal overflow is introduced.
17. Prompt 01 edge contract remains dormant unless explicitly opted in.
18. Leadership Message remains compatibility layout and is ready to consume the viewer/card model in Prompt 05.
19. No SharePoint list/backend/route/schema behavior changes occurred.

---

## Required Test Enhancements

Add or update tests only as needed.

### Unit / Component Tests

Prove:

- Project Spotlight ready-state card opens the viewer.
- Company Pulse ready-state card opens the viewer.
- Card-wide launch behavior works through the established single-button / pseudo-element pattern.
- Keyboard activation works for the launch control.
- Viewer opens with `role="dialog"` and `aria-modal="true"`.
- Viewer iframe is mounted through `FoleonIframeHost`.
- Viewer close button closes the dialog.
- Escape closes the dialog.
- Focus returns to the launch control after close where the test environment supports it.
- Preview target does not open the viewer and does not mount a live iframe.
- Disabled target does not open the viewer and exposes a structured refusal reason.
- `data-foleon-article-last-refusal` or equivalent observable refusal marker is set when appropriate.
- `aria-disabled` / `disabled` behavior suppresses pointer and keyboard activation.
- `aria-describedby` points to the visible disabled/refusal reason.
- No nested interactive controls exist inside the clickable article card.
- Project Spotlight and Company Pulse contain no inline iframe when their viewer is closed.
- Leadership Message remains on compatibility layout and retains the inline iframe path until Prompt 05.

### Telemetry Tests

Prove:

- Spotlight/Pulse viewer launch fires `onViewerOpen`.
- Spotlight/Pulse viewer iframe load/error paths fire viewer-specific telemetry.
- Spotlight/Pulse do not fire legacy `onReaderOpen`, `onReaderClose`, or `onEmbedError` from an inline iframe path.
- Leadership still uses legacy inline lifecycle telemetry while on compatibility layout.
- `onGateBlocked` behavior remains unchanged.

### Shell / Integration Tests

Prove:

- homepage shell edge contract still resolves Company Pulse as right-side edge-eligible;
- Project Spotlight remains left-side edge-eligible;
- Leadership remains left-side edge-eligible for Prompt 05;
- no changed row placement;
- no changed Prompt 01 default edge policy;
- the viewer overlay is not constrained by Foleon card boundaries in component-level tests where feasible.

### Package Authority Tests

Prove:

- lockstep version files agree;
- package authority tests pass;
- generated package includes viewer, article-card, layout, and shell-edge markers if package proof is run.

Avoid brittle exact global marker counts. Use lane-scoped selectors.

---

## Browser / Hosted Proof Checklist

If hosted proof can be performed, validate on the HBCentral homepage:

1. Project Spotlight card opens full-window viewer.
2. Company Pulse lead card opens full-window viewer.
3. Clicking anywhere on the visible article card launches the viewer.
4. Close/back returns user to homepage.
5. ESC closes viewer.
6. Keyboard tab order enters the viewer and close control is reachable.
7. Focus returns to the launch card/control after close where feasible.
8. Mobile width shows a usable viewer.
9. No page-level horizontal overflow:
   ```js
   document.documentElement.scrollWidth <= document.documentElement.clientWidth
   ```
10. Viewer overlay is not trapped inside the card’s visual boundary.
11. Underlying page does not scroll in a way that breaks the viewer.
12. Existing Foleon iframe origin/gate logs remain clean.
13. Spotlight and Pulse do not show inline iframe frames when the viewer is closed.
14. Leadership remains compatibility layout pending Prompt 05.

If hosted proof cannot be performed, state that explicitly and include the exact manual proof checklist for the next deployment cycle.

---

## Required Documentation Deliverable

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md
```

Required sections:

```md
# Full-Window Viewer Validation Report

## Scope

## Baseline Inputs

## Source Files Changed

## Tests Added / Updated

## Validation Commands and Results

## Package Proof

## Hosted Proof

## Accessibility Proof

## Clickable Card Proof

## Viewer Launch / Close Proof

## Telemetry Proof

## No-Overflow Proof

## Iframe Governance Proof

## Leadership Readiness for Prompt 05

## Known Gaps

## Required Input to Prompt 05

## Risks / Mitigations

## Rollback Plan
```

---

## Versioning / Package Authority

If this prompt only adds tests/docs/proof, no version bump may be required.

If source behavior changes, inspect repo authority and bump lockstep version consistently. Expected next version if code changes are required:

```text
1.1.86.0 -> 1.1.87.0
```

Do not invent a version rule.

If package proof is required because the generated package changed or because repo procedure requires proof even for no-source changes, run the repo-approved package proof and document artifact path/hash.

---

## Validation Commands

Use repo-approved commands after inspecting `package.json` scripts.

Expected minimum:

```text
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

If package proof is required by repo standards, run the repo-approved package proof command and document artifact path/hash.

If broader workspace checks fail due to unrelated pre-existing failures, document the exact failure and whether it is unchanged from prior reports.

---

## Hard Do-Nots

Do not:

- redesign Leadership Message;
- migrate Leadership to the full-window viewer in this prompt;
- fabricate Foleon content;
- change SharePoint list schemas;
- change backend sync;
- weaken iframe governance;
- activate edge-to-window globally;
- change homepage row placement;
- hide overflow globally to mask layout defects;
- reintroduce inline iframe rendering for Spotlight or Pulse;
- claim hosted proof unless actually performed;
- claim package proof passed unless the package contents were actually inspected.

---

## Final Response Required From Agent

When complete, respond with:

```text
Summary:
<one-line summary>

Description:
<commit-style description>

Files changed:
<list>

Validation:
<commands run and pass/fail result>

Package proof:
<artifact/path/hash if run, or not run with reason>

Hosted proof:
<performed/not performed and result>

Version/package impact:
<state whether version/package changed and why>

Report:
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md

Follow-up:
Prompt 05 may now implement Leadership Message as a lane-owned layout using the shared full-window viewer contract and the clickable-card launch pattern validated in 04C.
```
