# PH7.6 — BIC Standardization & Registration Enforcement

**Version:** 1.0  
**Purpose:** Turn `@hbc/bic-next-move` into a platform-wide accountability standard instead of a strong but isolated package.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Standardize Ball-in-Court / next-move ownership semantics across modules, define registration requirements, publish the adoption matrix, and make BIC integration a release expectation for ownership-driven workflows.

---

## Prerequisites

- PH7.1 and PH7.4 complete.
- Review the BIC shared-feature plan, package sources, and current modules with actionable ownership semantics.

---

## Source Inputs

- `packages/bic-next-move/src/types/*`
- `packages/bic-next-move/src/registry/*`
- `packages/bic-next-move/src/hooks/*`
- `packages/bic-next-move/src/components/*`
- current feature/app modules with ownership semantics

---

## 7.6.1 — Define the Platform Ownership Vocabulary

- Publish the core vocabulary: current owner, next move, expected action, previous owner, next owner, escalation owner, blocked, unassigned, urgency tier, transfer history.

## 7.6.2 — Identify Modules That Must Register

- Classify each active module/workflow as must register, may integrate later, or not applicable; include status and blockers.

## 7.6.3 — Publish the BIC Registration Standard

- Document what it means to be BIC-compliant: registry use, canonical state/types, unassigned handling, urgency semantics, blocked navigation behavior, and no local shadow models without ADR exception.

## 7.6.4 — Define Release Gate Expectations

- Create the rule that no action-owning module ships without full BIC integration, not-applicable classification, or ADR exception.

## 7.6.5 — Build the Adoption Dashboard / Matrix

- Create a markdown adoption matrix showing registration, UI, testing, release-gate, and exception status by module.

## 7.6.6 — Align Testing and Reference Examples

- Ensure BIC is prepared for PH7.8 root test governance and has clear examples for future authors.

## 7.6.7 — Update the Shared-Feature Plan

- Update `SF02-BIC-Next-Move.md` to reflect current implementation state, standardization policy, and module adoption path.

---

## Deliverables

- BIC glossary/reference section
- cross-module adoption matrix
- updated developer guidance
- updated `SF02-BIC-Next-Move.md`

---

## Acceptance Criteria Checklist

- [ ] Platform ownership vocabulary is published.
- [ ] A full module adoption matrix exists.
- [ ] BIC registration standard is documented.
- [ ] Release-gate rule for action-owning modules is documented.
- [ ] Shared-feature plan reflects standardization status and next adoption steps.

---

## Verification Evidence

- updated docs link check
- current modules classified
- ADR exception review if applicable

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.6 started: YYYY-MM-DD
PH7.6 completed: YYYY-MM-DD

Artifacts:
- BIC glossary/reference section
- cross-module adoption matrix
- updated developer guidance
- updated `SF02-BIC-Next-Move.md`

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
