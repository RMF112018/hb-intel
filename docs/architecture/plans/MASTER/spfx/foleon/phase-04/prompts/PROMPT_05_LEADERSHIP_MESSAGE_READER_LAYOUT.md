# Prompt 05 — Leadership Message Reader Layout with Full-Window Viewer Card Interaction

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, and the repo’s existing no-assumption / repo-truth posture.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon accepted-origin / iframe governance, Foleon routes, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.

Use 04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md, 04B_CLICKABLE_ARTICLE_CARDS_REPORT.md, and 04C_FULL_WINDOW_VIEWER_VALIDATION_REPORT.md as controlling baselines.

This pass should replace only the Leadership Message compatibility layout with a lane-owned executive message / letter composition and migrate Leadership to the same clickable-card → full-window viewer model used by Project Spotlight and Company Pulse.

Leadership should no longer render through the compatibility shell or inline iframe path after this prompt unless repo evidence proves a required compatibility gap.

Reuse the proven single-button card-launch pattern, ::after card scrim, disabled contract, viewer telemetry path, and test scaffolding from Spotlight/Pulse.

Expected version posture: source changes require 1.1.86.0 → 1.1.87.0 lockstep bump across the four authority files.

---

## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of these documents:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
```

Also inspect the reports created by the pre-Prompt-05 full-window viewer work if they exist:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_TESTING_PROOF.md
```

If those 04A/04B/04C reports are not present, search the repo for the equivalent implementation/report names created by the prior full-window viewer prompts. Do not assume the viewer contract exists until verified from source.

---

## Objective

Implement a lane-specific `Leadership Message` reader layout that feels like an executive communication / letter **and participates in the shared full-window Foleon viewer interaction model**.

Leadership Message should no longer act like a generic media feature card or passive embedded preview. Its primary message card must be directly interactive: when the user clicks the message card, the selected Foleon document opens in the shared full-window viewer for an immersive reading/viewing experience.

This prompt should complete the third lane-owned layout while aligning all three Foleon reader lanes to the new viewer model:

- Project Spotlight: feature card opens full-window viewer.
- Company Pulse: lead / digest card opens full-window viewer where a valid target exists.
- Leadership Message: executive message card opens full-window viewer.

---

## Required Repo-Truth First Step

Inspect, at minimum:

```text
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderCompatibilityLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/__tests__/**
packages/foleon-reader/src/components/FoleonIframeHost.tsx
packages/foleon-reader/src/types/**
```

Also inspect the shared viewer implementation added by the pre-Prompt-05 work. Likely files may include one or more of:

```text
packages/foleon-reader/src/viewer/**
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonViewerOverlay.tsx
packages/foleon-reader/src/readers/FoleonViewerTarget.ts
packages/foleon-reader/src/readers/FoleonArticleCard*.tsx
```

Use actual repo truth. Do not invent file names if implementation used different names.

---

## Current Expected State

The expected state entering this prompt is:

- Prompt 01 added a dormant edge-to-window contract and slot visual-side / edge-bleed metadata.
- Prompt 02 added a normalized view model and layout registry.
- Prompt 03 replaced Project Spotlight with a lane-owned monthly project feature layout.
- Prompt 04 replaced Company Pulse with a lane-owned briefing/newsroom digest.
- Pre-Prompt-05 work added or should have added:
  - shared Foleon viewer target/action model;
  - shared full-window viewer overlay or routed surface;
  - Project Spotlight and Company Pulse clickable-card integration;
  - focus management, ESC close, close/back control, iframe governance, and tests/proof.

If the shared viewer contract is missing or incomplete, stop before implementing Leadership layout and produce a short blocking note identifying the missing contract and exact required files. Do not build a one-off Leadership-only viewer.

---

## Design Requirements

The Leadership Message layout must include:

- executive message / letter composition;
- byline / portrait / monogram zone where available, with honest preview placeholder if not available;
- pull quote or key statement;
- focused message body;
- intent/context notes;
- limited supporting metadata;
- archive action;
- clear preview label when in preview mode;
- direct card interaction that opens the shared full-window Foleon viewer when a valid viewer target exists;
- production-ready viewer/iframe handling through the shared viewer contract, not a new bespoke Leadership iframe implementation.

The layout must **not**:

- render as a generic feature card;
- render the old three-support-card preview skeleton;
- depend on `data-preview-tone` or `data-foleon-preview-route` for identity;
- fabricate ready-state executive/byline/portrait data that is not available in `FoleonContentRecord` or the current view model.

---

## Interaction Requirements

### Primary user interaction

Leadership Message must expose one clear primary interactive message card/surface.

When clicked:

1. if `viewModel.state === 'ready'` and a valid viewer target exists, open the shared full-window viewer;
2. if `viewModel.state === 'preview'`, do **not** open a live Foleon document;
3. if no valid viewer target exists, render an honest unavailable/explanatory affordance rather than a dead clickable card.

### Full-window viewer requirements

Use the shared viewer created before Prompt 05. The Leadership layout must not duplicate viewer overlay state, iframe origin policy, focus trap logic, or ESC-close behavior.

The shared viewer must remain responsible for:

- full-window overlay / viewer presentation;
- iframe mounting for the selected Foleon document;
- accepted-origin / route gating;
- close/back control;
- focus return to the invoking card;
- ESC-to-close;
- mobile-safe behavior;
- lifecycle telemetry;
- accessibility semantics.

### Archive behavior

The archive action remains separate from the card launch action. The archive action should continue to use the configured archive/full-archive behavior from the view model.

---

## Data Honesty Requirements

Use only record-backed or view-model-backed data in ready state.

Allowed ready-state sources include the current `FoleonContentRecord` fields and any normalized view model fields already created by prior prompts.

If the schema does not carry a field, use an honest fallback such as:

```text
Not listed
Executive byline not provided
Message summary not provided
```

Preview placeholders are acceptable only when the visible preview/sample label is present.

Do not fabricate:

- executive name;
- executive title;
- portrait URL;
- signature;
- topic tags;
- extra related messages;
- quote attributed to a person;
- secondary message cards.

---

## Responsive Requirements

- Desktop paired: Leadership Message remains edge-bleed-ready for left visual side.
- Desktop full-width / stacked: Leadership Message remains edge-bleed-ready for both sides.
- Tablet: byline/portrait/monogram stacks above or beside message content depending container width.
- Mobile: compact byline + message, click target remains clear, viewer opens in mobile-safe full-window mode.

Do not activate the dormant global edge-to-window policy unless that was already part of the pre-Prompt-05 viewer validation work and repo truth confirms it is intended.

---

## Visual Requirements

- Calm, premium, restrained.
- Strong typography.
- Minimal decorative chrome.
- No heavy outer border.
- No generic media placeholder unless a real portrait/editorial asset exists.
- Internal safe area via clamp-based padding consistent with Project Spotlight and Company Pulse.
- Full-window viewer launch affordance should be obvious but not visually loud.

---

## Required View Model / Type Work

Extend the view model only as needed for Leadership-specific fields, following the existing pattern from Project Spotlight and Company Pulse.

Likely additions may include:

```ts
leadershipMessage?: {
  readonly byline?: string;
  readonly role?: string;
  readonly pullQuote?: string;
  readonly messageBody?: string;
  readonly contextNotes?: readonly { id: string; label: string; value: string }[];
  readonly isPlaceholder?: boolean;
};
```

If the shared full-window viewer contract already added viewer target fields, reuse them. Do not create a second target model.

The view model must support:

- preview target absent or disabled;
- ready target present when the active Foleon record is valid;
- honest fallback where record fields are missing;
- action labels that distinguish:
  - open full-window viewer;
  - open archive.

---

## Required Tests

Add or update tests proving:

1. Leadership Message renders `data-foleon-reader-layout="leadership-message"`.
2. Leadership Message renders `data-foleon-layout="leadership-message"`.
3. It does not render Project Spotlight or Company Pulse layout markers.
4. It does not render the old generic feature-card / three-support-card skeleton.
5. Preview and ready states share the same layout marker.
6. Preview state remains clearly labeled.
7. Ready state renders an interactive message card when a valid viewer target exists.
8. Clicking the ready-state message card invokes the shared full-window viewer open path.
9. Preview-state message card does not open a live viewer.
10. Missing ready-state byline/portrait/quote fields render honest fallbacks or are omitted without fabricated data.
11. Archive action remains separate from viewer launch.
12. Accessibility labeling is preserved:
    - section label;
    - card button/link accessible name;
    - viewer launch label;
    - focus return where testable.
13. Project Spotlight and Company Pulse viewer behavior remains unchanged.
14. Prompt 01 edge contract remains unchanged and dormant by default.

Use JSDOM/component tests for routing, click handler, and markers. Do not claim browser geometry proof in this prompt unless Playwright was actually run.

---

## Required Documentation Deliverable

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md
```

The report must include:

```text
# Leadership Message Reader Layout Report

## Scope

## Baseline Inputs

## Source Files Changed

## Viewer Contract Consumed

## Layout Implemented

## Interaction Model

## Preview Behavior

## Ready-State Data Honesty

## Accessibility

## Tests Added / Updated

## Validation Commands and Results

## Package / Versioning Impact

## Known Follow-Up Work

## Rollback Plan
```

---

## Validation Plan

Use repo-approved commands after inspecting package scripts.

Minimum expected validation:

```text
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

If actual script names differ, use the closest repo-approved scripts and document the exact commands used.

If broader pre-existing failures remain, document them precisely and distinguish them from this prompt’s changes.

---

## Versioning / Package Authority

Because this prompt modifies deployable TypeScript/CSS under the Foleon reader package consumed by the homepage SPFx bundle, inspect current version authority and follow repo lockstep rules.

Expected direction after Prompt 04:

```text
HB Homepage 1.1.84.0 -> 1.1.85.0
```

Only apply that bump if it matches current repo authority. Do not invent versioning rules.

---

## Git / Commit Requirements

If source changes are made, produce a commit summary and description in this format:

```text
Summary:
HB Homepage <version>: Leadership Message reader layout — executive message composition with full-window viewer launch

Description:
Replaces the Leadership Message compatibility-shell body with a lane-owned executive message / letter composition. The layout renders byline/message context, preview labeling, ready-state honest fallbacks, archive action, and a direct viewer-launch interaction that opens the selected Foleon document through the shared full-window viewer contract. Preserves Foleon iframe governance, route/origin policy, lifecycle telemetry, mobile behavior, Prompt-01 edge contract, and existing Project Spotlight / Company Pulse layouts.
```

Do not commit unless the user separately asks you to commit.

---

## Hard Do-Nots

Do not:

- create a one-off Leadership-only full-window viewer;
- duplicate iframe origin policy or focus trap logic;
- fabricate executive/byline/portrait/quote data in ready state;
- modify Project Spotlight or Company Pulse except for shared type/test compatibility required by Leadership;
- redesign Project Spotlight or Company Pulse;
- change shell edge contract behavior;
- activate global edge-to-window unless already approved and proven;
- change backend sync behavior;
- change SharePoint list schemas;
- change Foleon routes;
- weaken iframe governance;
- remove preview fallback;
- alter Safety, HB Kudos, or People & Culture.

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

Version/package impact:
<state whether version/package changed and why>

Report:
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md

Follow-up:
Prompt 06 should validate all three lane-owned layouts, shared full-window viewer behavior, package proof, and hosted proof.
```
