# Phase 01-04 — Homepage Acceptance and Authoring-State Coverage

## Objective

Close Phase 01 by adding the **acceptance coverage, test protection, and evidence package** required to prove that `apps/hb-webparts` is now a stabilized homepage product lane.

This prompt is the phase-close and evidence prompt.

---

## Required Inputs

Use live repo truth from `main`, especially:

- all Prompt 01–03 outputs
- `apps/hb-webparts/vitest.config.ts`
- `apps/hb-webparts/src/test-setup.ts` if present
- existing tests under `apps/hb-webparts/src/**`
- `apps/hb-webparts/README.md`
- Phase 00 doctrine documents

Do **not** re-read files already in your current context or memory unless they changed, you need exact verification, or the task widened.

---

## What You Must Prove

You must prove that the homepage product lane is now safe enough to move into Phase 02.

That means proving, at minimum:

- import discipline still holds
- webparts render independently
- authoring-safe default states exist
- loading states exist where required
- empty / invalid / no-result states exist where required
- the mount/dispatch seam is not silently broken
- reference composition behavior is understood and protected
- local docs match repo truth

---

## Required Actions

1. Audit current test coverage and identify Phase 01-critical gaps.
2. Add targeted tests for the most important product-lane guarantees.
3. Add or update an acceptance checklist for homepage product stabilization.
4. Add a Phase 01 completion note with:
   - what changed
   - what was verified
   - what remains intentionally deferred to Phase 02
5. Update any local docs that still underspecify authoring-safe or fallback-safe expectations.

---

## Minimum Test / Acceptance Targets

Cover as many of the following as repo truth supports:

- greeting/identity fallback logic
- config normalization behavior
- no-data / invalid-data authoring messages
- loading-state rendering for awareness/discovery surfaces where applicable
- independent rendering of selected webparts
- mount/dispatch route selection or fallback behavior
- reference composition rendering sanity
- no prohibited import regressions in homepage source

---

## Guardrails

- Do not inflate the phase with cosmetic test churn.
- Do not try to finish Phase 02 inside Phase 01.
- Prefer targeted, load-bearing tests over broad shallow coverage.
- Do not claim verification you did not actually run.
- If validation fails, document exact failures and leave honest evidence.

---

## Deliverables

At minimum:

- targeted new or updated tests
- a homepage acceptance checklist
- a Phase 01 completion note
- any doc updates needed to reflect actual verified behavior

---

## Acceptance Criteria

This prompt is complete when:

- Phase 01 has a credible evidence package
- the homepage package has explicit acceptance criteria
- the most important product-lane behaviors are test-backed
- the repo is ready for a clean Phase 02 premium-design-foundation package
