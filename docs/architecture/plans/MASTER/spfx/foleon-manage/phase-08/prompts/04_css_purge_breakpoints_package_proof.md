# Prompt 04 — CSS Purge, Breakpoints, and Package Proof

## Objective

Remove the remaining visual debt: card-stack CSS, horizontal bands, over-boxed sections, and old manager class scaffolding.

## Files to Inspect

- `manageShell.module.css`
- `foleonManageTokens.css`
- all new Feed Manager CSS modules
- `FoleonWebPart.manifest.json`
- `package-solution.json`
- `ManagePage.test.tsx`

## Required CSS Outcome

- No top-level app section composes `.panel`.
- `.panel` is either removed or limited to legacy Admin/child surfaces with proof.
- Header is not a card.
- Nav is not a card.
- Status/readiness information is compact and subordinate.
- Queue is the main object.
- Slots are compact.
- Inspector is clearly secondary.
- Root canvas is neutral.
- No giant tinted shell.

## Breakpoints

Desktop/wide:

- Feed Desk uses slots + queue + inspector.

Tablet:

- Slots horizontal/stacked above queue.
- Inspector drawer.

Phone:

- Queue full width.
- Inspector full-screen drawer.
- Header compressed.

Short-height:

- Primary action remains visible.
- Queue remains reachable.

## Tests

- No primary nav Lane Board.
- Feed Desk structure renders.
- Inspector keyboard behavior.
- Canvas attr still manager-only.
- Reader/highlight/embed route attr absence.
- Token degraded and write gating unchanged.

## Validation Commands

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Manifest Version

Bump to the next four-part SPFx package version because this is a material hosted UI change.

## Hosted Proof

Do not claim hosted proof. Mark it operator-pending until screenshots are provided.

## Commit Message

`SPFx Foleon Manager: purge card-stack UI and package feed desk rebuild`

