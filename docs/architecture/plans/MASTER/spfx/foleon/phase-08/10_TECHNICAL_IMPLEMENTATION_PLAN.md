# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Technical Implementation Plan

## Guardrails

Preserve:

- Foleon as content source;
- existing origin policy;
- full-window viewer behavior;
- preview vs production state handling;
- no-inline-iframe posture for governed lanes;
- safe open behavior;
- Project Spotlight and Company Pulse stability;
- package/runtime proof requirements.

Do not weaken:

- accepted origin checks;
- viewer launch behavior;
- preview fallback logic;
- accessibility;
- package proof;
- host-aware layout constraints.

## Proposed file structure

### Add

```text
packages/foleon-reader/src/readers/viewModels/leadershipMessageViewModel.ts
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.module.css
packages/foleon-reader/src/readers/__tests__/leadershipMessageViewModel.test.ts
```

### Update

```text
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css.d.ts
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
```

### Update only if repo truth requires

```text
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

## Step 1 — Extract leadership-specific view model

Create a normalized `LeadershipMessageCardModel`:

```ts
type LeadershipMessageState =
  | 'live'
  | 'preview'
  | 'no-live-message'
  | 'external-open-only'
  | 'blocked'
  | 'archived'
  | 'scheduled';

interface LeadershipMessageCardModel {
  readonly state: LeadershipMessageState;
  readonly laneLabel: string;
  readonly statusLabel: string;
  readonly headline: string;
  readonly summary?: string;
  readonly sourceLabel?: string;
  readonly executiveName?: string;
  readonly executiveRole?: string;
  readonly executivePhotoUrl?: string;
  readonly executivePhotoAlt?: string;
  readonly pullQuote?: string;
  readonly contextItems: readonly { id: string; label: string; value: string }[];
  readonly cta: {
    readonly label: string;
    readonly disabled: boolean;
    readonly reason?: string;
  };
  readonly target?: FoleonViewerTarget;
}
```

Map from existing `FoleonContentRecord` without inventing missing fields.

## Step 2 — Replace preview copy

Remove sample person/quote/audience placeholders from the preview adapter. Preview should generate product-safe validation copy only.

## Step 3 — Rebuild layout

Use the recommended Executive Briefing Feature structure:

- outer semantic article;
- source/status row;
- headline;
- summary;
- optional quote;
- visible CTA;
- optional context chips;
- disabled reason;
- optional archive action outside primary card.

The layout should avoid full article-body rendering. It should use `summary` as teaser only.

## Step 4 — CTA and viewer behavior

Keep the single-control card pattern or introduce a visually clear CTA button that remains the only primary interactive control inside the launch card.

Acceptable patterns:

- Entire feature card is clickable, with visible CTA pill inside title button.
- Explicit CTA button is the single launch control, and the full card is not clickable.

Preferred: explicit CTA as the single launch control for clarity.

## Step 5 — State rendering

Implement specific branches:

- preview;
- live;
- no live;
- blocked;
- external-open-only;
- archived/scheduled if state can be derived.

## Step 6 — CSS

Prefer a dedicated module or clearly isolated section.

Required traits:

- no outer thin generic card as the dominant posture;
- calm gradient or material surface;
- controlled line lengths;
- responsive grid with container-aware behavior;
- CTA preserved at narrow widths;
- context chips wrap/hide safely;
- reduced-motion safe.

## Step 7 — Tests

Add/modify tests to fail on the current product defects:

- no `Leadership Message reader` visible text;
- no `Sample executive byline`;
- no `Sample role`;
- no `Sample pull quote`;
- no `Sample audience`;
- no `Cadence` visible text;
- no `Archive group` visible text;
- no `Executive byline not provided.`;
- visible CTA label exists in live state;
- no full article-body duplicate;
- preview state shows `Preview content shown for layout validation only.`;
- external-open-only CTA uses `Open in Foleon`;
- blocked state has visible employee-safe reason;
- keyboard launch works;
- focus return works via provider tests;
- sibling lanes unchanged.

## Step 8 — Package/version

Only bump versions if source behavior is packaged into SPFx and tenant deployment requires it. Keep lockstep package constants aligned.
