# PH7.10 — Documentation Drift Classification

**Version:** 1.0  
**Purpose:** Resolve documentation drift by classifying major architecture documents according to their role rather than attempting a wholesale rewrite.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Publish a classification model for the repo’s major docs so readers can distinguish current canonical truth, normative future plans, historical foundations, deferred scope, and superseded references at a glance.

---

## Prerequisites

- PH7.1 complete.
- Review the docs index, blueprint docs, foundation/master plans, active phase plans, shared-feature plans, release docs, and ADR index.

---

## Source Inputs

- `docs/README.md`
- `docs/architecture/blueprint/*`
- `docs/architecture/plans/*`
- `docs/architecture/release/*`
- `docs/reference/*`
- ADR catalog

---

## 7.10.1 — Define the Classification Model

- Use only the classes Canonical Current-State, Canonical Normative Plan, Historical Foundational, Deferred Scope, and Superseded / Archived Reference.
- Define what each class means, how readers should use it, whether it should be updated, and when it can be superseded.

## 7.10.2 — Build the Documentation Classification Matrix

- Create a matrix covering the root docs index, blueprint docs, foundation/master plans, active current phase plans, shared-feature plans, release/sign-off docs, the current-state map, and any known superseded artifacts still useful for history.

## 7.10.3 — Update `docs/README.md`

- Add a section explaining how the classified doc system works and where readers should look first for current truth and second for historical context.

## 7.10.4 — Add Classification Notes to High-Value Docs

- Add lightweight classification notes to the current-state map, blueprint, foundation plan, active master phase plan(s), and still-active shared-feature plans.

## 7.10.5 — Define the Ongoing Maintenance Rule

- Document the rule that every new architecture/plan/reference/release doc should state or be index-classified as one of the defined classes.

---

## Deliverables

- classification matrix
- updated `docs/README.md`
- targeted classification notes in major docs

---

## Acceptance Criteria Checklist

- [ ] Classification model is clearly defined.
- [ ] Major docs are classified.
- [ ] `docs/README.md` explains how to navigate the classified doc system.
- [ ] High-value docs visibly indicate their role.
- [ ] Future maintenance rule is documented.

---

## Verification Evidence

- updated docs list
- manual spot-check of major doc classifications
- link validation where cross-links are added

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.10 started: YYYY-MM-DD
PH7.10 completed: YYYY-MM-DD

Artifacts:
- classification matrix
- updated `docs/README.md`
- targeted classification notes in major docs

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
