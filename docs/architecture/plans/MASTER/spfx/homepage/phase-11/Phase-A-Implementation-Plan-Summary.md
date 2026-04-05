# Phase A Implementation Plan Summary — Homepage Shared-System Uplift

## Objective

Implement the **shared-system corrections and upgrades** required to support a premium HB Central homepage inside the current SharePoint/SPFx constraints.

This phase exists to solve the structural UI problem identified in the audit:

> the homepage implementation is disciplined and reusable, but the shared surface language is too generic, too cautious, and too weakly differentiated to deliver the intended premium, branded, company-intranet-quality result.

Phase A must strengthen the homepage's shared visual infrastructure **before** any heavier top-band redesign or broader webpart-specific premiumization work.

---

## Why Phase A Must Happen First

The current homepage surfaces are too dependent on:

- one generic card posture
- lightly styled local section shells
- repeated featured/secondary cluster patterns
- plain text-link action language
- placeholder-grade icon handling in launcher/discovery surfaces
- conservative type hierarchy and metadata treatment

If those foundations are not upgraded first, later visual redesign work will become duplicated, inconsistent, and harder to govern.

---

## Phase A Scope

### Core target
Upgrade the homepage shared system so that multiple homepage surfaces can consume a more premium, more deliberate, but still doctrine-compliant language.

### Intended outputs
- stronger homepage entry-point in `@hbc/ui-kit/homepage`
- stronger shared primitives for:
  - homepage surface/card variants
  - CTA/action treatment
  - metadata rows
  - icon containers / mapped icons
  - section shells / section intros
  - utility rows / destination tiles where truly shared
- stronger local shared shells in `apps/hb-webparts`
- webpart refactors to consume the new shared language
- validation, docs, and story coverage

---

## Recommended Primitive Ownership Split

### Promote to `@hbc/ui-kit/homepage`
Promote only primitives that are truly reusable across multiple homepage surfaces and clearly belong in the homepage entry-point, such as:

- homepage surface/card variants
- metadata row / signal row primitives
- homepage CTA primitives
- homepage icon wrapper / mapped icon primitives
- section shell / section intro primitives if broadly reused
- utility/destination/action row primitives if multiple webparts consume them

### Keep local in `apps/hb-webparts/src/homepage/shared/`
Keep local any composition that is still homepage-package-specific or too content-family-specific, such as:

- highly authored editorial clusters unique to one zone
- one-off webpart content choreography
- package-specific zone compositions
- anything that is not yet a stable shared primitive

---

## Process Overview

1. establish the Phase A shared-surface architecture against repo truth
2. implement the new shared homepage primitives in `@hbc/ui-kit`
3. upgrade the local homepage shared shells/clusters to consume the stronger shared system
4. refactor homepage webparts to adopt the new primitives without overreaching into Phase B/C redesign work
5. validate build, lint, stories, tests, docs, and packaging-sensitive seams

---

## Risk Exposure

### 1. Over-promotion risk
There is a real risk of moving too much homepage-specific composition into `@hbc/ui-kit`. This phase must promote **reusable homepage primitives**, not one-off editorial arrangements.

### 2. Entry-point drift risk
The repo already enforces homepage import discipline. New shared primitives must be exported through `@hbc/ui-kit/homepage` cleanly, without causing homepage consumers to fall back to the root package.

### 3. Packaging / bundle regression risk
`apps/hb-webparts` is an SPFx cumulative multi-webpart package. Shared-system work must not unintentionally change loader behavior, mount contracts, or packaging assumptions.

### 4. Visual inconsistency risk
If the shared primitives are introduced but the local shells and consuming webparts are only partially migrated, the homepage may become visually mixed. Migration should be deliberate and complete enough to avoid obvious style clashes.

### 5. Doctrine conflict risk
The UI doctrine overlay allows stronger homepage expression, but still binds accessibility, host-awareness, token discipline, and authoring-safe behavior. Phase A must intensify visual quality without violating those rules.

---

## Standards / Best Practices

- keep repo truth authoritative
- prefer narrow, homepage-safe shared abstractions over broad generic abstractions
- preserve visible focus and reduced-motion behavior
- maintain token discipline; do not solve design weakness with scattered one-off inline styling
- create shared primitives where multiple homepage surfaces need the same affordance
- keep high-authoring-content choreography local unless reuse is proven
- back every new shared core primitive with stories and documentation updates
- validate both implementation correctness and packaging-sensitive safety

---

## Suggested Acceptance Criteria

Phase A should not be considered complete until all of the following are true:

1. `@hbc/ui-kit/homepage` exposes a materially stronger shared primitive surface than the current limited set.
2. The homepage no longer relies almost entirely on a single generic `HbcCard` + plain headings + text-link treatment.
3. Local shared shells/clusters in `apps/hb-webparts` have been upgraded from nearly semantic wrappers to meaningfully styled composition infrastructure.
4. Launcher/discovery/action patterns no longer rely on placeholder token-icons or plain list-like affordances where stronger shared primitives are warranted.
5. Homepage webparts consume the stronger shared system without violating lane boundaries or import discipline.
6. Story coverage, docs, lint, tests, and build/package-sensitive validation all pass.
7. Completion notes clearly separate:
   - what was promoted to shared
   - what stayed local
   - what remains for later phases

---

## Deliverables

- updated code
- updated docs
- updated stories/tests
- Phase A completion note
- concise list of remaining Phase B/C follow-ons

