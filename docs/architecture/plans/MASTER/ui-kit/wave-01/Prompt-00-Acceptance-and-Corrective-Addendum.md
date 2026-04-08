# Prompt 00 Acceptance + Corrective Addendum

Use this note as the governing addendum to the completed Prompt 00 reconciliation report before executing Prompt 01 and all subsequent UI-system implementation prompts.

## Acceptance

The Prompt 00 completion report is accepted as **directionally correct**.

Its overall structure is sound and should be treated as the working basis for the next execution waves, especially its conclusions regarding:

- foundations being mostly healthy,
- primitives being present but not cleanly bounded,
- surface families being the main mismatch zone,
- module-specific UI being the largest ownership problem,
- the need for adapter-based migration instead of uncontrolled rewrites.

Continue using the Prompt 00 report as the active repo-truth reconciliation baseline unless later verified repo truth requires refinement.

## Corrective clarifications

Apply the following corrections and constraints going forward.

### 1. Be precise about presentation-lane leakage

Do **not** describe presentation surface leakage as a consequence of source directories merely existing under `src/`.

The relevant issue is whether presentation-lane components are:

- re-exported through the main barrel,
- exposed through the package exports map,
- or otherwise made available through entry points that bypass the intended presentation-lane boundary.

All future analysis and implementation notes should describe this issue in terms of **actual export and entry-point exposure**, not folder existence.

### 2. Structural correctness is necessary but not sufficient

Do **not** treat layer cleanup, package placement, barrel cleanup, or migration mechanics as the full definition of success.

This refactor effort exists because the current homepage and presentation surfaces are too close to functional internal application UI and do not consistently achieve premium, attention-grabbing, authored web-content quality.

For presentation-lane work, code cleanliness and correct ownership are required, but they are **not enough** on their own.

### 3. Presentation-lane work must carry visual obligations

For all presentation-lane prompts and implementation waves, preserve and strengthen the following expectations where relevant:

- large-scale composition,
- strong visual hierarchy,
- editorial rhythm,
- premium image treatment,
- stronger focal points,
- premium motion and reveal choreography where appropriate,
- clearly differentiated homepage/editorial surfaces that do **not** collapse back into productive-card UI.

Do not solve presentation-lane work with disguised productive-lane surfaces.

### 4. Visual proof is required

For presentation-lane work, verification must include visual proof, not just code-level validation.

At a minimum, require as applicable:

- before/after screenshots,
- Storybook stories or equivalent isolated examples for new or rebuilt surface families,
- side-by-side comparison against the pre-refactor state,
- explicit note of how the outcome improved the presentation lane rather than merely preserving functionality.

Do not mark presentation-lane work complete based solely on lint, typecheck, tests, or packaging success.

### 5. Treat the signature hero as the current quality floor

The existing `HbSignatureHero` should be treated as the **current presentation-lane quality floor**, not merely as one example among many.

That means subsequent presentation-lane work must avoid regressing toward generic card UI and should meet or exceed the level of:

- compositional intent,
- branded presence,
- layered background/readability treatment,
- asymmetry and focal control,
- and premium homepage suitability

already demonstrated by the current signature hero implementation.

## Execution rule for Prompt 01 and later

For Prompt 01 and all later prompts:

- use the accepted Prompt 00 report as the baseline,
- apply the corrective clarifications in this addendum,
- keep the layered model explicit: foundations → primitives → surface families → consumers,
- preserve adapter-based migration where appropriate,
- and treat presentation-lane quality as a first-class acceptance criterion rather than a secondary styling concern.

## Reporting expectation

When reporting completion for later prompts, explicitly distinguish:

- **structural / architectural progress**
- **visual / presentation-quality progress**
- **verification performed**
- **remaining risks or regressions**

For presentation-lane work, include a direct statement of whether the result materially advances the homepage/web-content lane beyond the current generic internal-app feel.
