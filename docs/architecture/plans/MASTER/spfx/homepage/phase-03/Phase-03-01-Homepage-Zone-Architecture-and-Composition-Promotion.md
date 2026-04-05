# Phase 03-01 — Homepage Zone Architecture and Composition Promotion

## Objective

Use the executed Phase 02 implementation and its completion notes to define and implement the **homepage composition architecture** for `apps/hb-webparts`.

You are not starting from scratch. Phase 01 already stabilized the homepage as a product lane, and Phase 02 already delivered a homepage-local token system plus premium component-level visual upgrades. Your job in this prompt is to promote the homepage from “well-styled independent webparts” to a **governed composed homepage system**.

## First instruction

Do **not** re-read files that are already in your current context or memory. Re-read only when you need exact text for a surgical edit or when the current context is insufficient.

## Required repo-truth inputs

Use these as the governing handoff set for this prompt:

- `Phase-02-01-Completion-Note.md`
- `Phase-02-02-Completion-Note.md`
- `Phase-02-03-Completion-Note.md`
- `Homepage-Design-Token-Map.md`

Use these as still-governing Phase 01 architecture references when needed:

- `Homepage-Product-Boundary.md`
- `Homepage-Shared-Seam-Taxonomy.md`
- `Homepage-Per-Webpart-Contract-Reference.md`
- `Homepage-Acceptance-Checklist.md`

## What this prompt must accomplish

### 1. Define the homepage composition architecture explicitly
Create or update canonical phase documentation that defines:

- the homepage zone model,
- which parts of the composition layer are structural versus demonstrative,
- which composition shells are authoritative,
- how section rhythm, zone wrapping, and zone differentiation should work,
- and the role of `ReferenceHomepageComposition.tsx` going forward.

This prompt must answer the question:
**What is the governed homepage composition system for the page-canvas product lane?**

### 2. Promote `ReferenceHomepageComposition` from loose preview utility to governed composition asset
Do not treat it as throwaway. Make its role explicit and useful.

The outcome should make one of these postures true and documented:
- it becomes the governed preview/composition reference surface for the package, or
- it is split into a clearer production-safe composition shell plus a development-only preview layer.

Choose the option that best fits repo truth and keeps the architecture clean.

### 3. Stabilize zone-level layout ownership
Use the existing token system and shared primitives to make the zone architecture explicit:

- top band,
- utility zone,
- communications/editorial zone,
- operational awareness zone,
- discovery zone.

Clarify which shared wrappers own spacing, tinting, section padding, and layout rhythm.

### 4. Reconcile scaffold-era reference behavior
If any scaffold-era composition or config behavior is still lingering in the reference composition path, either:
- formally retain it with correct documentation and naming, or
- isolate/replace it with clearer composition logic.

Do not leave ambiguous “scaffold but still used” behavior in the critical composition path.

## Scope

### In scope
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- `apps/hb-webparts/src/homepage/shared/*`
- `apps/hb-webparts/src/homepage/helpers/*` where composition behavior is impacted
- phase documentation for homepage composition architecture
- preview/composition-specific acceptance documentation if needed

### Out of scope
- shell-extension behavior
- navigation governance
- property panes
- async data integration
- cross-package promotion into `@hbc/ui-kit` unless clearly required and justified by real reuse

## Deliverables

1. A canonical phase document describing homepage zone architecture and composition ownership
2. Any necessary code changes to make the composition layer reflect that architecture
3. Updated README / docs references if the composition role changes
4. Clear reconciliation note for the role of `ReferenceHomepageComposition`
5. Completion note documenting:
   - what changed,
   - what role the reference composition now plays,
   - what remains for Prompt 02

## Acceptance criteria

- Homepage composition ownership is explicit and documented
- `ReferenceHomepageComposition` has a clean and justified role
- Zone wrappers and section rhythm are no longer ambiguous
- The composition layer reads as intentional homepage architecture, not leftover preview glue
- Existing tests continue to pass
- Import discipline remains intact
- No shell-lane concerns are introduced

## Verification

Run and report:

- `pnpm --filter @hbc/spfx-hb-webparts check-types`
- `pnpm --filter @hbc/spfx-hb-webparts lint`
- `pnpm --filter @hbc/spfx-hb-webparts test`

Run a build if your changes affect composition or packaging behavior:
- `pnpm --filter @hbc/spfx-hb-webparts build`

## Output format

Produce:
- code changes,
- updated documentation,
- a concise completion note,
- and a short “remaining for Prompt 02” list.
