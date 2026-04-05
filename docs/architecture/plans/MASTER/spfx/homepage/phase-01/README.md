# Phase 01 Prompt Package — HB Central Homepage Product Stabilization

## Objective

This package is the **Phase 01 repo-truth audit / implementation prompt package** for the HB Central homepage product in `apps/hb-webparts`.

Phase 00 is treated as complete and merged to `main`.

This package assumes the following are already locked:

- the three-lane SharePoint model (homepage / shell-extension / navigation)
- the supported SharePoint customization posture
- the `@hbc/ui-kit/homepage` entry-point policy for homepage work
- the SPFx Homepage Overlay doctrine and its binding vs directional classification

Phase 01 does **not** exist to redesign the homepage visually from scratch.

Phase 01 exists to convert `apps/hb-webparts` from a strong scaffold/proof-stage homepage lane into a **clearly bounded, documented, authoring-safe homepage product**.

---

## Repo-Truth Baseline This Package Assumes

The live repo already contains the following realities and they should be treated as true unless the local agent proves otherwise during implementation:

- `apps/hb-webparts` is a distinct homepage product lane with a dedicated README, Vite build, Vitest config, homepage shared layer, helpers, models, and ten homepage webpart folders.
- `src/mount.tsx` is the current mount/dispatch seam and routes by webpart ID, with a fallback to `ReferenceHomepageComposition`.
- `src/homepage/shared/` already contains shared homepage composition primitives.
- `src/homepage/helpers/` already contains identity, config, authoring-governance, and normalization seams.
- `@hbc/ui-kit/homepage` is the constrained homepage-safe UI surface.
- ESLint now blocks `@hbc/ui-kit` root imports and `@hbc/ui-kit/app-shell` imports in homepage webparts.
- The SPFx Homepage Overlay is now an authoritative doctrine layer and must be respected.

Phase 01 must build on that repo truth rather than re-litigating it.

---

## Execution Order

Run the prompts in this order:

1. `Phase-01-01-Homepage-Boundary-and-Inventory.md`
2. `Phase-01-02-Shared-Homepage-Seams-and-Contracts.md`
3. `Phase-01-03-Per-Webpart-Contract-Stabilization.md`
4. `Phase-01-04-Homepage-Acceptance-and-Authoring-State-Coverage.md`

Do not skip ahead.

Prompt 01 establishes the product boundary and inventory.
Prompt 02 stabilizes the shared seams.
Prompt 03 stabilizes each webpart contract.
Prompt 04 adds acceptance coverage and closes the phase.

---

## Files in This Package

- `Phase-01-Implementation-Summary.md`
- `Phase-01-01-Homepage-Boundary-and-Inventory.md`
- `Phase-01-02-Shared-Homepage-Seams-and-Contracts.md`
- `Phase-01-03-Per-Webpart-Contract-Stabilization.md`
- `Phase-01-04-Homepage-Acceptance-and-Authoring-State-Coverage.md`
- `Phase-01-Risk-Exposure.md`
- `Phase-01-Standards-and-Best-Practices.md`

---

## Required Operating Posture for the Local Code Agent

- Use **live repo truth on `main`** as the source of truth.
- Do **not** re-read files that are already in your current context or memory unless they changed, you need exact verification, or the task widened.
- Do **not** weaken or bypass the Phase 00 import/doctrine guardrails.
- Do **not** move homepage work into shell-extension territory.
- Do **not** treat visual polish as the primary goal of Phase 01.
- Do **not** rewrite working code just to make it look more “finished.” Stabilize the product lane first.
- Prefer surgical changes, contract clarity, acceptance coverage, and documentation over broad churn.

---

## Expected Outcome of Phase 01

At the end of Phase 01:

- `apps/hb-webparts` should be clearly documented as the homepage product lane
- every homepage webpart should have an explicit purpose, config contract, and fallback behavior
- shared homepage seams should be rationalized and documented
- authoring-safe states should be explicit and test-backed
- the package should be ready for a true premium design-system uplift in Phase 02 without architectural ambiguity
