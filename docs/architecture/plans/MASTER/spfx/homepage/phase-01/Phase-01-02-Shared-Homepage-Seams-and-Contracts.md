# Phase 01-02 — Shared Homepage Seams and Contracts

## Objective

Stabilize the **shared homepage layer** inside `apps/hb-webparts` so that helpers, shared primitives, models, and contract files have explicit responsibilities, consistent ownership, and predictable usage rules.

This prompt is about **internal product-lane coherence**.

---

## Required Inputs

Use live repo truth from `main`, especially:

- `apps/hb-webparts/src/homepage/shared/**`
- `apps/hb-webparts/src/homepage/helpers/**`
- `apps/hb-webparts/src/homepage/models/**`
- `apps/hb-webparts/src/homepage/webparts/**`
- `apps/hb-webparts/src/mount.tsx`
- the Prompt 01 outputs
- `docs/reference/ui-kit/entry-points.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Do **not** re-read files already in your current context or memory unless they changed, you need exact verification, or the task widened.

---

## What You Must Determine

### 1. Shared seam taxonomy

You must determine which current files belong to which category:

- shared composition primitives
- package-wide helpers
- zone-specific normalization helpers
- per-webpart-only helpers that should not live in shared/package-wide locations
- common models/content shapes
- explicit webpart contract files

### 2. Contract fragmentation or overlap

Determine whether current contracts are:

- too generic
- duplicated across zones
- under-documented
- mixed together with implementation concerns
- missing normalization/fallback expectations

### 3. Real stability gaps

Identify load-bearing gaps such as:

- generic helper seams that are too shallow for the actual product
- authoring-governance registry that exists but is not yet clearly integrated into package standards
- local shared primitives that are meaningful but not explicitly classified
- fallback/normalization behavior that is real in code but not consistently encoded as contract doctrine

---

## Required Actions

1. Audit the shared homepage layer and classify each shared/homepage area by responsibility.
2. Create or update a document that defines the shared homepage seam taxonomy.
3. Rationalize file placement only where repo-truth evidence supports it.
4. Normalize contract conventions across homepage helpers and contract files.
5. Establish explicit rules for:
   - what belongs in `src/homepage/shared/`
   - what belongs in `src/homepage/helpers/`
   - what belongs in `src/homepage/models/`
   - what belongs in `src/homepage/webparts/`
   - what must stay local to a webpart folder
6. Strengthen type/contract clarity where current files are too implicit.
7. Update or add tests only where necessary to protect the seam rationalization.

---

## Guardrails

- Do not prematurely promote homepage-local primitives into `@hbc/ui-kit`.
- Do not move shell or navigation concerns into the homepage shared layer.
- Do not over-abstract the shared seams into a framework.
- Do not collapse all contracts into one giant file if that reduces clarity.
- Prefer clear ownership and explicit rules over clever file churn.

---

## Deliverables

At minimum:

- a shared homepage seam taxonomy document
- any necessary contract/helper file refactors
- updates to local docs explaining shared-layer ownership
- a completion note summarizing the stabilized seam model and any intentionally deferred issues

---

## Acceptance Criteria

This prompt is complete when:

- shared vs local homepage code ownership is explicit
- helper responsibilities are clear and not overly blurred
- contract files are easier to reason about
- normalization/fallback responsibilities are clearer than before
- Prompt 03 can stabilize each webpart without guessing which shared seams are authoritative
