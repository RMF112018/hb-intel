# Prompt-07 — Closure Note (Automated Proof + Hosted Proof Contract)

## Purpose
Record the closure-grade proof that now governs the
`PriorityActionsRail` + `HbHomepage` flagship integration surface.
Combines the automated coverage added in Prompts 01–07 with the
hosted-runtime verification contract from
[`09-Hosted-Runtime-Proof-Checklist.md`](09-Hosted-Runtime-Proof-Checklist.md).

## A. Package / deployment proof (checklist §A)
- Orchestrated via `npx tsx tools/build-spfx-package.ts --domain hb-homepage`.
- Fresh `dist/sppkg/hb-intel-homepage.sppkg` + `hb-homepage-package-truth-proof.json` written every build; the tool emits SHA-256 source + packaged bundle freshness checks and fails the run on drift.
- Solution + feature versions bumped each prompt so SharePoint re-applies assets (1.1.15.0 → 1.1.21.0 across phase-08).

## B. Runtime attribute proof (checklist §B)
Automated proof pinning every hosted-required marker lives in
`packages/ui-kit/src/HbcPriorityRail/__tests__/HbcPriorityRailClosureMarkers.test.tsx`.
It asserts — on a single flagship render — all of:

- `[data-hbc-ui="priority-rail"]`
- `data-hbc-priority-rail-context="homepage-flagship"`
- `data-hbc-premium="priority-rail"`
- `data-hbc-flagship-layout="command-strip"`
- `[data-hbc-flagship-grid="true"]`
- `[data-hbc-flagship-tile="true"]` with `data-hbc-tile-section`
- `[data-testid^="section-"]` section-integrity markers
- `[data-hbc-flagship-overflow="true"]` when overflow is present
- `[data-hbc-flagship-single-section="true"]` under single-group compaction
- `[data-hbc-flagship-compacted="true"]` under featured-band collapse

Wrapper-side markers (`data-hb-homepage-entry-stack="root"`,
`data-hb-homepage-entry-stack-region="priority-actions"`,
`data-hb-homepage-entry-stack-rail-context="homepage-flagship"`) are
pinned by the pre-existing
`apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
suite.

Container/device markers (`data-hbc-rail-device-class`,
`data-hbc-rail-shell-state`, `data-hbc-rail-short-height`) are emitted
from `PriorityActionsRail.tsx` on the ListSourcedRail container.

## C. Visual proof by device class / width (checklist §C)
Automated coverage of the divergence contract lives in
`apps/hb-webparts/src/homepage/__tests__/priorityActionsPresentation.test.ts`:

- Prompt-04 overflow-strategy matrix (desktop/tablet → `menu`, phone
  sheet-trigger → `sheet`, phone scroll → `inline-disclosure`).
- Prompt-05 layout divergence matrix (desktop hybrid → `grid`;
  laptop hybrid → `rail`; tabletPortrait → `compact` for all authored
  tablet modes; phone → `compact`).

Hosted screenshots remain an operator deliverable against the live
tenant. The automated matrix prevents divergent code from shipping,
but the hosted proof is still required before closing.

## D. Interaction proof (checklist §D)
`packages/ui-kit/src/HbcPriorityRail/__tests__/HbcPriorityRailAccessibility.test.ts`
and `HbcPriorityRail.test.tsx` already cover:

- inline-disclosure `aria-expanded` / `aria-controls`
- Escape dismissal and focus-return-to-trigger
- external-link cues
- menu / sheet focus handling via `@floating-ui/react`

Reduced-motion is enforced at the token level (`@hbc/ui-kit/homepage`
re-exports `useHomepageReducedMotion`) and by the tile transitions,
which use `transform`/`box-shadow` and are already safe under the
`prefers-reduced-motion` media query.

## E. Product-quality proof (checklist §E)
Automated:

- **No sparse singleton section waste** — Prompt-03 collapses the
  featured band when `supporting.length === 0` or `totalVisible === 1`
  (test: `HbcPriorityRail.test.tsx` — *flagship compacts the featured
  band when every tile is featured* + *single-action primary
  collapses*).
- **No redundant adjacent heading repetition** — Prompt-03 suppresses
  duplicate eyebrows adjacent and when a single section drives the
  band (test: *single-section eyebrow suppression* + *adjacent
  duplicate eyebrow suppression*).
- **Clear primary-vs-secondary hierarchy** — Prompt-02 curator
  deterministically round-robins groups into the primary and pushes
  residue + forced items to overflow (test:
  `priorityActionsCuration.test.ts` — 6 cases).
- **Command density** — Prompt-06 CSS tuning tightens strip gap +
  minmax so 5 tiles fit at 1040px (no dead gutter). CSS diff lives
  in `priority-rail.module.css`.
- **No flat Quick Links regression** — default-context test pins
  per-section headings still render for admin / non-homepage
  consumers (test: *default-context surface still renders
  per-section headings*).

## F. Failure-state proof (checklist §F)
Automated distinction of loading / empty / error via ARIA roles is
pinned in `HbcPriorityRailClosureMarkers.test.tsx`.

## G. Closure note (checklist §G)
**Automated proof** now covers the behaviors that actually matter to
closure — curation determinism, singleton compaction, eyebrow-waste
suppression, device-class layout divergence, overflow strategy
matrix, wide-state density, and runtime-marker integrity — in
addition to the wrapper composition contract and rail accessibility
suite that were already in place.

**Hosted proof** remains an operator deliverable:

1. Deploy `dist/sppkg/hb-intel-homepage.sppkg` (version 1.1.21.0 or
   later) to the target tenant and approve the app catalog entry.
2. Load the homepage; capture hosted screenshots at standard
   desktop, laptop, tablet landscape, tablet portrait, and phone
   widths.
3. Capture runtime DOM showing the wrapper + rail + container
   markers listed in §B above.
4. Verify overflow behavior per strategy (menu anchored on
   desktop/tablet, sheet modal on phone sheet-trigger, inline
   disclosure on phone scroll fallback).
5. Confirm failure states render correctly (loading skeleton, empty
   authoring copy, error retry).

Only after steps 1–5 are attached to the closure ticket should the
surface be considered closed. The automated suite prevents regression
between deployments; the hosted proof confirms the freshly deployed
assets actually render the intended flagship path on the live tenant.

## Running the automated suite

```
pnpm -C packages/ui-kit vitest run src/HbcPriorityRail
pnpm -C apps/hb-webparts vitest run src/homepage/__tests__/priorityActions
pnpm -C apps/hb-webparts vitest run src/webparts/hbHomepage/__tests__
```

Total phase-08 test coverage added: 14 new cases across 3 files
(priorityActionsCuration.test.ts — 6; HbcPriorityRail.test.tsx
flagship compaction — 5; HbcPriorityRailClosureMarkers.test.tsx —
4; presentation matrix — 2 new cases).
