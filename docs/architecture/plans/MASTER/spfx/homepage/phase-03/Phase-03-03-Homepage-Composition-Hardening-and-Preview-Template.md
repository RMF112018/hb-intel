# Phase 03-03 — Homepage Composition Hardening and Preview Template

## Objective

Close Phase 03 by turning the homepage composition work into a **governed preview/template-ready surface** with updated documentation, acceptance evidence, and package-level hardening.

At this point:
- Phase 01 stabilized the product lane,
- Phase 02 delivered the visual/token foundation,
- Phase 03-01 and Phase 03-02 should have established composition architecture and interaction/top-band quality.

This prompt must close the phase cleanly.

## First instruction

Do **not** re-read files that are already in your current context or memory. Re-read only if you need exact text for a targeted change.

## Governing handoff inputs

Use the outputs of:
- `Phase-03-01-Homepage-Zone-Architecture-and-Composition-Promotion.md`
- `Phase-03-02-Full-Width-Top-Band-and-Interactive-State-System.md`

And continue to honor:
- the Phase 02 completion notes,
- `Homepage-Design-Token-Map.md`,
- the Phase 01 product-boundary and contract docs,
- and the current homepage acceptance baseline.

## What this prompt must accomplish

### 1. Harden the homepage preview/template story
By the end of this prompt, the homepage lane should have a clear and documented preview/template posture.

That means:
- the composition preview is intentional,
- the package has a governed way to demonstrate the homepage as a composed experience,
- and the preview/template layer is documented in a way that future homepage work can rely on.

This does **not** mean building property panes or real data integration.
It does mean making the preview/composition surface trustworthy and maintainable.

### 2. Close the remaining Phase 03 polish items that are still package-local
Address the remaining composition-hardening items that fit this phase, such as:
- skeleton-vs-spinner decision for homepage loading surfaces,
- final branded loading/empty-state review,
- documentation reconciliation,
- any small acceptance-level issues exposed by Phase 03 work.

Choose only changes that belong to Phase 03 and can be verified cleanly.

### 3. Update the homepage documentation set
The homepage docs should reflect the actual post-Phase-03 package truth.

That may include:
- updating the README,
- updating or extending the homepage phase docs,
- adding a Phase 03 acceptance checklist or composition acceptance addendum,
- updating the token map if needed,
- and documenting the preview/template posture.

### 4. Close the phase with explicit verification evidence
This prompt should end with a clean verification package and phase closeout note.

## Scope

### In scope
- homepage preview/template posture
- local loading-state strategy review
- package docs reconciliation
- acceptance and verification updates
- version bump if warranted by the repo’s packaging/versioning pattern

### Out of scope
- property panes
- data integration
- shell-extension package work
- navigation governance
- broad `@hbc/ui-kit` promotion work

## Deliverables

1. Final Phase 03 code changes
2. Final documentation updates for the homepage composition/template posture
3. Acceptance checklist or acceptance addendum for Phase 03
4. Verification evidence from the package commands
5. Phase 03 completion note summarizing:
   - what changed across the phase,
   - what is now true of the homepage lane,
   - what is intentionally deferred to Phase 04+

## Acceptance criteria

- The homepage package has a clear, governed preview/template posture
- Composition documentation matches repo truth
- Loading/empty-state decisions are intentional and documented
- Tests, lint, typecheck, and build pass
- Phase 03 ends with a cleaner handoff into later-phase work
- The phase closes without drifting into property-pane or data-integration work

## Verification

Run and report:

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`
- `pnpm --filter @hbc/spfx-hb-webparts build`

## Output format

Produce:
- code changes,
- final documentation updates,
- acceptance evidence,
- and a concise phase completion note.
