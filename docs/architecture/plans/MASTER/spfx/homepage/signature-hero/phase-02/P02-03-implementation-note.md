# P02-03 Implementation Note — Fix Webpart Registry and Bundle Routing

**Prompt:** `Prompt-03-Fix-Webpart-Registry-And-Bundle-Routing.md`
**Date:** 2026-04-06
**Version:** 1.0.0.72

## Registry Source of Truth

The webpart ID → component routing table is `WEBPART_RENDERERS` in `apps/hb-webparts/src/mount.tsx` (line 25-37). This is the sole runtime dispatch map — the shell entry shim calls `mount(element, context, { webPartId })` and mount.tsx resolves it via this map.

## Old Failure

Before P02-01, `WEBPART_RENDERERS` had 10 entries but **omitted** the Signature Hero ID (`28acd6a7`). When SharePoint loaded the HbSignatureHero webpart, the shell shim correctly passed `webPartId: "28acd6a7-..."` to `mount()`, but the lookup on line 55 returned `undefined`. The fallback on line 62 rendered `ReferenceHomepageComposition` (the full 5-zone homepage preview) instead of the standalone hero.

## Current State (Fixed in P02-01)

`mount.tsx` now includes:
- Line 15: `import { HbSignatureHero } from './webparts/hbSignatureHero/HbSignatureHero.js';`
- Line 36: `'28acd6a7-2582-4d8a-86d4-b52bfbeb375c': ({ identity }) => createElement(HbSignatureHero, { identity }),`

The renderer passes only `identity` (not `config`) because HbSignatureHero has no authored configuration properties — content is locked to logo + tagline + personalized greeting.

## Legacy Routing

HbHeroBanner (`39762a4d`) and PersonalizedWelcomeHeader (`46bfde64`) remain in `WEBPART_RENDERERS` for standalone/non-flagship use. They are not hijacking flagship routing because:
- They have different webpart IDs
- Both are `hiddenFromToolbox: true` — authors cannot add them
- The Signature Hero ID now resolves directly to `HbSignatureHero`

## What Changed in This Prompt

### Registry-proof validation added

**File:** `tools/validate-manifests.ts`

Added hb-webparts bundle registry proof section that checks:

1. **Built bundle contains Signature Hero ID** — Reads `apps/hb-webparts/dist/hb-webparts-app.js` and fails if `28acd6a7-2582-4d8a-86d4-b52bfbeb375c` is absent
2. **mount.tsx imports HbSignatureHero** — Fails if the component import is missing
3. **mount.tsx WEBPART_RENDERERS contains Signature Hero ID** — Fails if the renderer entry is missing
4. **Legacy hijack warning** — Warns if HbHeroBanner is registered but HbSignatureHero is not (detects the pre-P02-01 failure pattern)

### Version bump

`package-solution.json`: `1.0.0.71` → `1.0.0.72`

## Validation Proof

| Check | Result |
|-------|--------|
| `28acd6a7` in built bundle | Present (1 occurrence) |
| `HbSignatureHero` import in mount.tsx | Present (line 15) |
| `28acd6a7` in WEBPART_RENDERERS | Present (line 36) |
| `npx tsx tools/validate-manifests.ts` | All hb-webparts checks pass |
| Legacy routing hijack | Not occurring — separate IDs, hidden from toolbox |

## Shell-Entry Alignment

The shell entry shim (`shell-entry-28acd6a7-...-215b2f95.js`) was already correct before P02-01:
- Calls `__hbIntel_hbWebparts.mount(element, context, { webPartId: "28acd6a7-..." })`
- mount.tsx now resolves this to `HbSignatureHero` via `WEBPART_RENDERERS`
- No shell-entry changes were needed
