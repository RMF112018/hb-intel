# Prompt 01 — Shared Surface System Reset

## Objective

Perform a repo-truth-driven rebuild of the shared homepage visual system so the HB Central homepage no longer depends on one generic white-card pattern. This phase must establish the premium surface, typography, spacing, CTA, iconography, and interaction foundations that all later phases will use.

## Scope

Primary targets:

- `packages/ui-kit`
- `packages/ui-kit/src/homepage.ts`
- all homepage primitive exports and related types
- homepage-supporting theme/token files that materially affect the rendered result
- `apps/hb-webparts/src/homepage/shared/*`
- `apps/hb-webparts/src/homepage/tokens.ts`
- any homepage-interaction CSS or supporting style files

## Current-State Problem to Solve

The current system has discipline but not enough authorship. Too many surfaces resolve into slight variations of the same white rounded card with subtle border/shadow. That is the main visual problem and it must be broken here.

## Hard Gates

- Do **not** reread files already in your active context or memory.
- Do **not** treat the current surface system as worth preserving.
- Do **not** keep the current surface differentiation model if it still produces interchangeable cards.
- Do **not** leave launcher, utility, editorial, operational, discovery, hero, and welcome surfaces feeling like siblings with small cosmetic differences.

## Required Research

Before editing, perform concise but real subject-matter research on:

- premium intranet homepage surface systems
- editorial homepage composition patterns
- premium enterprise launcher and command surfaces
- high-end dashboard card differentiation strategies
- SharePoint-hosted custom webpart styling patterns that remain realistic

Do not limit yourself to Microsoft-only examples.

## Required Outcomes

Create or refactor shared primitives so the system supports at minimum:

- a true **flagship** surface class
- a true **command/utility** surface class
- a true **editorial** surface class
- a true **recognition/human** surface class
- a true **operational intelligence** surface class
- a true **discovery** surface class

Also upgrade:

- typography authority
- spacing rhythm
- CTA hierarchy
- badge posture
- iconography standards
- hover/focus state quality
- reduced-motion-safe transitions

## Implementation Requirements

1. Audit the current homepage primitive exports and identify which ones are too weak.
2. Add or refactor shared primitives in `@hbc/ui-kit` where the premium surface model belongs.
3. Remove dependency on initials-as-icons wherever premium utility experiences are expected later.
4. Strengthen section-shell and surface-card logic so the rendered output has materially different postures by surface type.
5. Improve the design token system where current values are too conservative to support premium outcomes.
6. Keep import discipline intact or update it intentionally and document the change.

## Deliverables

- implemented shared primitive upgrades
- updated types/exports
- any necessary homepage shared-layer refactors
- concise note explaining which weak patterns were removed or replaced

## Validation

Show proof that:

- surface classes are now materially differentiated
- the system supports later premium redesign work instead of suppressing it
- no import-policy regressions were introduced
- no accessibility regressions were introduced

## Output Format

Return:

1. summary of what changed
2. files changed
3. why the previous shared surface model was insufficient
4. rendered-result expectation for later phases

## Final Instruction

Do not soften this work.

The current homepage is not acceptable. The goal of this phase is to produce measurable visual improvement that can be seen immediately in the rendered experience, not merely explained in code review.
