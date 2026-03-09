# PH7.5 — Complexity Retrofit Completion

**Version:** 1.0  
**Purpose:** Finish the platform-wide normalization of `@hbc/complexity` so it governs information-density behavior consistently across the PWA, SPFx, UI kit, and future feature packages.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Close the gap between the `@hbc/complexity` package plan and real platform adoption by completing the retrofit audit, sensitivity matrix, package integration, and documented completion criteria.

---

## Prerequisites

- PH7.1 and PH7.4 complete.
- Review the complexity shared-feature plan, provider implementation, exports, test setup, and any interim complexity access paths outside the package.

---

## Source Inputs

- `packages/complexity/*`
- `packages/ui-kit/*`
- app roots in `apps/pwa` and SPFx entry seams
- `docs/reference/ui-kit/*`
- `SF03-Complexity-Dial.md`

---

## 7.5.1 — Confirm the Canonical Complexity Package Boundary

- Document exactly what `@hbc/complexity` owns and inventory all complexity-related hooks/components outside the package as canonical, transitional, stub, remove, or redirect.

## 7.5.2 — Complete the Sensitivity Matrix

- Create or finish `docs/reference/ui-kit/complexity-sensitivity.md` with per-surface tier behavior, override rules, coaching behavior, and SPFx/PWA notes.

## 7.5.3 — Perform the Retrofit Audit

- Audit candidate UI-kit and shell components for complexity participation and classify each as compliant, needs prop retrofit, needs provider integration, needs docs only, or not applicable.

## 7.5.4 — Normalize App Root Integration

- Document provider placement, storage mode, sync behavior, lock behavior, and coaching toggle availability for each runtime root.

## 7.5.5 — Remove Transitional Complexity Drift

- Eliminate or explicitly document temporary complexity paths outside the package, including duplicated types/enums or app-local fallback gating.

## 7.5.6 — Expand Test Coverage and Root Governance Alignment

- Ensure package-local tests cover provider behavior, storage, lock expiry, cross-tab sync, and coaching toggles, and prepare the package for PH7.8 root governance inclusion.

## 7.5.7 — Close the Shared-Feature Plan Loop

- Update `SF03-Complexity-Dial.md` to reflect actual retrofit, testing, and deployment/verification completion state.

---

## Deliverables

- `docs/reference/ui-kit/complexity-sensitivity.md`
- updated package docs
- app-root integration matrix
- retrofit audit results
- shared-feature plan closure notes

---

## Acceptance Criteria Checklist

- [ ] `@hbc/complexity` is clearly the canonical source for complexity behavior.
- [ ] Sensitivity matrix is published and complete for relevant surfaces.
- [ ] App-root integration is documented and intentional.
- [ ] Transitional/stub complexity paths are removed or explicitly documented.
- [ ] Complexity-sensitive UI surfaces are audited and classified.
- [ ] `SF03-Complexity-Dial.md` reflects true completion state.

---

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/complexity`
- `pnpm turbo run lint --filter=@hbc/complexity`
- `pnpm turbo run check-types --filter=@hbc/complexity`
- `pnpm turbo run test --filter=@hbc/complexity`

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.5 started: YYYY-MM-DD
PH7.5 completed: YYYY-MM-DD

Artifacts:
- `docs/reference/ui-kit/complexity-sensitivity.md`
- updated package docs
- app-root integration matrix
- retrofit audit results
- shared-feature plan closure notes

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL

Notes:
- unresolved items:
- deferred items with rationale:
-->
```
