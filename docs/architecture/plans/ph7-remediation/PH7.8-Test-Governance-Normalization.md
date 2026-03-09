# PH7.8 — Test Governance Normalization

**Version:** 1.0  
**Purpose:** Bring all P1 platform packages under consistent root test governance and release-gate participation.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Expand root Vitest governance beyond the current partial set so all strategic shared-feature primitives and stabilization-critical packages participate in the common verification model with clear environments, coverage expectations, and CI integration.

---

## Prerequisites

- PH7.1 complete.
- Review `vitest.workspace.ts`, root scripts, package scripts for all P1 packages, and CI workflows that depend on test execution.

---

## Source Inputs

- `vitest.workspace.ts`
- root `package.json`
- `turbo.json`
- P1 package `package.json` files
- CI workflows in `.github/workflows/*`

---

## 7.8.1 — Define the P1 Test Governance Set

- Publish the list of mandatory P1 packages in root governance: auth, shell, sharepoint-docs, bic-next-move, and complexity.
- Create a package testing matrix with package, environment, coverage target, command path, root participation, and CI gate participation.

## 7.8.2 — Expand `vitest.workspace.ts`

- Add `@hbc/bic-next-move` and `@hbc/complexity` with deliberate environment and coverage choices that match the package behavior and existing workspace style.

## 7.8.3 — Normalize Package Test Scripts

- Ensure all P1 packages expose `test`, `test:watch`, `test:coverage`, `check-types`, and `lint` consistently enough to participate in root governance.

## 7.8.4 — Define Coverage Expectations

- Set explicit minimum coverage targets by package; the targets do not need to be identical, but they must be intentional and documented.

## 7.8.5 — Align CI and Release Gates

- Update CI/release docs and workflows so root governance is meaningful and no strategic package remains effectively local-only tested.

## 7.8.6 — Publish the Package Testing Matrix

- Create a reusable reference doc future maintainers can extend for additional strategic packages.

---

## Deliverables

- updated `vitest.workspace.ts`
- normalized package scripts where needed
- package testing matrix reference
- CI/release-gate updates as needed

---

## Acceptance Criteria Checklist

- [ ] All P1 packages are included in root test governance.
- [ ] `vitest.workspace.ts` reflects intentional environment selection.
- [ ] P1 package scripts are normalized.
- [ ] Coverage expectations are documented.
- [ ] CI/release gates reflect the normalized package set.

---

## Verification Evidence

- `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs --filter=@hbc/bic-next-move --filter=@hbc/complexity`
- root test command verification
- build/lint/check-types if scripts/config change

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.8 started: YYYY-MM-DD
PH7.8 completed: YYYY-MM-DD

Artifacts:
- updated `vitest.workspace.ts`
- normalized package scripts where needed
- package testing matrix reference
- CI/release-gate updates as needed

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
