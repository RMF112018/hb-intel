# Plan Summary — Enhanced Wave 01

## Objective

Strengthen the existing Wave 01 remediation package so it becomes execution-grade for a local code agent and closes the real forward-state gaps still visible in the live `apps/hb-publisher` implementation.

The package must remain tightly scoped to the supported **Project Spotlight** runtime while materially improving runtime truth, authoritative data seams, burden-reducing behavior, and closure evidence.

## Repo-truth framing

The current Publisher is not a weak product that needs a structural rescue.
It already has strong foundations that must be preserved:

- a credible three-region editorial workspace
- strong save/readiness/preview trust loops
- a real ProjectPicker interaction model
- productized team and media authoring surfaces
- system-managed slug governance

Wave 01 therefore is not a shell-redesign wave.
It is a **truth-hardening and friction-reduction wave**.

## Wave 01 closure units

### 1. Governed asset provider
Create or confirm the real tenant-safe provider behind `AssetLibrarySearchFn`, with explicit contract, host assumptions, and failure behavior.

### 2. Runtime wiring for governed asset acquisition
Thread the provider through `mount.tsx` into `ArticlePublisher` so hero, secondary-image, and gallery/media acquisition all truly lead with governed library browse in the supported hosted runtime.

### 3. Authoritative project identity contract
Move the Publisher's project lookup away from brittle title-bound assumptions and toward the repo's stronger GUID-bound list-descriptor posture, while preserving the current picker UX.

### 4. Safe project-aware defaults and first-draft assistance
Expand burden-reducing defaults only where repo truth supports safe system-owned behavior and author override is preserved.

### 5. Product behavior over helper narration
Tighten the first-pass flow after defaults/assistance improvements land so ordinary workflow asks less of the author up front and relies less on explanatory prose.

### 6. Closure proof
Prove the changes through targeted tests, hosted-runtime validation, and package-truth artifacts rather than vague success claims.

## Prompt ordering

The prompt order is deliberate and should be followed:

1. implement the concrete governed asset provider
2. wire it into the real runtime and all relevant authoring surfaces
3. harden project lookup identity and list binding
4. expand safe defaults / first-draft assistance
5. reduce first-pass friction after the behavioral improvements exist
6. produce closure proof with build/package/runtime evidence

## What this package explicitly does not do

- it does not broaden the Publisher beyond Project Spotlight
- it does not perform a general shell redesign
- it does not open a separate wave for story-editor expansion
- it does not accept “future work” language for items that belong in Wave 01

## Commands likely to matter during closure

Use the strongest relevant repo-truth validation commands after the implementation work:

- `pnpm --filter @hbc/spfx-hb-publisher check-types`
- `pnpm --filter @hbc/spfx-hb-publisher test`
- `pnpm --filter @hbc/spfx-hb-publisher build`
- `npx tsx tools/build-spfx-package.ts --domain hb-publisher`

Then inspect the resulting `dist/sppkg/` evidence for the Publisher domain.

## Package success standard

This package succeeds only if it enables the code agent to deliver a Wave 01 result that is:

- materially more authoritative than the prior package
- more precise at the seam level
- more explicit about what to change and what not to change
- more rigorous about proof of closure
- fully usable as an implementation package without asking for follow-on clarification to close obvious in-scope work
