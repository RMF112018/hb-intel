# Prompt 01 — Build Leadership Message View Model

## Objective

Rebuild the Leadership Message reader view model so the lane behaves as a premium HB Central access point into a Foleon-managed leadership message. Remove developer/sample/internal copy from the data model before touching the visual layout.

Do not re-read files that are still within your current context or memory unless needed to verify repo truth or resolve a contradiction.

## Files to inspect

```text
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/types/foleon-content.types.ts
packages/foleon-reader/src/readers/FoleonViewerTypes.ts
packages/foleon-reader/src/readers/readerConfigs.ts
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
packages/foleon-reader/src/readers/__tests__/LeadershipMessageReaderLayout.test.tsx
docs/architecture/plans/MASTER/spfx/foleon-reader/leadership-message-reader-rescue/**
docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
docs/reference/ui-kit/doctrine/**
```

## Files likely to change

```text
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/viewModels/leadershipMessageViewModel.ts
packages/foleon-reader/src/readers/__tests__/FoleonReaderViewModel.test.ts
packages/foleon-reader/src/readers/__tests__/leadershipMessageViewModel.test.ts
```

Create `viewModels/leadershipMessageViewModel.ts` if repo structure allows. If not, keep the helper colocated but isolate it clearly.

## Guardrails

- Preserve Foleon as content source.
- Do not invent executive identity.
- Do not show raw archive group/cadence/sync fields in employee-facing model.
- Preserve viewer target creation and origin/open policy.
- Do not change Project Spotlight or Company Pulse behavior except for type-safe shared model additions.
- Do not reintroduce inline iframe behavior.

## Steps

1. Inspect current Leadership preview and ready mapping.
2. Define a leadership-specific normalized model with:
   - state;
   - lane label;
   - status label;
   - headline;
   - summary/teaser;
   - optional source/executive fields;
   - optional real pull quote;
   - context items;
   - CTA model;
   - target/open metadata.
3. Replace preview placeholders with preview-safe validation copy only.
4. Stop deriving a production pull quote from summary unless a real field exists.
5. Stop surfacing `Executive byline not provided.` as a model value.
6. Filter context items:
   - include published date if available;
   - include topic only if specific;
   - include audience only if meaningful/targeted;
   - exclude cadence/archive group from employee model.
7. Add/adjust tests that fail if forbidden sample/internal strings are produced.

## Tests

Run:

```bash
pnpm --filter @hbc/foleon-reader test -- FoleonReaderViewModel
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

## Acceptance criteria

- No Leadership preview view model contains `Sample executive byline`, `Sample role`, `Sample pull quote`, `Sample audience`, or `Preview layout`.
- No ready model exposes `Executive byline not provided.`
- CTA model exists for live/external/blocked states.
- Context items do not contain `Cadence` or `Archive group`.
- Project Spotlight and Company Pulse tests remain green.

## Commit message

```text
Foleon reader: rebuild Leadership Message view model for executive access point

Normalizes the Leadership Message lane around employee-facing status, headline, summary, CTA, and restrained context while removing sample/person/internal metadata from preview and ready models. Preserves existing Foleon viewer targets, safe origin policy, and sibling lane behavior.
```
