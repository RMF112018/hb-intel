# Prompt 01 — Realign Shared Signature Hero to Current Homepage Doctrine

## Objective

Refactor the shared homepage hero primitive so it is safe to use as the flagship opening surface for `hbHomepage` under the **current** homepage doctrine, not the older pre-Phase-18 assumptions still visible in the existing primitive.

## Governing authority

Apply these as binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Also align with:
- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`

## Exact seams to inspect

- `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx`
- `packages/ui-kit/src/homepage.ts`
- any adjacent CSS module or helper imported by `HbcSignatureHeroSurface`
- any docs or stories adjacent to that surface if present

## Current future-state gap to close

The current `HbcSignatureHeroSurface` is not yet safe as the flagship homepage top-band because it still encodes outdated assumptions:

- it exposes extra editorial/CTA/context/metadata slots that exceed the locked homepage hero content model
- it still supports a gradient-wash image treatment that does not match the current overlay’s approved hero background posture
- it is not clearly narrowed to the Phase-18 flagship identity contract

The homepage shell should not consume this primitive as-is.

## Required implementation outcome

Refactor the hero primitive so it supports the current homepage top-band doctrine:

1. Narrow the flagship API to the required identity object:
   - company logo / lockup
   - `HB Central`
   - tagline `Build with GRIT.`
   - personalized greeting

2. Remove or retire the outdated flagship-slot assumptions:
   - editorial headline slot
   - CTA slot
   - context row
   - metadata row
   - any other extra furniture that causes the hero to behave like a generic premium banner instead of the locked flagship homepage object

3. Realign background handling:
   - no gradient-wash banner treatment as the primary flagship answer
   - support either authored photography with restrained readability treatment or the approved charcoal fallback posture

4. Preserve premium quality:
   - keep disciplined motion where allowed
   - keep reduced-motion respect
   - keep accessibility and host-safe behavior
   - keep strong brand authority without fake shell chrome

5. Update homepage entrypoint exports if needed so the shell can consume the corrected primitive cleanly through `@hbc/ui-kit/homepage`.

## Proof of closure

Show all of the following in your final response:

- exact files changed
- old API vs new API summary
- explicit statement of how the primitive now matches the current homepage overlay rules
- confirmation that no outdated flagship slots remain in the primary path
- any follow-on consumer migration required for `hbHomepage`

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not rebuild unrelated homepage surfaces.
- Do not add fake shell chrome.
- Do not keep legacy flagship slots alive as the default path just to avoid changing consumers.
