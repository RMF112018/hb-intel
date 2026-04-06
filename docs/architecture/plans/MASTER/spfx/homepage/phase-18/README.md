# Phase 01 Prompt Package — Signature Hero Canonicalization + Premium Rebuild

## Objective

Implement Phase 01 of the HB Central homepage rebuild by making the **Signature Hero** the single canonical homepage hero surface and executing a **sweeping, premium UI refinement** of that hero.

This phase is intentionally narrow in scope but deep in impact.

The work must:
- eliminate the split top-band architecture for homepage flagship usage
- reduce the hero content to only:
  - company logo
  - tagline: **Build with GRIT.**
  - personalized welcome message
- remove the current gradient-heavy background treatment
- replace it with a more premium, current, confident background system
- preserve authoring safety, accessibility, and SPFx production readiness

## Important Working Rule

**Do not re-read files that are already in your active context window or current working memory.**
Before opening a file, ask whether you already have enough context from earlier steps in this prompt execution. Re-read only when necessary to resolve uncertainty or validate a change before writing.

## Required Repo Areas

Primary implementation focus:
- `apps/hb-webparts/src/webparts/hbSignatureHero/`
- `apps/hb-webparts/src/webparts/hbHeroBanner/`
- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `packages/ui-kit/src/HbcSignatureHeroSurface/`
- `packages/ui-kit/src/homepage.ts`
- `docs/reference/ui-kit/doctrine/`
- any homepage shared token / stylesheet files actually used by the hero path

## Phase 01 Outcome

At the end of this phase:
1. `HbSignatureHero` is the **only** homepage flagship hero path.
2. The split hero/greeting path is deprecated for homepage flagship composition.
3. The hero contains only logo, tagline, and personalized greeting.
4. The background is premium, current, restrained, and **not** a stodgy gradient wash.
5. The result looks materially more elegant, minimal, and confident than the current top band.
6. The implementation is validated for:
   - SPFx runtime reality
   - full-width rendering
   - accessibility
   - reduced motion
   - edit/authoring states
   - responsive crop behavior

## Prompt Sequence

Run these prompts in order:

1. `Prompt-01-Canonicalize-Signature-Hero.md`
2. `Prompt-02-Rebuild-Hero-Visual-System.md`
3. `Prompt-03-Implement-Hero-Background-System.md`
4. `Prompt-04-Harden-Accessibility-Authoring-And-Docs.md`

## Hard Gates

Do not declare this phase complete unless all of the following are true:

- no homepage flagship composition depends on a separate `hbHeroBanner` + `personalizedWelcomeHeader` pairing
- the live reference composition uses the canonical signature hero only
- the signature hero contains only:
  - logo
  - tagline “Build with GRIT.”
  - personalized welcome message
- no CTA row
- no eyebrow
- no metadata row
- no alert chip
- no editorial headline/message block
- no orange/blue gradient wash background
- the hero still feels premium and substantial, not empty
- full-width support remains intact where required
- all text remains readable over the new background in realistic responsive states
- docs are updated to reflect the new canonical hero direction

## Deliverables

Create or update as needed:
- implementation changes in code
- doctrine/documentation updates
- concise completion notes summarizing:
  - what changed
  - what was removed
  - what remains for future phases
  - any risk or follow-up items

## Commit Guidance

Use clean, scoped commits by prompt or logical milestone.
Avoid dumping unrelated cleanup into this phase.
