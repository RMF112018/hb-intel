# Phase 01 Standards and Best Practices

## 1. Use live repo truth on `main`

Do not work from memory when the live repo can answer the question.

---

## 2. Do not re-read files unnecessarily

Do not re-read files already in your current context or memory unless they changed, you need exact verification, or the task widened.

This is a hard efficiency rule for this package.

---

## 3. Respect the homepage-safe import contract

Homepage webparts must continue to use:

- `@hbc/ui-kit/homepage` as the primary UI entry point
- `@hbc/ui-kit/theme` when token-only imports are needed
- `@hbc/ui-kit/icons` when icon-only imports are needed

Do not widen that contract casually.

---

## 4. Keep the phase product-focused

Phase 01 is successful when the homepage lane becomes easier to reason about, easier to maintain, and safer to refine.

It is not successful because it became more visually ambitious during this phase.

---

## 5. Prefer documentation and contracts over broad churn

When choosing between:

- massive refactor with ambiguous gain
- explicit docs, contract tightening, and surgical cleanup

prefer the second.

---

## 6. Preserve independent webpart rendering

The homepage package is multi-webpart.

Do not make individual webparts depend on the whole homepage composition being present.

---

## 7. Protect authoring safety

Every homepage surface should behave credibly when:

- minimally configured
- partially configured
- invalidly configured
- missing data
- stale
- loaded in edit mode

---

## 8. Treat shared homepage code as product infrastructure

`src/homepage/shared/`, `helpers/`, `models/`, and contract files are not incidental convenience folders.

They are the internal product infrastructure of the homepage lane and should be documented and protected accordingly.

---

## 9. Do not claim verification you did not perform

If you ran build/lint/test, say so precisely.
If you did not, say so precisely.

---

## 10. Leave a clean handoff to Phase 02

The end of Phase 01 should make it easy to start Phase 02 without arguing about:

- package ownership
- import discipline
- shared seam ownership
- webpart contract expectations
- authoring-safe behavior
