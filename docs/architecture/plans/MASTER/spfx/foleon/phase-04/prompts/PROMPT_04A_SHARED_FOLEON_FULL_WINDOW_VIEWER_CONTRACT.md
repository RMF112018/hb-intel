# Prompt 04A — Shared Foleon Full-Window Viewer Contract

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repository.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless verification is required.

Follow existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, no-assumption rules, and the repo’s established lockstep versioning pattern.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon routes, accepted-origin policy, Foleon iframe governance, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.


## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
```

Use those documents as controlling baseline. Do not reopen the shell edge contract, shared reader registry, Project Spotlight layout, or Company Pulse layout unless implementation evidence proves a defect.

Current expected state:

- HB Homepage / launcher lockstep is at `1.1.84.0`.
- Project Spotlight has a lane-owned layout with `data-foleon-layout="project-spotlight-feature"`.
- Company Pulse has a lane-owned layout with `data-foleon-layout="company-pulse-briefing"`.
- Leadership Message still delegates to `FoleonReaderCompatibilityLayout` pending Prompt 05.
- Prompt 01 edge-to-window behavior remains real but dormant by default.
- Project Spotlight and Company Pulse currently still include or support inline iframe-frame behavior from the shared reader/module pipeline.


---

## Objective

Add a shared, reusable Foleon full-window viewer contract so any Foleon article/card can open its selected document in an immersive full-window reading/viewing experience.

This is a shared infrastructure pass. Do not redesign Leadership Message yet. Do not change the visible Project Spotlight or Company Pulse layout beyond the minimum needed to expose/prepare the shared viewer contract.

The end state of this prompt should be:

- a shared `FoleonViewerTarget` / article target model;
- shared full-window viewer state and open/close actions;
- a reusable full-window viewer component;
- reuse of existing iframe governance through the existing Foleon iframe host or equivalent repo-approved path;
- accessible full-window behavior with close/back controls, focus management, Escape-to-close, mobile-safe behavior, and telemetry hooks;
- tests proving the contract works without requiring a lane redesign.

---

## Product Intent

The homepage Foleon lanes should behave like interactive article launch surfaces.

Users should be able to click a Foleon article/card and open the Foleon document in a full-window viewer for a focused reading experience.

This should become the standard interaction pattern for:

- Project Spotlight cards;
- Company Pulse cards;
- Leadership Message card after Prompt 05;
- any future Foleon article card.

---

## Required Repo-Truth First Step

Inspect, at minimum:

```text
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonReaderLayoutRegistry.tsx
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderCompatibilityLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/components/FoleonIframeHost.tsx
packages/foleon-reader/src/components/FoleonStates.tsx
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/types/foleon-runtime.types.ts
packages/foleon-reader/src/services/FoleonReaderContentService.ts
packages/foleon-reader/src/readers/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
```

Also inspect package/version authority files that have been bumped in Prompts 01–04.

---

## Current Interaction Problem

Project Spotlight and Company Pulse now have lane-owned layouts, but the interaction model still treats the lane as an embedded reader surface rather than a launch surface for a full-window viewer.

This prompt should create the shared viewer capability before Prompt 05 so Leadership Message can be implemented on the correct interaction model.

---

## Required Architecture

Create or equivalent shared types:

```ts
export type FoleonViewerSource =
  | 'active-record'
  | 'archive'
  | 'preview'
  | 'manual';

export interface FoleonViewerTarget {
  readonly id: string;
  readonly lane: FoleonReaderLayoutKey;
  readonly source: FoleonViewerSource;
  readonly title: string;
  readonly summary?: string;
  readonly url?: string;
  readonly viewerUrl?: string;
  readonly publishedLabel?: string;
  readonly categoryLabel?: string;
  readonly canOpen: boolean;
  readonly disabledReason?: string;
}
```

Use exact field names that fit repo conventions, but the model must support:

- the selected Foleon document URL or viewer URL;
- lane identity;
- title/summary/metadata;
- whether the target can open;
- disabled reason when no real Foleon URL exists.

Do **not** invent URL field names. Inspect `FoleonContentRecord` and current ready-state iframe URL resolution first. Reuse the same trusted URL used by the existing iframe path.

---

## Required Viewer Component

Create a shared component, equivalent to:

```text
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css
packages/foleon-reader/src/components/FoleonFullWindowViewer.module.css.d.ts
```

The component must provide:

- fixed full-window overlay / viewer surface;
- title and metadata header;
- close/back control;
- visible loading/error/blocked states if iframe cannot be loaded;
- existing `FoleonIframeHost` or repo-approved iframe host path;
- focus management:
  - focus moves into viewer on open;
  - focus returns to launch control on close where feasible;
  - Escape closes viewer;
  - close button is keyboard reachable;
- mobile-safe layout;
- no global `overflow-x: hidden`;
- body scroll lock only if the repo has a safe established pattern, otherwise scoped overlay containment;
- `aria-modal="true"` and `role="dialog"` when implemented as modal overlay;
- descriptive iframe title;
- telemetry hooks for open/close if existing event callbacks support them.

If the repo already has a modal/dialog/focus utility, use it rather than inventing a new one.

---

## Required State Ownership

Add full-window viewer state at the shared reader/module level, not inside one lane.

Preferred owner:

```text
FoleonReaderModule.tsx
```

Reason:

- It already owns iframe lifecycle;
- it already has lane config and ready/preview state;
- it can reuse existing origin policy, gate semantics, and telemetry;
- each lane layout can call a shared action such as `openViewer(target)`.

Acceptable equivalent if repo truth shows a better layer:

- a shared provider inside `packages/foleon-reader`;
- a small hook such as `useFoleonFullWindowViewer`.

Do not implement the viewer separately inside Project Spotlight, Company Pulse, and Leadership.

---

## Required View Model Extension

Extend `FoleonReaderViewModel` to support article-card viewer launch.

Add or equivalent:

```ts
export interface FoleonArticleCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly eyebrow?: string;
  readonly category?: string;
  readonly dateline?: string;
  readonly previewOnly?: boolean;
  readonly target: FoleonViewerTarget;
}

export interface FoleonReaderViewModel {
  // existing fields...
  readonly primaryArticle?: FoleonArticleCardViewModel;
  readonly articleCards?: readonly FoleonArticleCardViewModel[];
}
```

Keep naming consistent with repo conventions.

Rules:

- Preview cards may be sample placeholders, but must be clearly labeled as preview/sample and must not mount a live iframe.
- Ready-state cards must be backed by real record data.
- If the record has no valid Foleon URL, the card must show a disabled reason instead of silently failing.
- Do not fabricate secondary ready-state cards.

---

## Required Actions

Add or equivalent action support:

```ts
openViewer(target: FoleonViewerTarget): void
closeViewer(): void
```

The layout components should not know how iframe governance works. They should only invoke the shared action when a target can open.

---

## Required Preview Behavior

In preview state:

- Article cards may show sample titles/summaries only if clearly labeled as preview.
- Clicking preview cards should either:
  - open a non-live preview viewer shell that clearly says no live Foleon document is configured yet; or
  - be disabled with a clear `Preview only` / `Live document not configured` message.

Do not mount the real iframe in preview unless a real validated preview URL exists from repo data.

---

## Required Ready Behavior

In ready state:

- The active Foleon record should produce the primary viewer target when a valid URL exists.
- The existing inline iframe URL resolution must be reused for target URL validation.
- Opening the viewer must load that selected document in the full-window viewer.
- Existing inline iframe behavior may remain available during this prompt, but the architecture must make full-window viewer the preferred interaction path for article cards in Prompt 04B.

---

## Required Tests

Add/update tests for:

1. `FoleonViewerTarget` is created from a ready record with a valid URL.
2. Ready target is disabled with a clear reason when no valid URL exists.
3. Preview target does not mount a live iframe.
4. Opening a target renders the full-window viewer.
5. Closing the viewer removes it and returns to the lane surface.
6. Escape closes the viewer.
7. Viewer uses the existing iframe host path or equivalent trusted governed host.
8. Iframe origin policy and existing gate behavior are not weakened.
9. Project Spotlight and Company Pulse still render their existing lane layout markers.
10. Leadership still remains compatibility layout pending Prompt 05.

Avoid brittle global marker counts.

---

## Required Documentation Deliverable

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
```

Required sections:

```md
# Full-Window Viewer Contract Report

## Scope

## Baseline Inputs

## Source Files Changed

## Viewer Target Model

## Viewer State Ownership

## Full-Window Viewer Component

## Preview Behavior

## Ready Behavior

## Accessibility / Focus Management

## Iframe Governance Preservation

## Tests Added / Updated

## Validation Commands and Results

## Version / Package Impact

## Known Follow-Up Work
- Prompt 04B Project Spotlight + Company Pulse card launch retrofit
- Prompt 05 Leadership Message lane-owned layout using viewer contract

## Risks / Mitigations

## Rollback Plan
```

---

## Versioning / Package Authority

This prompt changes TS/CSS under the homepage/Foleon reader package and likely changes deployable output.

Expected version direction:

```text
1.1.84.0 -> 1.1.85.0
```

Do not assume. Inspect repo authority and follow the current lockstep versioning pattern.

If a version bump is required, update all lockstep authority files consistently.

---

## Validation Plan

Run the narrowest repo-approved commands first. Expected minimum:

```text
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

If script names differ, inspect package scripts and use the repo-approved equivalents.

Document exact pass/fail results. Do not claim package or hosted proof unless actually performed.

---

## Hard Do-Nots

Do not:

- redesign Leadership Message;
- redesign Project Spotlight or Company Pulse composition in this prompt;
- fabricate secondary ready-state articles;
- weaken accepted-origin or iframe governance;
- replace `FoleonIframeHost` with an ungoverned raw iframe if the existing host can be reused;
- change SharePoint list schemas;
- change backend sync;
- change shell edge contract;
- activate global edge-to-window behavior;
- rely on global `overflow-x: hidden`;
- hard-code tenant-specific page widths;
- introduce inaccessible click-only divs;
- trap focus permanently.

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
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md

Follow-up:
Prompt 04B should retrofit Project Spotlight and Company Pulse article cards to use the shared full-window viewer.
```
