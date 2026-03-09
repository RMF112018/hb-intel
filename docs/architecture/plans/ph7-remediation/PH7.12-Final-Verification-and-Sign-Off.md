# PH7.12 — Final Verification & Sign-Off

> **Doc Classification:** Canonical Normative Plan — the Phase 7 gate plan; all P1 stabilization work must satisfy this plan's acceptance criteria before platform expansion resumes.

**Version:** 1.1 (amended after PH7.12R validation — 2026-03-09)
**Purpose:** Verify closure of all Phase 7 P1 issues and produce the evidence package required to resume broad platform expansion safely.
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.
**Implementation Objective:** Mechanically confirm that all P1 stabilization issues are closed, downgraded by ADR, or explicitly deferred with rationale, and capture final sign-off evidence in a single consolidated evidence package document.

---

## Prerequisites

- **[Amendment B — Hard prerequisite dependency chain]** The following two phases are hard dependencies for PH7.12 and must be fully complete before any PH7.12 work begins:
  1. **PH7.9 must be complete** — `docs/reference/release-readiness-taxonomy.md` and `docs/architecture/release/release-signoff-template.md` must exist at their canonical paths. PH7.12 §7.12.5 depends directly on the taxonomy definitions; if PH7.9 is not implemented, PH7.12 cannot produce a valid readiness classification.
  2. **PH7.11 must be complete** — ADR catalog reconciliation, the full reference doc set, and developer governance rules must be in place. PH7.12 §7.12.3 verifies discoverability of ADRs and reference docs; if PH7.11 is not complete, that checkpoint cannot pass.
- PH7.1 through PH7.8 and PH7.10 completed or explicitly dispositioned. (PH7.9 and PH7.11 are hard prerequisites above.)
- All touched packages/docs committed or ready for final verification.
- Current CI/root verification commands are green locally or in CI.

---

## Source Inputs

- all outputs from PH7.1 through PH7.11
- current ADR index (post-PH7.11 reconciliation)
- updated docs index
- root build/lint/test/type-check commands
- package-specific verification results
- `docs/reference/release-readiness-taxonomy.md` (produced by PH7.9)
- `docs/architecture/release/release-signoff-template.md` (produced by PH7.9)

---

## 7.12.1 — Build the P1 Closure Matrix

- **[Amendment A — Define P1 issues explicitly]** The P1 issues referenced throughout Phase 7 are defined as follows. Every PH7 plan is mapped to exactly one P1 issue. The closure matrix must cover all six:

  | Issue | Name | Primary Phases | Description |
  |-------|------|----------------|-------------|
  | P1-01 | Architecture & Documentation Coherence | PH7.1, PH7.10 | Current-state map, doc classification system, and documentation discoverability from entrypoints |
  | P1-02 | Auth Store Isolation | PH7.2 | `@hbc/auth-core` store isolation; removal of auth state leaking through non-auth packages |
  | P1-03 | Shell Decomposition | PH7.3 | Shell package split and surface narrowing; removal of cross-boundary shell imports |
  | P1-04 | Tier-1 Primitive Normalization | PH7.4 | `hbc-theme-context` and `fluent-tokens` normalization across all consuming packages |
  | P1-05 | Package Hardening & Boundary Enforcement | PH7.5, PH7.6, PH7.7 | ESLint boundary rules, import audits, cross-package leak remediation |
  | P1-06 | Test Governance Normalization | PH7.8 | Root-level P1 package test orchestration, normalized test scripts, cycle resolution |

- **[Amendment C — PH7.4–7.7 progress note reconciliation]** Before populating the closure matrix, verify that PH7.4 through PH7.7 progress notes have all required fields filled. Specifically:
  1. Confirm completion dates are recorded in each plan's progress notes (PH7.4, PH7.5, PH7.6, PH7.7 — currently undated).
  2. Resolve and record the following open items that were left unresolved in PH7.6 and PH7.7:
     - PH7.6: "release-gate rule (location: TBD)" — determine canonical location and record it.
     - PH7.6: "admin-provisioning resolution: Option A or B" — record which option was chosen and why.
     - PH7.7: "`getDefaultDestinationPath()` status" — confirm whether the function was fixed, replaced, or deferred with rationale.
     - PH7.7: "ADR-0082 created: YES/NO" — confirm ADR-0082 existence and record the result.
  3. If any item is deferred rather than resolved, record the explicit deferral rationale in both the originating plan's progress notes and the P1 closure matrix.

- Create a final matrix for P1-01 through P1-06 with: issue ID, name, primary phases, status (closed / downgraded by ADR / deferred with rationale), evidence reference, and approver notes. This matrix becomes Section 1 of the evidence package defined in §7.12.2 (Amendment D).

## 7.12.2 — Run Mechanical Verification Gates

- **[Amendment E — Mechanical gate pass/fail criteria]** Run and record each gate with an explicit PASS or FAIL verdict using the following criteria:

  | Gate | Command | PASS Criterion | FAIL Criterion |
  |------|---------|----------------|----------------|
  | Build | `pnpm turbo run build` | Zero errors; all packages build successfully | Any build error in any package |
  | Lint | `pnpm turbo run lint` | Zero lint errors (pre-existing warnings permitted if documented) | Any new lint error introduced during Phase 7 |
  | Type-check | `pnpm turbo run check-types` | Zero TypeScript type errors | Any type error |
  | P1 package tests | `pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit --filter=@hbc/shared-kernel --filter=@hbc/app-types` | All tests pass in all five P1 packages | Any test failure in any of the five P1 packages |

  A FAIL on any gate means PH7.12 does not close. The failing gate must be remediated and all gates re-run from the beginning before PH7.12 can proceed.

- **[Amendment D — Evidence package format]** All mechanical gate results must be recorded in the single consolidated evidence package document at `docs/architecture/release/PH7-final-verification-evidence.md`. This document is the authoritative record for PH7.12 and must contain the following sections in order:
  1. P1 Closure Matrix (from §7.12.1)
  2. Mechanical Gate Results (build / lint / type-check / test — each with command, timestamp, and PASS/FAIL)
  3. Documentation Discoverability Review (from §7.12.3)
  4. Package-Boundary and Governance Outcomes (from §7.12.4)
  5. PH7-RM-* Deferred Scope Disposition (from §7.12.4, Amendment F)
  6. Readiness Classification Record (from §7.12.5)
  7. Sign-Off Record (from §7.12.6)

## 7.12.3 — Verify Documentation and Discoverability

- Confirm the following are all discoverable from the docs entrypoints (`docs/README.md` and `docs/architecture/blueprint/current-state-map.md`):
  - current-state map (`docs/architecture/blueprint/current-state-map.md`)
  - doc classification system (`current-state-map.md §2` matrix)
  - Tier-1 primitive policy (referenced from `current-state-map.md §2` or the active phase plan)
  - release readiness taxonomy (`docs/reference/release-readiness-taxonomy.md` — produced by PH7.9)
  - ADR catalog (`docs/architecture/adr/` — reconciled by PH7.11)
  - key Phase 7 reference docs (auth-shell series, test governance, boundary rules — produced by PH7.11)
- For each item, record: path confirmed, reachable from entrypoint (YES/NO), notes. Record the full discoverability review as Section 3 of the evidence package.

## 7.12.4 — Verify Package-Boundary and Governance Outcomes

- Confirm that all known P1 boundary leaks identified in PH7.5–7.7 are removed and the relevant ESLint boundary rules are active.
- Confirm shell decomposition (PH7.3) and auth narrowing (PH7.2) are complete: the shell package surface is narrowed, auth state is isolated to `@hbc/auth-core`, and no cross-boundary violations remain.
- Confirm root P1 test governance is expanded (PH7.8): the five P1 packages are covered, cyclic dependency is resolved, and the root test script filter is in place.
- Confirm that any items deferred from PH7.4–7.7 have explicit deferral rationale recorded in the closure matrix (Amendment C above).
- **[Amendment F — PH7-RM-* deferred scope confirmation]** Before sign-off, confirm the disposition of all 9 PH7-RM-* plans (`PH7-RM-1-Package-Foundation.md` through `PH7-RM-9-Testing-and-Documentation.md`):
  1. Verify that each plan remains classified as Deferred Scope (Tier 1 banner present, no active milestone assigned).
  2. If any PH7-RM-* plan has been scheduled or activated since PH7.10, it must have been reclassified to Canonical Normative Plan and linked from the active phase plan per the maintenance rule in `current-state-map.md §2.1`. Record the finding either way.
  3. Record the full disposition table (plan name, current classification, scheduled YES/NO, reclassification required YES/NO) as Section 5 of the evidence package.

## 7.12.5 — Capture Readiness Classification for Phase 7

- Record whether Phase 7 is Code-Ready, Environment-Ready, and Operations-Ready.
  > See [Release Readiness Taxonomy](../../reference/release-readiness-taxonomy.md) for canonical definitions of each level.

- **[Amendment G — Readiness classification criteria for stabilization phase]** Phase 7 is a stabilization phase (P1 remediation), not a feature-expansion phase. The readiness classification must apply the following criteria:

  | Level | Criterion for PH7 Stabilization |
  |-------|----------------------------------|
  | Code-Ready | All P1 issues (P1-01 through P1-06) are closed or downgraded by ADR. Build, lint, type-check, and P1 package tests are all PASS. |
  | Environment-Ready | **N/A — Stabilization Phase.** PH7 introduces no new environment dependencies, infrastructure changes, or deployment contracts. Mark as: `N/A (stabilization phase — deferred to next expansion phase)`. |
  | Operations-Ready | **N/A — Stabilization Phase.** PH7 introduces no new operational runbooks, monitoring requirements, or DR procedures. Mark as: `N/A (stabilization phase — deferred to next expansion phase)`. |
  | Net Verdict | **Code-Ready is sufficient** to resume platform expansion for a stabilization phase. If Code-Ready is achieved and Environment-Ready and Operations-Ready are both marked N/A-Deferred, the net verdict is: **Phase 7 complete — platform expansion may resume.** |

  Record the readiness classification as Section 6 of the evidence package. The net verdict must explicitly state whether platform expansion is or is not permitted as of the sign-off date.

## 7.12.6 — Final Sign-Off

- **[Amendment H — Sign-off record format and Phase 7 sign-off ADR]** The sign-off record must follow this exact format and be recorded as Section 7 of the evidence package:

  ```
  Phase 7 P1 Stabilization — Final Sign-Off Record
  Date: YYYY-MM-DD
  Architecture Owner: [name / handle]
  Product Owner: [name / handle]
  Verdict: APPROVED / NOT APPROVED
  Statement: "All Phase 7 P1 stabilization issues are closed or explicitly dispositioned.
               Renewed platform expansion is permitted as of [date]."
  ADR reference: ADR-0090 — Phase 7 Final Verification & Sign-Off
  ```

  The sign-off must explicitly state that renewed platform expansion is permitted (or, if NOT APPROVED, enumerate the blocking items that must be resolved before the verdict can change).

- **[Amendment H — Phase 7 sign-off ADR]** As part of PH7.12 completion, a new ADR must be created at `docs/architecture/adr/ADR-0090-phase-7-final-verification.md`. This ADR is the last ADR in the PH7 series (ADR-0089 is the last assigned in PH7.11). The ADR must record:
  - **Context:** Phase 7 P1 stabilization scope, the six P1 issues, and the remediation phases executed.
  - **Decision:** All P1 issues are closed or explicitly dispositioned; platform expansion is resumed.
  - **Consequences:** The PH7-RM-* plans remain Deferred Scope; the next expansion phase activates on the PH7-RM-* scope as needed.
  - **Evidence:** Reference to `docs/architecture/release/PH7-final-verification-evidence.md`.

---

## Deliverables

- **[Amendment D]** consolidated evidence package at `docs/architecture/release/PH7-final-verification-evidence.md` (7 sections: P1 closure matrix, mechanical gate results, documentation discoverability review, package-boundary outcomes, PH7-RM-* disposition, readiness classification, sign-off record)
- **[Amendment H]** Phase 7 sign-off ADR at `docs/architecture/adr/ADR-0090-phase-7-final-verification.md`

---

## Acceptance Criteria Checklist

- [ ] P1-01 through P1-06 are explicitly defined and each has a closure status (Amendment A).
- [ ] PH7.4–7.7 progress note dates are filled and all four identified open items are resolved or explicitly deferred with rationale (Amendment C).
- [ ] Build gate: `pnpm turbo run build` PASS (Amendment E).
- [ ] Lint gate: `pnpm turbo run lint` PASS (Amendment E).
- [ ] Type-check gate: `pnpm turbo run check-types` PASS (Amendment E).
- [ ] P1 package test gate: all five P1 packages PASS (Amendment E).
- [ ] PH7.9 hard prerequisite satisfied: `docs/reference/release-readiness-taxonomy.md` and `docs/architecture/release/release-signoff-template.md` exist (Amendment B).
- [ ] PH7.11 hard prerequisite satisfied: ADR catalog reconciled, reference docs present, developer rules in place (Amendment B).
- [ ] Current-state map, classification docs, Tier-1 primitive policy, readiness taxonomy, ADRs, and key Phase 7 reference docs are all discoverable from docs entrypoints.
- [ ] PH7-RM-* deferred scope disposition confirmed and recorded in evidence package (Amendment F).
- [ ] Readiness classification recorded with stabilization-phase criteria applied; net verdict explicit (Amendment G).
- [ ] Evidence package exists at `docs/architecture/release/PH7-final-verification-evidence.md` with all 7 sections (Amendment D).
- [ ] Sign-off record uses required format and explicitly permits renewed platform expansion (Amendment H).
- [ ] ADR-0090 created at `docs/architecture/adr/ADR-0090-phase-7-final-verification.md` (Amendment H).
- [ ] Architecture owner and product owner sign-off are recorded.

---

## Verification Evidence

- `pnpm turbo run build` — record output and PASS/FAIL
- `pnpm turbo run lint` — record output and PASS/FAIL
- `pnpm turbo run check-types` — record output and PASS/FAIL
- P1 package test execution (5 packages) — record output and PASS/FAIL
- documentation discoverability review — record path-by-path results
- PH7-RM-* disposition table
- readiness classification record (with stabilization-phase N/A rulings)
- sign-off record (format per Amendment H)
- ADR-0090 created

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.12 started: YYYY-MM-DD
PH7.12 completed: YYYY-MM-DD

Hard prerequisites confirmed:
- PH7.9 complete (readiness taxonomy + sign-off template exist): YES/NO
- PH7.11 complete (ADR reconciliation + reference docs + developer rules): YES/NO

Artifacts:
- docs/architecture/release/PH7-final-verification-evidence.md (evidence package, 7 sections)
- docs/architecture/adr/ADR-0090-phase-7-final-verification.md (sign-off ADR)

Mechanical gates:
- build:       PASS/FAIL
- lint:        PASS/FAIL
- check-types: PASS/FAIL
- test (5 P1 packages): PASS/FAIL

P1 closure summary:
- P1-01 Architecture & Documentation Coherence: CLOSED/DEFERRED
- P1-02 Auth Store Isolation:                   CLOSED/DEFERRED
- P1-03 Shell Decomposition:                    CLOSED/DEFERRED
- P1-04 Tier-1 Primitive Normalization:         CLOSED/DEFERRED
- P1-05 Package Hardening & Boundary Enforcement: CLOSED/DEFERRED
- P1-06 Test Governance Normalization:          CLOSED/DEFERRED

PH7.4–7.7 open item resolution:
- PH7.6 release-gate rule location:       RESOLVED: [location] / DEFERRED: [rationale]
- PH7.6 admin-provisioning option:        RESOLVED: Option [A/B] / DEFERRED: [rationale]
- PH7.7 getDefaultDestinationPath status: RESOLVED: [outcome] / DEFERRED: [rationale]
- PH7.7 ADR-0082 created:                 YES/NO

PH7-RM-* disposition: all 9 remain Deferred Scope / [list any reclassified]

Readiness classification:
- Code-Ready:        YES/NO
- Environment-Ready: N/A (stabilization phase)
- Operations-Ready:  N/A (stabilization phase)
- Net verdict:       Phase 7 complete — platform expansion [PERMITTED / NOT PERMITTED]

Sign-off:
- Architecture Owner: [name] — [APPROVED / NOT APPROVED] — YYYY-MM-DD
- Product Owner:      [name] — [APPROVED / NOT APPROVED] — YYYY-MM-DD
- ADR-0090 created:   YES/NO

Notes:
- unresolved items:
- deferred items with rationale:
-->
```
