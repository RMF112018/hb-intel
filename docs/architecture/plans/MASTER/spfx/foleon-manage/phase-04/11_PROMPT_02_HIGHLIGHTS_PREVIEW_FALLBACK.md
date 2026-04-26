# Updated Prompt 02 — Highlights Preview Fallback

## Objective

Implement the public **Highlights route preview fallback** for the `hb-intel-foleon` SPFx application.

The fallback must render only when the app is correctly configured, the read-side service calls complete successfully, and there are no real Foleon records to display on the Highlights route.

This is not a mock-data substitution. It is a clearly labeled, non-clickable, non-telemetry-producing preview of the intended final Highlights experience while the Foleon content pipeline is empty or not yet populated.

## Current Repo State / Prior Prompt Closure

Prompt 01 has been completed and committed:

- Commit: `d583a8be9238e88ae45b08d8c7d076948d9882c4`
- Summary: `hb-intel-foleon: add preview fixture model`

Prompt 01 added isolated preview model and fixture files only:

- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/__tests__/FoleonPreviewData.test.ts`

The implemented preview model/fixtures now provide:

- `FoleonPreviewRecord`
- explicit preview discriminator, expected as `source: 'preview'`
- string IDs prefixed with `preview-`
- display-only preview fields
- no numeric SharePoint item IDs
- no `foleonDocId`
- no `publishedUrl`, `previewUrl`, `embedUrl`, `href`, or URL-like fields
- no telemetry identifiers
- no reader/open-mode fields
- immutable/read-only fixture exports
- helper exports:
  - `FOLEON_PREVIEW_HIGHLIGHTS`
  - `FOLEON_PREVIEW_HUB_RECORDS`
  - `getFoleonHighlightsPreviewRecords()`
  - `getFoleonHubPreviewRecords()`
  - `isFoleonPreviewRecord()`

Prompt 01 validation passed:

- `pnpm --filter @hbc/spfx-hb-intel-foleon lint`
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types`
- `pnpm --filter @hbc/spfx-hb-intel-foleon test`

No runtime proof, telemetry, route/UI wiring, package version, or manifest version was changed in Prompt 01.

## Key Design Constraint for Prompt 02

Do **not** pass `FoleonPreviewRecord` objects into live Foleon content paths.

Specifically, preview records must not be passed to:

- `FoleonCard`
- `onOpenReader`
- `onOpenExternal`
- `onCardImpression`
- `ReaderPage`
- telemetry emitters
- any service or adapter that expects `FoleonContentRecord`

The implementation must introduce preview-specific rendering components or view helpers so preview content remains visually similar to the live Highlights experience without becoming structurally live content.

## Global Instructions for the Code Agent

- Work in `/Users/bobbyfetting/hb-intel` on the live repo.
- Use the current `main` branch as source of truth.
- Before changing files, confirm the current branch and recent commits.
- Do not rely on prior summaries without verifying source files when needed.
- Do not re-read files already within your current context unless verifying a specific line, contradiction, or diff.
- Do not touch unrelated `.gitignore`, Safety files, unrelated SPFx apps, unrelated packages, generated phase docs, or untracked files.
- Do not implement beyond this prompt's scope.
- Preserve current Foleon runtime proof and diagnostics.
- Preserve runtime config bridge, manual Foleon property pane behavior, safe defaults, and diagnostics behavior introduced through versions `1.0.14.0`–`1.0.16.0`.
- Preserve Prompt 01 preview model/fixture safety boundaries.
- Do not weaken reader origin, iframe, publish-status, display-window, external-open, or preview-URL gates.
- Do not add backend dependencies for preview content.
- Do not change SharePoint list provisioning.
- Do not bump package or manifest version in Prompt 02 unless a direct runtime packaging rule in the repo requires it. If such a rule exists, stop and report before changing versions.

## Files to Inspect

Inspect only what is necessary to implement this prompt safely:

- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`
- `apps/hb-intel-foleon/src/components/FoleonCard.tsx`
- `apps/hb-intel-foleon/src/components/FoleonStates.tsx`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewTypes.ts`
- `apps/hb-intel-foleon/src/preview/FoleonPreviewData.ts`
- `apps/hb-intel-foleon/src/preview/__tests__/FoleonPreviewData.test.ts`
- relevant existing test setup under `apps/hb-intel-foleon/src/**/__tests__/**`
- `apps/hb-intel-foleon/package.json` only to confirm available scripts and dependencies

Do not inspect or modify Content Hub, Reader, Manager, shell, backend, provisioning, or package files unless TypeScript/test failures prove a strict dependency.

## Files Likely to Add or Modify

Expected additions:

- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.tsx`
- `apps/hb-intel-foleon/src/components/FoleonPreviewCard.tsx`

Optional additions, only if repo conventions support them and they improve maintainability:

- `apps/hb-intel-foleon/src/components/FoleonPreviewFallback.module.css`
- `apps/hb-intel-foleon/src/components/__tests__/FoleonPreviewFallback.test.tsx`
- `apps/hb-intel-foleon/src/pages/__tests__/HighlightsPage.preview.test.tsx`

Expected modification:

- `apps/hb-intel-foleon/src/pages/HighlightsPage.tsx`

Avoid modifying:

- `apps/hb-intel-foleon/src/types/foleon-content.types.ts`
- `apps/hb-intel-foleon/src/components/FoleonCard.tsx`
- `apps/hb-intel-foleon/src/FoleonApp.tsx`
- `apps/hb-intel-foleon/src/pages/ContentHubPage.tsx`
- `apps/hb-intel-foleon/src/pages/ReaderPage.tsx`
- `apps/hb-intel-foleon/src/pages/ManagePage.tsx`
- `apps/hb-intel-foleon/src/pages/manage/**`
- package/manifest files

## Required Behavior

### When preview fallback must render

Render a Highlights preview fallback only when all of the following are true:

1. The app has initialized and `HighlightsPage` is running.
2. Highlights route configuration is complete enough to execute the existing service calls:
   - `contract.siteUrl`
   - `contract.listIds.placements`
   - `contract.listIds.contentRegistry`
3. `fetchFoleonPlacements(...)` and `fetchFoleonContent(...)` complete successfully.
4. `materializeHighlights(placements, content)` returns an empty array.

### When preview fallback must not render

Do not render the preview fallback when:

- runtime contract cannot initialize;
- Highlights route list configuration is incomplete;
- placements/content service fetch fails;
- real content records exist;
- real placement-resolved records exist;
- Reader route is active;
- Content Hub route is active;
- Manager route is active.

Configuration errors and fetch errors must continue to render `FoleonError`, not the preview fallback.

Live content must always win over preview content.

## Implementation Requirements

### 1. Preserve the current Highlights data flow

Keep the existing load-state shape clear and deterministic.

Current behavior to preserve:

- loading state renders `FoleonLoadingState`;
- missing config creates an error state;
- fetch failure creates an error state;
- real records render the feature card and compact cards;
- live `onCardImpression(records)` runs only for real records.

Required adjustment:

- When `records.length === 0`, render the preview fallback instead of the generic `FoleonEmpty` currently used for “No Marketing highlights are currently published.”

### 2. Do not insert preview records into live state

Do not set `state.records` to preview records.

Do not widen the `HighlightsLoadState` ready records type to include preview records.

Acceptable approaches:

- keep `state.records` as `ReadonlyArray<FoleonContentRecord>` and branch in render;
- optionally add a separate `kind: 'preview'` state only if service success + empty is explicitly represented, but do not mix preview records with live records.

Preferred approach:

- leave `state.kind === 'ready'` as-is;
- if `state.records.length === 0`, render `<FoleonPreviewFallback route="highlights" records={getFoleonHighlightsPreviewRecords()} />`.

### 3. Create preview-specific display components

Create `FoleonPreviewCard` for preview display.

It must accept `FoleonPreviewRecord`, not `FoleonContentRecord`.

It must not call:

- `onOpenReader`
- `onOpenExternal`
- telemetry emitters
- live card impression callbacks

The primary action may be rendered as one of the following safe affordances:

- disabled button labeled `Preview only`;
- non-clickable pill labeled `Preview only`;
- explanatory text such as `Sample layout — real links will appear when published`.

Do not create a fake “Read” behavior.

Do not create fake external links.

Do not use `FoleonCard` for preview records unless you first refactor it to have a safe preview mode that cannot call live handlers. That refactor is discouraged in Prompt 02 because it increases risk and scope.

### 4. Create Highlights preview fallback layout

Create `FoleonPreviewFallback` as a route-aware component or Highlights-specific component.

For Prompt 02, it only needs to support `route="highlights"`. It may be designed so Prompt 03 can extend it to `route="hub"` later.

Required content treatment:

- visible `Preview` or `Sample layout` badge;
- user-facing explanation that Marketing/Foleon content is not published yet;
- clear statement that the cards are sample/preview content;
- at least one larger feature-style preview card;
- at least three compact preview cards if fixture data provides them;
- no fake live publication labels that imply actual publication;
- no real URL or external open behavior.

Suggested copy direction:

- Title: `Preview: Marketing highlights`
- Description: `This sample layout shows how Foleon project spotlights, company news, and leadership updates will appear once live content is published.`
- Badge: `Preview`
- Action label: `Preview only`

The copy may be refined to match project tone, but it must remain honest and unambiguous.

### 5. Visual and UX requirements

The preview should be polished enough to replace a dead empty state on the homepage.

Required UX qualities:

- visibly intentional, not generic empty-state text;
- coherent with the live Highlights hierarchy: one feature + supporting cards;
- compact enough for a homepage lane;
- responsive under nested SharePoint widths;
- accessible labels and heading structure;
- no hover-only critical meaning;
- keyboard-safe controls if any interactive elements exist;
- safe disabled affordances where actions are not available;
- no external image dependencies;
- no copyrighted/random internet images.

Use CSS/gradient/tint placeholder treatments or existing governed UI primitives. Do not add external image URLs.

Use `@hbc/ui-kit/homepage` primitives where practical and consistent with current source.

Follow the governing UI doctrine:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

Do not overbuild this into a full redesign. Prompt 02 is a focused fallback implementation.

### 6. Telemetry requirements

Preview display must not emit normal production telemetry.

Specifically:

- do not call `onCardImpression` with preview records;
- do not emit `Card Impression` for preview cards;
- do not emit `Card Click` for preview cards;
- do not emit `External Open` for preview cards;
- do not add a preview-specific telemetry event in Prompt 02.

If existing `onCardImpression(records)` is currently called with an empty array after load, it is acceptable to leave as-is only if tests confirm no telemetry envelopes are produced for preview cards. If the call produces unnecessary empty work, you may guard it with `if (records.length > 0)` as a narrow improvement.

### 7. Runtime proof and diagnostics requirements

Do not change runtime contract resolution.

Do not change:

- `resolveFoleonRuntimeContract`
- `publishRuntimeBindingProof`
- `FOLEON_PACKAGE_VERSION`
- `FoleonWebPart.manifest.json`
- runtime config bridge behavior
- property pane behavior
- diagnostics issue codes

The preview fallback must not affect:

- `canInitialize`
- `issueCodes`
- config source reporting
- redacted proof fields
- origin allowlist proof

`canInitialize` must continue to mean configuration readiness, not content presence.

## Explicit Non-Goals

Do not do any of the following in Prompt 02:

- implement Content Hub preview fallback;
- implement Reader preview mode;
- implement Manager guidance;
- change Foleon backend/API behavior;
- change SharePoint list provisioning;
- add tenant REST auto-discovery;
- create or modify Azure Functions routes;
- create fake Foleon URLs;
- make preview cards open anything;
- add production telemetry for preview content;
- add package binaries;
- bump package/manifest version;
- modify unrelated docs beyond a narrow note if required by local convention.

## Testing Requirements

Add or update tests proving the following.

### Component-level preview tests

If `FoleonPreviewFallback` and/or `FoleonPreviewCard` are tested directly, prove:

- the fallback renders visible `Preview` or `Sample layout` language;
- sample cards render using `FoleonPreviewRecord` data;
- at least one feature-style preview card is displayed;
- compact preview cards are displayed;
- action affordances are disabled or non-opening;
- no external anchors are rendered for preview cards;
- no button/action calls live open handlers;
- accessible labels/headings are present.

### Highlights route tests

Add or update tests proving:

- configured + successful empty content/placements renders the preview fallback;
- configured + live records renders live `FoleonCard` output and not preview fallback;
- configured + placement-resolved records render live content and not preview fallback;
- missing config renders `FoleonError`, not preview fallback;
- fetch error renders `FoleonError`, not preview fallback;
- preview fallback does not call `onOpenReader`;
- preview fallback does not call `onOpenExternal`;
- preview fallback does not call `onCardImpression` with preview records;
- live record path still calls `onCardImpression` for live records.

If testing service calls is difficult due to current test harness limitations, mock `fetchFoleonContent` and `fetchFoleonPlacements` at the module boundary and document the approach in the closure report.

### Type-safety tests or assertions

Rely primarily on TypeScript, but add tests where useful to assert:

- preview records are not structurally live records;
- preview cards accept only `FoleonPreviewRecord`;
- live cards continue to accept only `FoleonContentRecord`.

Do not use unsafe `as unknown as FoleonContentRecord` casts to force preview records through live paths.

## Validation Commands

Run the following after implementation:

```bash
git status --short
git branch --show-current
git log -5 --oneline

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
```

Do not run packaging unless a local repo convention requires it for this package.

If a validation command fails:

1. Determine whether the failure is caused by your Prompt 02 changes.
2. Fix failures caused by your changes.
3. For unrelated pre-existing failures, document the failure clearly and do not modify unrelated files.

## Commit Rules

If changes are made and validation is complete, create one focused commit.

Commit summary:

```text
hb-intel-foleon: add highlights preview fallback
```

Commit body must include:

- what changed;
- validation commands run;
- runtime proof impact;
- telemetry impact;
- confirmation no package/manifest version changed;
- confirmation Content Hub/Reader/Manager were not changed;
- follow-up deferred to Prompt 03 or Prompt 05, if any.

Do not commit generated `.sppkg` binaries unless the active repo packaging standard explicitly requires them.

## Required Closure Report

After execution, provide:

```md
# Closure Report

## Summary

## Files Changed

## Behavior Implemented

## Preview Safety Confirmation
- Confirm preview records remain separate from `FoleonContentRecord`.
- Confirm preview records are not passed into `FoleonCard`.
- Confirm preview records are not passed into `onOpenReader`.
- Confirm preview records are not passed into `onOpenExternal`.
- Confirm preview records are not passed into `onCardImpression`.
- Confirm preview cards cannot open Reader or external Foleon URLs.

## Tests Added / Updated

## Validation Commands and Results

## Runtime Proof Impact

## Telemetry Impact

## Package / Manifest Version

## Risks / Follow-Ups

## Commit
```

## Acceptance Criteria

Prompt 02 is complete only when:

- empty configured Highlights state renders a polished, clearly labeled preview fallback;
- live content continues to render normally;
- errors remain errors;
- preview records never enter live content, reader, open, or telemetry paths;
- no runtime proof behavior changes;
- no package/manifest version changes;
- lint, type-check, and tests pass or unrelated pre-existing failures are documented;
- a focused commit is created if implementation changes are made.
