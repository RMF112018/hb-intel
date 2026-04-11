# Plan Summary — HB Kudos Photo Association Defect

## Current-state finding
HB Kudos is already using the correct shared UI lane for people selection, but the consumer integration is incomplete.

- The webpart creates and passes `searchPeople`.
- The shared composer and shared people picker are already built to accept `fetchPersonPhoto`.
- The shared photo cache is already built around a separate Graph `/photo/$value` request path.
- The consumer does not pass the photo adapter, so the UI falls back to initials.

This is an incomplete integration defect, not a reason to redesign the picker from scratch.

## Target state
The HB Kudos consumer should continue using the current search seam, but must also pass a Graph-backed `fetchPersonPhoto` adapter into the shared composer so that the shared picker can resolve photos asynchronously for both dropdown rows and selected chips.

## Shared ownership decision
- Shared owner for picker rendering, chip behavior, photo cache behavior, and photo contract:
  - `packages/ui-kit/src/HbcPeoplePicker/**`
  - `packages/ui-kit/src/HbcKudosComposer/index.tsx`
  - `packages/ui-kit/src/homepage.ts`
- Consumer owner for environment-specific wiring:
  - `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
  - any local token-provider glue needed in SPFx/homepage lane

## Extraction / remediation strategy
### Pass 1 — Defect closure
Wire a Graph-backed `fetchPersonPhoto` adapter into `HbKudos.tsx` and pass it through `HbcKudosComposerForm`.

### Pass 2 — Shared lane hardening
Tighten any weak spots in the shared `PersonEntry` / Graph-search contract that undermine future reuse, but do not turn this into a broad rewrite.

### Pass 3 — Validation
Prove:
- result rows show photo when available
- selected chips show photo when available
- missing-photo users show initials
- search still works
- no package-boundary violations were introduced

## Acceptance criteria
- No more initials-only rendering for users who actually have directory photos.
- No broken image UI for users without photos.
- No local duplicate photo cache.
- No local duplicate people picker.
- No ad hoc inline avatar hacks inside Kudos row rendering.
- Existing typed-recipient flow remains intact.
