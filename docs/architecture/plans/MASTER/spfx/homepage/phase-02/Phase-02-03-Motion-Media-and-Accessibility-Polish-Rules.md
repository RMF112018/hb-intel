# Phase 02-03 — Motion, Media, and Accessibility Polish Rules

## Objective

Close Phase 02 by wiring motion discipline, media treatment, focus/contrast quality, and branded loading/empty-state polish into the homepage lane so the design upgrade is production-safe rather than demo-only.

## Required pre-read

Before making changes, read:
- outputs from Phase 02-01 and 02-02
- all Phase 01 completion notes
- `Homepage-Acceptance-Checklist.md`
- `Homepage-Per-Webpart-Contract-Reference.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md`

Do not re-read files that are already in your current context window or memory unless they changed or you need exact wording for a targeted edit.

## Repo-truth findings this prompt must honor

- reduced-motion, visible focus, contrast, and host-aware behavior are binding in the SPFx doctrine
- Phase 01 already locked loading, empty, invalid, stale, and noResults semantics
- shell takeover and shell mimicry remain prohibited
- top-band, utility, editorial, and discovery zones may have different density and emphasis, but the system must still feel coherent

## Implementation target

Make the Phase 02 design upgrade feel production-grade by tightening:
- hover and focus behavior
- CTA/interactive affordance
- loading and empty-state polish
- media presentation
- reduced-motion compliance
- contrast and readability

## Work scope

### 1. Refine motion
Audit existing motion and interaction behavior in homepage surfaces.

Targets:
- subtle, fast, purposeful transitions only
- no decorative or theatrical motion
- clear `prefers-reduced-motion` handling
- no motion that fights SharePoint page composition or edit-mode behavior

### 2. Refine media treatment
Where webparts accept or display media, ensure:
- consistent aspect-ratio behavior
- stable layout without jumpiness
- clean placeholders
- alt-text-safe handling
- overlays and contrast that preserve readability

### 3. Refine hover, focus, and interactive states
Create a coherent homepage interaction language for:
- links
- CTA buttons
- utility tiles
- cards with clickable affordances
- search/wayfinding interactions

Targets:
- visible focus states
- premium but restrained hover behavior
- no ambiguous click targets
- accessible contrast preserved throughout

### 4. Upgrade branded loading and empty states
Phase 01 guaranteed these states exist. Phase 02 must make them feel polished.

Targets:
- branded loading skeleton or spinner presentation where appropriate
- consistent empty-state typography and spacing
- no “plain scaffold placeholder” look
- preserve authoring-message clarity

### 5. Expand acceptance coverage where Phase 02 materially changed behavior
Add tests only where the design-system upgrade introduces meaningful logic or class/state coupling worth locking.
Do not create a huge brittle style snapshot suite.

Good candidates:
- reduced-motion-sensitive behavior
- branded loading/empty-state variant wiring
- focus/interactive-state structural hooks
- media fallback behavior

## Deliverables

Create or update, at minimum:
- polished interaction/motion/media implementation in homepage surfaces
- any supporting primitive/style helpers
- updated acceptance checklist if new Phase 02 criteria were added
- completion note for this prompt
- optional accessibility/polish reference doc if needed

Recommended docs:
- `docs/architecture/plans/MASTER/spfx/homepage/phase-02/Homepage-Accessibility-and-Polish-Notes.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-02/Phase-02-03-Completion-Note.md`

## Acceptance criteria

- homepage interaction language feels coherent and premium
- loading and empty states feel intentional, not scaffold-grade
- media treatment is stable and readable
- reduced-motion and focus-state quality are evident in code and output
- there is no visual polish that violates host awareness or accessibility doctrine
- Phase 02 can close with a clear handoff into Phase 03 composition work

## Verification

Run and report:
- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `pnpm --filter @hbc/spfx-hb-webparts build`

## Final response format

Return:
1. what changed for motion, media, focus, contrast, and state polish
2. exact files changed
3. docs created or updated
4. verification results
5. explicit Phase 02 closeout note and what remains deferred to Phase 03
