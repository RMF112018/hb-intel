# HB Kudos Public Surface — UI-Only Plan Summary

## Objective

Upgrade the public-facing HB Kudos webpart from a promising but over-stacked and underpowered rendered experience into a more cohesive, premium, presentation-lane recognition surface that aligns with the live `@hbc/ui-kit`, homepage/SPFx doctrine, and host-aware SharePoint best practices.

## Primary Product Intent

The target product is not simply a prettier card stack.

It is a **single authored recognition surface** that should:

- establish stronger visual authority on the homepage
- present featured recognition with clearer hierarchy and better value density
- provide a more elegant browse path into recent/archive recognition
- offer one warm, trustworthy, guided invitation to submit kudos
- deliver a composer experience that feels intentional and premium rather than operational and form-heavy

## Key Design Problems to Resolve

1. The current surface is too vertically stacked and too nested.
2. The top band is too small and too polite to function as a strong signature recognition surface.
3. Featured recognition consumes too much framing and not enough content value.
4. The archive zone is visually weak and compositionally awkward.
5. The composer is too long, too boxy, and too workflow-like.
6. Recipient selection feels unresolved and not yet premium.
7. Real-world zoom/responsive behavior is not strong enough.
8. Local bespoke styling still appears to be doing too much work outside stronger shared-surface discipline.

## Plan Structure

### Phase 1 — Surface composition reset
Rework the top-level public HB Kudos composition so the webpart reads as one coherent recognition feature rather than multiple mini-surfaces stacked together.

### Phase 2 — Featured recognition and archive refinement
Improve the balance between spotlighted recognition and subordinate browse/archive content.

### Phase 3 — Composer rebuild
Recast the public submission experience into a more guided, compact, premium recognition flow.

### Phase 4 — Recipient-selection UX improvement
Replace raw-feeling recipient entry behavior with a more trustworthy and polished selection experience aligned to the underlying typed-recipient model.

### Phase 5 — Responsive, accessibility, and interaction polish
Tighten zoom resilience, focus behavior, overflow, CTA placement, and overall polish.

### Phase 6 — ui-kit and shared-surface cleanup
Promote durable patterns into `@hbc/ui-kit/homepage` or the correct shared layer where appropriate, and reduce local drift/hardcoded premium styling.

### Phase 7 — Final integration and closure
Validate that the rendered public surface now meets the intended product quality bar and doctrine expectations.

## Rules for the Agent

- Do not start by re-reading files already in active context or memory.
- Use repo truth and only inspect additional files when needed.
- Keep the implementation path flexible.
- Be explicit about the target experience, but do not over-constrain the exact solution.
- Move or create ui-kit/shared primitives where justified by reuse and governance.
- Avoid cosmetic-only passes when structural change is warranted.

## Deliverables Expected Across the Series

- improved public HB Kudos composition
- improved featured recognition presentation
- improved archive/recent-recognition browse design
- improved composer experience
- improved recipient entry/selection UX
- better responsive/mobile-width behavior
- tighter accessibility and interaction quality
- tighter ui-kit/shared-surface discipline
- final closure report against the remediation matrix

