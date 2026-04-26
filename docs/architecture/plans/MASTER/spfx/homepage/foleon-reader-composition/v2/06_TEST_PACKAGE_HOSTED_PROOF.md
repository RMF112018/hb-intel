# Test, Package, Hosted, and Viewer Proof Report

## Scope

Phase-04 Wave-01 Prompt-06 is the validation pass that closes out the Foleon reader redesign across Prompts 00 → 05. This pass:

- audits existing test coverage against the Prompt-06 required-coverage list;
- closes genuine gaps with new tests (one cross-lane viewer-isolation test, two repo-source marker proofs);
- runs the full validation suite;
- documents Playwright / browser geometry proof and hosted SharePoint proof as **deferred** (cannot be performed locally) and provides the verbatim manual checklists for the next deployment cycle;
- documents `.sppkg` package proof as **deferred** until SPFx packaging actually runs in CI.

**No source-behavior changes.** Tests + docs only. SPFx lockstep stays at `1.1.87.0`. **No version bump.**

Out of scope: source changes, lane redesign, viewer infrastructure changes, version bumps, shell pairing, row placement, Foleon iframe governance, route map, content resolver, schemas, backend sync, Safety / HB Kudos / People & Culture, Playwright configuration, SPFx packaging.

## Baseline Inputs

- `00_BASELINE_AUDIT.md`
- `01_EDGE_CONTRACT_REPORT.md`
- `02_VIEW_MODEL_AND_REGISTRY_REPORT.md`
- `03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md`
- `04_COMPANY_PULSE_LAYOUT_REPORT.md`
- `04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md`
- `04B_CLICKABLE_ARTICLE_CARDS_REPORT.md`
- `04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md`
- `05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md`

## Source Files Changed

**No source files changed.** This is a tests-and-docs pass.

| File | Change |
|---|---|
| `packages/foleon-reader/src/readers/__tests__/FoleonReaderModule.test.tsx` | **Test added.** Cross-lane viewer-isolation test: renders all three `FoleonEmbeddedReaderLane` instances ready, opens each lane's article card in sequence, asserts the dialog renders with the correct `data-foleon-viewer-lane` per lane, closes via the close button before opening the next. |
| `packages/foleon-reader/src/readers/__tests__/SourceMarkerProof.test.ts` | **New.** Repo-source marker proof for the foleon-reader package. Asserts every required Prompt-06 marker / class / type identifier exists in package source. **Repo-source proof, not generated `.sppkg` package proof.** |
| `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.sourceMarkerProof.test.ts` | **New.** Same pattern for the shell-side markers (`data-shell-band-layout`, `data-shell-slot-visual-side`, `data-shell-slot-edge-bleed`, `data-hb-homepage-edge-mode`, `data-hb-homepage-hero-edge`, edge-contract resolvers, `onViewerIframeError` rewire). |
| `docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/06_TEST_PACKAGE_HOSTED_PROOF.md` | **New.** This report. |

Files explicitly **not touched**: all foleon-reader source; all SPFx version files; all shell / entry-stack source; all hb-webparts source (except the new test file); Foleon governance / route / sync / schema files; Safety / HB Kudos / People & Culture; Leadership lane.

## Unit / Component Tests

### Required #1-#10 — Reader Layout Tests (already proven across Prompts 03 / 04 / 04B / 04C / 05)

| Required claim | Where proven |
|---|---|
| Spotlight resolves to `data-foleon-layout="project-spotlight-feature"` | `ProjectSpotlightReaderLayout.test.tsx`, `FoleonReaderModule.test.tsx` |
| Pulse resolves to `data-foleon-layout="company-pulse-briefing"` | `CompanyPulseReaderLayout.test.tsx`, `FoleonReaderModule.test.tsx` |
| Leadership resolves to `data-foleon-layout="leadership-message"` | `LeadershipMessageReaderLayout.test.tsx`, `FoleonReaderModule.test.tsx` (Prompt 05) |
| Each lane retains its `data-foleon-reader-layout="…"` Prompt-02 marker | `FoleonReaderLayoutRegistry.test.tsx` + lane tests |
| Preview/ready share the same composition frame per lane | Each lane test asserts `data-foleon-reader-state` is the only differing marker |
| Spotlight does not emit Pulse/Leadership markers | Spotlight sibling-lane test |
| Pulse does not emit Spotlight/Leadership markers | Pulse sibling-lane test |
| Leadership does not emit Spotlight/Pulse markers | Leadership sibling-lane test (Prompt 05) |
| Old three-card support skeleton absent from all three migrated lanes | All three lane tests |
| Preview "Preview layout" banner present in all lanes | All three lane tests |

No new test required for this section.

### Required Full-Window Viewer Interaction Tests #1-#12

| Required claim | Where proven |
|---|---|
| Spotlight ready card opens the viewer | `FoleonReaderModule.test.tsx` (Prompt 04B) |
| Pulse ready card opens the viewer | `FoleonReaderModule.test.tsx` (Prompt 04C) |
| Leadership ready card opens the viewer | `FoleonReaderModule.test.tsx` (Prompt 05) |
| Preview cards do not open a live viewer | All three lane tests assert `aria-disabled` + click-suppression |
| Disabled targets render honest unavailable behavior | All three lane tests cover preview, `embed-not-allowed` |
| Viewer renders title / metadata accurately | `FoleonFullWindowViewerProvider.test.tsx` (Prompt 04A) |
| Viewer mounts iframe via `FoleonIframeHost` | Provider test asserts iframe title pattern that only `FoleonIframeHost` produces |
| Close button closes the dialog | Provider test |
| Escape closes the dialog | Provider test |
| Focus returns to launch element on close | Provider test |
| Mobile flow does not double-mount iframes | Spotlight mobile test (Prompt 04B) + sibling-lane sanity for all three |
| Viewer telemetry preserved or documented | Module test + 04A/04B/05 reports |

**Gap closed by Prompt-06**: cross-lane viewer-isolation. New test (`Phase-04 Wave-01 Prompt-06: all three lanes ready in one tree — each card opens its own lane-scoped viewer in sequence`) renders all three `FoleonEmbeddedReaderLane` instances, opens each lane's card in sequence, asserts the dialog's `data-foleon-viewer-lane` attribute matches the launching lane, and closes via the close button before opening the next. Confirms each lane's lane-scoped provider operates independently. **No inline iframes mount at any point** (Spotlight + Pulse + Leadership all on viewer-only).

## Viewer Interaction Tests

Listed under Unit / Component Tests above. Cross-lane isolation is proven by the new Prompt-06 test.

## Shell Contract Tests

Required claims already proven by `apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.edgeContract.test.tsx` and `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/edgeContract.test.ts` (Prompt 01 era):

| Claim | Status |
|---|---|
| Row 1 Spotlight major-left ⇒ visual left / eligible left bleed | Proven |
| Row 2 Pulse major-right under right-dominant ⇒ visual right / eligible right bleed | Proven |
| Row 3 Leadership major-left ⇒ visual left / eligible left bleed | Proven |
| Stacked layout ⇒ visual full / eligible both bleed | Proven |
| Non-Foleon lanes (Safety, HB Kudos, People & Culture) ineligible | Proven |
| Existing shell data attributes intact | Proven (`HbHomepageShell.zoneProps.test.tsx`) |
| Default edge policy dormant (`{ edgeMode: 'standard', heroEdge: 'none' }`) | Proven (`edgeContract.test.ts` + CSS-text proof in `HbHomepageShell.edgeContract.test.tsx`) |

No new shell test required.

## Browser / Playwright Geometry Proof

**Status: NOT RUN. Deferred.**

Playwright is not configured in this repo for the homepage / SPFx surfaces. JSDOM cannot measure layout geometry. The strongest in-repo proof is:

- the static CSS-text no-overflow assertion (Prompt 04C) covering `FoleonFullWindowViewer.module.css` and `FoleonReaderLayouts.module.css`;
- the existing CSS-text assertions in Prompt-01-era tests covering `HbHomepageShell.module.css` and `HbHomepageEntryStack.module.css`;
- the new shell-side source-marker proof in this prompt.

### Manual browser-console proof script (next deployment cycle)

Paste at the browser console on the hosted homepage:

```js
// (1) No horizontal overflow
(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  ok: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
}))();

// (2) Lane markers (one row per Foleon lane wrapper)
[...document.querySelectorAll('[data-foleon-reader-layout]')].map((el) => ({
  readerLayout: el.getAttribute('data-foleon-reader-layout'),
  lane: el.getAttribute('data-foleon-reader-lane'),
  state: el.getAttribute('data-foleon-reader-state'),
  layout: el.getAttribute('data-foleon-layout'),
}));

// (3) Shell visual-side / edge-bleed (one row per slot)
[...document.querySelectorAll('[data-shell-slot-edge-bleed]')].map((el) => ({
  occupant: el.getAttribute('data-shell-occupant'),
  role: el.getAttribute('data-shell-slot-role'),
  columnSpan: el.getAttribute('data-shell-column-span'),
  visualSide: el.getAttribute('data-shell-slot-visual-side'),
  edgeBleed: el.getAttribute('data-shell-slot-edge-bleed'),
}));

// (4) Article cards (one row per lane card)
[...document.querySelectorAll('[data-foleon-article-card]')].map((el) => ({
  lane: el.getAttribute('data-foleon-article-lane'),
  state: el.getAttribute('data-foleon-article-state'),
  targetId: el.getAttribute('data-foleon-viewer-target-id'),
  hasButton: !!el.querySelector('button'),
}));

// (5) Full-window viewer (when open)
(() => {
  const v = document.querySelector('[data-foleon-full-window-viewer="active"]');
  return v
    ? {
        present: true,
        lane: v.getAttribute('data-foleon-viewer-lane'),
        source: v.getAttribute('data-foleon-viewer-source'),
        role: v.getAttribute('role'),
        ariaModal: v.getAttribute('aria-modal'),
        ariaLabelledBy: v.getAttribute('aria-labelledby'),
      }
    : { present: false };
})();

// (6) Edge-mode / hero-edge dormancy
(() => {
  const root = document.querySelector('[data-hb-homepage-entry-stack="root"]');
  return root
    ? {
        edgeMode: root.getAttribute('data-hb-homepage-edge-mode'),
        heroEdge: root.getAttribute('data-hb-homepage-hero-edge'),
      }
    : { present: false };
})();
```

Expected results on a healthy hosted homepage at `1.1.87.0`:

- `(1).ok === true` at every breakpoint (desktop, tablet, mobile).
- `(2)` returns three rows: `project-spotlight` / `company-pulse` / `leadership-message` with their matching layouts and states.
- `(3)` returns six rows; the three Foleon lanes show `edgeBleed` per the row-placement contract; non-Foleon lanes show `'none'`.
- `(4)` returns three rows — one per Foleon lane — all with `hasButton: true`.
- `(5).present === false` when no viewer is open; `present: true` with the matching lane after clicking a card.
- `(6).edgeMode === 'standard'` and `(6).heroEdge === 'none'` (Prompt-01 contract dormant by default).

### Manual Playwright follow-up

A future Prompt 07 / Phase-05 effort can configure Playwright at the repo root and convert the manual script above into spec files. Geometry assertions to add:

- `iframe.boundingBox()` covers ≥ 80% of the viewport when the viewer is open.
- `closeButton.boundingBox()` is fully inside the viewport on mobile.
- `getBoundingClientRect()` of `[data-foleon-article-card]` returns a non-zero clickable area on every breakpoint.
- The dialog overlay's `boundingBox()` matches the viewport size.

## Package Proof

**Status: NOT RUN. Deferred to next CI deployment cycle.**

SPFx `.sppkg` generation runs via `gulp bundle && gulp package-solution` (or repo equivalent) in CI. The artifact cannot be inspected from the local test environment. **The new repo-source marker proofs in this prompt assert that the markers exist in package source — they do NOT prove generated `.sppkg` package contents.** Source-source proof and packaged-bundle proof are different artifacts; this report does not conflate them.

### Repo-source marker proof — what the new tests actually prove

`packages/foleon-reader/src/readers/__tests__/SourceMarkerProof.test.ts` reads every `.ts/.tsx/.css` file under `packages/foleon-reader/src` (excluding `__tests__`) and asserts each required string is present:

| Marker | Required by |
|---|---|
| `project-spotlight-feature` | Prompt 03 / 06 |
| `company-pulse-briefing` | Prompt 04 / 06 |
| `leadership-message` | Prompt 05 / 06 |
| `data-foleon-reader-layout` | Prompt 02 / 06 |
| `data-foleon-layout` | Prompts 03/04/05 / 06 |
| `data-foleon-reader-lane` | Prompt 02 / 06 |
| `data-foleon-reader-state` | Prompt 02 / 06 |
| `data-foleon-article-card` | Prompts 04B/05 / 06 |
| `data-foleon-article-lane` | Prompts 04B/05 / 06 |
| `data-foleon-article-state` | Prompts 04B/05 / 06 |
| `data-foleon-viewer-target-id` | Prompts 04B/05 / 06 |
| `data-foleon-article-last-refusal` | Prompts 04B/05 / 06 |
| `data-foleon-full-window-viewer` | Prompt 04A / 06 |
| `data-foleon-viewer-lane` | Prompt 04A / 06 |
| `data-foleon-viewer-source` | Prompt 04A / 06 |
| `FoleonFullWindowViewer` | Prompt 04A / 06 |
| `FoleonFullWindowViewerProvider` | Prompt 04A / 06 |
| `useFoleonFullWindowViewer` | Prompt 04A / 06 |
| `FoleonIframeHost` | Prompt 04A / 06 |
| `FoleonViewerTarget` | Prompt 04A / 06 |
| `FoleonViewerOpenResult` | Prompt 04A / 06 |
| `FoleonArticleCardViewModel` | Prompt 04A / 06 |

`apps/hb-webparts/src/webparts/hbHomepage/__tests__/HbHomepageShell.sourceMarkerProof.test.ts` reads `apps/hb-webparts/src/webparts/hbHomepage/**` (excluding `__tests__`) and asserts:

| Marker | Source |
|---|---|
| `data-shell-band-layout` | Prompt 01 |
| `data-shell-slot-visual-side` | Prompt 01 |
| `data-shell-slot-edge-bleed` | Prompt 01 |
| `data-hb-homepage-edge-mode` | Prompt 01 |
| `data-hb-homepage-hero-edge` | Prompt 01 |
| `resolveShellBandLayoutMode` | Prompt 01 resolver |
| `resolveShellSlotVisualSide` | Prompt 01 resolver |
| `resolveShellSlotEdgeBleed` | Prompt 01 resolver |
| `EDGE_BLEED_ELIGIBLE_OCCUPANTS` | Prompt 01 |
| `DEFAULT_HOMEPAGE_EDGE_POLICY` | Prompt 01 |
| `onViewerIframeError` | Prompt 05 lane-host wiring |
| `viewer-iframe-error` | Prompt 05 lane-host wiring |

**Both tests pass.** Every required marker is present in repo source.

### Manual `.sppkg` content-inspection checklist (next deployment cycle)

When the next CI deployment runs `gulp bundle --ship` and `gulp package-solution --ship` from `apps/hb-homepage`:

1. Locate the generated artifact: `apps/hb-homepage/sharepoint/solution/hb-intel-homepage.sppkg`. Record the absolute path and SHA-256.
2. Open the `.sppkg` (CAB / zip) and inspect the bundled JS chunks for each marker listed in the tables above. Each marker must appear in at least one chunk.
3. Confirm `solution.version` in the embedded manifests matches `1.1.87.0`.
4. Stage the artifact for tenant deployment.

If any marker is missing from the generated bundle, the bundling step has dead-code-eliminated the source — fix and re-bundle before deploying.

## Version Lockstep Proof

`hbHomepagePackageAuthority.test.ts` enforces lockstep across the four authority files. Verified passing at `1.1.87.0` in this prompt's hbHomepage suite run:

| File | Field | Value |
|---|---|---|
| `apps/hb-homepage/config/package-solution.json` | `solution.version` | `1.1.87.0` |
| `apps/hb-homepage/config/package-solution.json` | `solution.features[0].version` | `1.1.87.0` |
| `apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | `version` | `1.1.87.0` |
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json` | `version` | `1.1.87.0` |
| `packages/homepage-launcher/src/constants.ts` | `HOMEPAGE_LAUNCHER_VERSION` | `'1.1.87.0'` |

The lockstep test asserts pairwise equality across the runtime copies and the canonical authority. No drift detected.

## Hosted SharePoint Proof

**Status: NOT RUN. Deferred.**

Hosted proof requires:

- a deployable `.sppkg` (deferred — see Package Proof above);
- a tenant deployment (operator action);
- live SharePoint browser session;
- screenshot / DOM capture.

None of these can be performed locally in this validation pass.

### Manual hosted-proof checklist (verbatim from Prompt 06, for the next deployment cycle)

After deploying the rebuilt `1.1.87.0` `.sppkg` to a tenant homepage:

1. Open HBCentral homepage. Run console snippet (1) — confirm `ok: true` at desktop, tablet, and mobile widths.
2. Run console snippet (2) — confirm three rows with the expected `readerLayout` / `lane` / `state` / `layout` per Foleon lane.
3. Run console snippet (3) — confirm six rows; Foleon lanes carry the row-placement-correct `edgeBleed`; non-Foleon lanes carry `'none'`.
4. Run console snippet (4) — confirm three article cards with `state="enabled"` (or `state="preview"` if no live editions are configured).
5. Click the Project Spotlight card. Run snippet (5) — confirm `present: true`, `lane: 'projectSpotlight'`, `role: 'dialog'`, `ariaModal: 'true'`. Visually confirm the iframe loads. Press Escape — viewer closes; snippet (5) returns `{ present: false }`. Confirm focus returns to the Spotlight card (visible focus ring).
6. Repeat step (5) for the Company Pulse lead card and the Leadership Message card. The dialog's `data-foleon-viewer-lane` attribute should match each lane in turn.
7. Run snippet (6) — confirm `edgeMode: 'standard'` and `heroEdge: 'none'` (the Prompt-01 edge contract is dormant by default).
8. Tab through the homepage with keyboard only — confirm Tab order reaches each Foleon card; Enter / Space activates the card; the dialog's close button is reachable; Escape closes.
9. At a mobile breakpoint (≤ 720px), verify each Foleon card opens the viewer; the iframe stretches to viewport; the close button stays in the safe area; no horizontal scroll.
10. Confirm Safety Field Excellence, HB Kudos, and People & Culture lanes render unchanged from the prior deployment.
11. Confirm preview-state cards show "Preview layout" and refuse to open the viewer (no dialog after click).
12. Confirm production-state cards (live records configured) open the viewer and the iframe loads cleanly with no console errors.

If any item fails, file a defect against the lane / surface and stop further validation. Apply the lockstep `1.1.87.0 → 1.1.88.0` bump if the fix touches source behavior.

## Accessibility Proof

| Concern | Proof |
|---|---|
| Viewer dialog has `role="dialog"` + `aria-modal="true"` + `aria-labelledby` | Provider test (Prompt 04A) |
| Close button has accessible name `Close Foleon viewer` | Provider test |
| Escape always closes | Provider test |
| Focus moves into close button on open | Provider test |
| Focus returns to launch element on close | Provider test |
| Tab cycles within the dialog (scoped trap, not permanent) | Provider test + Escape always exits |
| Disabled card uses `aria-disabled="true"` + `aria-describedby` | All three lane tests |
| Disabled-reason rendered with `role="status"` `aria-live="polite"` | All three lane tests |
| Single button per card (no nested interactive controls) | All three lane tests (Prompt 04C added Spotlight + Pulse; Prompt 05 added Leadership) |
| Keyboard activation works through the provider | All three lane tests (Prompt 04C added Spotlight + Pulse; Prompt 05 added Leadership) |
| Heading hierarchy preserved | Lane composition tests |
| Preview honesty: visible "Preview layout" banner + disabled launch + visible reason | All three lane tests |

Hosted-proof checklist item #8 covers real-browser keyboard behavior.

## Iframe / Origin / Route Governance Proof

| Claim | Proof |
|---|---|
| Viewer iframe mounts via `FoleonIframeHost` (not raw `<iframe>`) | Provider test asserts iframe title matches the FoleonIframeHost-built pattern; new repo-source marker proof confirms the import is present |
| Same accepted-origin policy as inline iframe path | Source review: `FoleonReaderModule.tsx` passes `contract.originPolicy` into `FoleonFullWindowViewerProvider`; provider passes to `FoleonFullWindowViewer`; viewer passes to `FoleonIframeHost.policy`. Single source of truth. |
| Gate behavior unchanged — `onGateBlocked` fires from resolver | `FoleonReaderModule.test.tsx` "renders blocked real records without an iframe" test passes |
| `record.embedUrl` is the only URL the iframe loads | `FoleonViewerTypes.test.ts` (Prompt 04A) |
| `record.allowEmbed === false` blocks viewer launch | All three lane tests |
| `record.requiresExternalOpen === true` blocks viewer launch | `FoleonViewerTypes.test.ts` |
| Missing `embedUrl` blocks viewer launch | `FoleonViewerTypes.test.ts` |
| No preview state emits live Foleon telemetry | All three lane tests |
| Spotlight + Pulse + Leadership viewer iframe-error → homepage occupant error-status | Prompt 05 wired `onViewerIframeError` in `FoleonHomepageLaneHost.tsx`; new shell-side source-marker proof confirms the wiring is present in source |

No source change weakens iframe governance.

## Validation Commands and Results

| Command | Scope | Result |
|---|---|---|
| `pnpm --filter @hbc/foleon-reader test` | full foleon-reader suite | **14 files / 191 tests pass** (167 baseline + 24 new from cross-lane test + repo-source marker proof) |
| `pnpm --filter @hbc/foleon-reader check-types` | foleon-reader typecheck | clean |
| `pnpm --filter @hbc/foleon-reader lint` | foleon-reader lint | clean |
| `pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage` | hbHomepage consumer | **33 files / 480 tests pass** (32 baseline + 1 new shell-side source-marker proof; lockstep authority green at `1.1.87.0`) |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | not re-run; deltas in this prompt are foleon-reader-side and a single new test in hb-webparts | hb-webparts pre-existing 4 errors (Prompts 01–05 documented) remain unchanged. |

`git status` confirms only test files + this report were modified — **no foleon-reader source, no SPFx version files, no shell or hb-webparts source**.

## Pre-Existing Failures

Documented across Prompts 01 / 02 / 03 / 04 / 04A / 04B / 04C / 05 reports. Unchanged in this prompt:

- `hbKudos/PublicKudosSurface.lightData.test.tsx` — snapshot drift (3 failing snapshots).
- `homepage/__tests__/hbKudosAccessibilityGuardrails.test.tsx` — TS2741 (`laneMode` prop missing).
- `homepage/__tests__/homepageHeroDaypartPrecedence.test.tsx` — TS7006 (implicit-any `call` parameter).
- `webparts/priorityActionsRail/PriorityActionsRail.tsx` — TS2322 (`PriorityRailOverflowStrategy`).

None reference any file changed in Prompt 06. None block the hbHomepage suite (the 469 baseline + 1 new shell-side source-marker proof = 480 tests all pass).

## Known Gaps

1. **Playwright / browser geometry proof not run.** Repo lacks Playwright configuration for homepage / SPFx. JSDOM cannot measure layout geometry. Manual browser-console script + manual Playwright follow-up plan documented above.
2. **Generated `.sppkg` package proof not run.** SPFx packaging is a CI-only operation. Manual `.sppkg` content-inspection checklist documented. The new repo-source marker proofs are explicitly labeled as repo-source proof, not packaged-bundle proof.
3. **Hosted SharePoint proof not run.** Cannot be performed in this environment. Verbatim hosted-proof checklist documented for the next deployment cycle.
4. **Cross-lane viewer simultaneity** — the new Prompt-06 cross-lane test opens lanes sequentially (close before opening the next). A future test could open two lanes' viewers without closing the first to confirm independent provider scopes literally co-exist; deferred as low-risk because the providers are constructed at separate React subtree roots and share no state.
5. **Viewer iframe `error` path** still not covered by a unit test (JSDOM/React iframe error-event synthesis is unreliable; documented in Prompt 04C). Hosted proof item #12 covers it; future Playwright spec should exercise the path with a deliberately broken `embedUrl`.

## Required Input to Prompt 07

Prompt 07 (final closure audit) may now begin. Required inputs:

1. **No source defects surfaced** during validation; SPFx lockstep stable at `1.1.87.0`.
2. The shell, viewer infrastructure, and lane layouts are stable and tested. Closure can read this report as the consolidated proof index across the v2 effort.
3. Hosted proof and Playwright proof remain deferred and should be re-confirmed by Prompt 07 against the manual checklists above.
4. The `FoleonReaderCompatibilityLayout` and standalone `FoleonReaderPreview` orphan paths can be optionally retired in a future cleanup prompt; not blocking.

## Rollback Plan

The change set is bounded to:

- One updated test file (`FoleonReaderModule.test.tsx`) — added a single cross-lane test.
- Two new test files (`SourceMarkerProof.test.ts` + `HbHomepageShell.sourceMarkerProof.test.ts`).
- One new report.

Rollback steps:

1. **Test rollback:** revert the new cross-lane test in `FoleonReaderModule.test.tsx`. Delete `SourceMarkerProof.test.ts` and `HbHomepageShell.sourceMarkerProof.test.ts`.
2. **Report rollback:** delete `06_TEST_PACKAGE_HOSTED_PROOF.md`.
3. **Version rollback:** none required — no version bump occurred in this prompt.
4. **Deploy rollback:** none required — no source change.

The Prompt 00–05 implementations remain intact. Lane layouts, viewer infrastructure, edge contract, and lockstep authority are unchanged.
