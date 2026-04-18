# Phase-07 Priority Actions Rail Flagship Redesign — Closure Scorecard

Honest closure posture for the phase-07 PROMPT-01 … PROMPT-10 remediation
of the wrapper-owned homepage Priority Actions Rail. This document does
not claim hosted SharePoint validation. Residual items are listed
explicitly.

## Summary

Phase-07 takes the flagship rail from a CSS-only flagship branch to a
structurally differentiated, recognition-first, container-driven command
band with an explicit default-vs-flagship isolation contract and
anti-collapse regression coverage.

Manifest progression across the phase:

| Artifact                                       | Start      | End        |
| ---------------------------------------------- | ---------- | ---------- |
| HB Homepage (`HbHomepageWebPart`)              | 1.1.17.0   | 1.1.24.0   |
| hb-webparts solution (`package-solution.json`) | 1.0.0.320  | 1.0.0.327  |
| hb-webparts feature                            | 1.0.0.319  | 1.0.0.326  |

## What shipped (by prompt)

1. **PROMPT-01** — Structural featured-slot contract. `PriorityRailActionModel`
   and `PriorityRailSectionModel` gained a typed `featured?` tier.
   `HbcPriorityRailSurface` structurally branches on `context ===
   'homepage-flagship'` to render a featured masthead slot ahead of
   supporting rows. Wrapper config gained `featuredActionKeys`, threaded
   through `HbHomepageEntryStack → PriorityActionsRail →
   buildPriorityRailSections`. Featured partitioning: wrapper keys first,
   then explicit `featured: true`, then first critical/warning badge.

2. **PROMPT-02** — Entry-stack composition invariants locked: DOM order,
   order-attribute promotion when rail disabled, exactly two
   root children, `rail-enabled` state attribute, and
   `featuredActionKeys` threading.

3. **PROMPT-03** — Section hierarchy and primary-action treatment.
   Featured slot rendered as a distinct brand-gradient silhouette;
   sections hosting a featured action visually de-emphasize supporting
   rows (shorter height, softer icon chip, lighter title, dimmer
   description) so the featured → supporting tier is obvious without
   relying on color.

4. **PROMPT-04** — Action recognition cues + launch affordance. Each
   action now renders through a dedicated `.itemLaunch` chip wrapper.
   Flagship turns the chip into a persistent 28 px brand-tinted circular
   activation anchor; featured makes it a 34 px brand-gradient primary
   target. External links are tagged structurally and carry a link-owned
   visually-hidden "(opens in new tab)" affordance rather than an icon
   aria-label.

5. **PROMPT-05** — Secondary command layer identity. Overflow trigger
   gains leading glyph + label + count chip across all three strategies.
   Flagship trigger becomes right-anchored with uppercase brand-accent
   label, echoing the featured launch chip. `aria-expanded` /
   `aria-controls` / `aria-haspopup` semantics preserved per strategy
   (disclosure = region, menu = menu-button, sheet = dialog with modal
   focus trap).

6. **PROMPT-06** — Container-driven flagship degradation. Rail root
   declares `container-type: inline-size` + `container-name:
   hbc-priority-rail`. Three new container-query bands lock the
   narrowest-stable (≤ 520 px), ultra-narrow (≤ 360 px), and
   wide-anchored (≥ 1180 px) flagship states. Launch chip remains
   visible at every band.

7. **PROMPT-07** — Accessibility closure. Action hover motion is gated
   on `useReducedMotion()` (the existing CSS `prefers-reduced-motion`
   media guard handles CSS transitions; the JS gate covers
   framer-driven inline style). Target size, focus visibility, semantic
   role alignment, and the external-link SR cue are locked by structural
   tests.

8. **PROMPT-08** — Default-vs-flagship isolation contract. JSDoc on
   `PriorityRailContext` documents the isolation contract explicitly.
   Regression tests assert: default surface tags
   `data-hbc-priority-rail-context="default"` and omits the flagship
   CSS class; admin preview defaults to `default` context unless
   consumer opts in; flagship context surface carries both the attribute
   and the CSS class.

9. **PROMPT-09** — Flagship anti-collapse regression tests. Eight
   structural locks guard the phase-07 decisions from a silent refactor
   back to the old row/list grammar: inline-size container, three
   container-query bands, featured silhouette gradient, persistent
   launch chip, brand-gradient featured launch chip, right-anchored
   flagship overflow trigger.

10. **PROMPT-10** — Closure scorecard (this document).

## Verification actually run

Commands executed and their result:

- `pnpm --filter @hbc/ui-kit build` — clean (tsc --project tsconfig.json).
- `@hbc/ui-kit` unit tests (scoped to `src/HbcPriorityRail`): **29/29
  passing** across `HbcPriorityRail.test.tsx` (11) and
  `HbcPriorityRailAccessibility.test.ts` (18).
- `@hbc/spfx-hb-webparts` check-types: clean.
- `@hbc/spfx-hb-webparts` scoped tests: **25/25 passing** across
  `priorityActionsPresentation.test.ts` (9),
  `priorityActionsRailRuntime.test.tsx` (4), and
  `hbHomepageEntryStack.test.tsx` (12).

## Residual (honest)

The following items are **not** complete in phase-07 and are called out
instead of hidden:

- **Hosted SharePoint validation** — this closure does not include
  rendering the rebuilt flagship rail in a real SharePoint tenant
  across desktop / laptop / tablet / phone / short-height classes.
  Local structural and unit evidence is comprehensive but is not a
  substitute for hosted proof. Closing that gap requires deploying the
  generated `.sppkg` into a tenant and walking the required display
  matrix.

- **`.sppkg` generation** — phase-07 work did not drive
  `gulp bundle --ship` / `gulp package-solution --ship` through
  `tools/spfx-shell`; only the manifest versions were bumped. Packaging
  is expected at deploy time per the existing release workflow.

- **Accessibility hosted proof** — WAI APG / WCAG 2.2 target-size,
  focus-visibility, and reduced-motion behavior are locked by
  structural tests. Hosted-tenant screen-reader / keyboard walkthroughs
  remain open.

Nothing in-scope is deferred under a vague future-work note. Residual
items above are all hosted / deployment-proof items that cannot be
produced inside the local development loop that generated this
redesign.

## Architecture invariants preserved across the phase

- Wrapper-owned pre-shell placement (rail is not a shell occupant).
- Explicit `homepage-flagship` context threading from wrapper to shared
  surface — no implicit flagship inference anywhere else.
- Default context behavior unchanged for admin preview and non-homepage
  mounts (featured slot suppressed; launch chip invisible; container
  queries dormant unless the consumer activates the flagship class).
- No new external dependencies introduced.
- Semantic `<a>` for links; `<button type="button">` for triggers; no
  ARIA to simulate patterns semantic HTML already owns.
- `ModuleConfigSlices` / shell occupant / band / slot semantics
  untouched.
