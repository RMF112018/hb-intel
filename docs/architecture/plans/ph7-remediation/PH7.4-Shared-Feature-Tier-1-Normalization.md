# PH7.4 — Shared-Feature Tier-1 Normalization

**Version:** 1.0  
**Purpose:** Formalize the strongest construction-tech differentiators in the repo as mandatory Tier-1 shared-feature primitives rather than optional specialty packages.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Establish policy, reference documentation, and integration rules that normalize `@hbc/sharepoint-docs`, `@hbc/bic-next-move`, and `@hbc/complexity` as platform primitives that must be used when their concern areas are present.

---

## Prerequisites

- PH7.1 complete.
- Review the three shared-feature master plans and public package surfaces.
- Inventory which current apps/features already consume or should consume each primitive.

---

## Source Inputs

- `packages/sharepoint-docs/*`
- `packages/bic-next-move/*`
- `packages/complexity/*`
- `packages/features/*`
- `apps/*`
- related shared-feature docs and ADRs

---

## 7.4.1 — Define Tier-1 Platform Primitive Policy

- Document what qualifies a package as a Tier-1 primitive: cross-module scope, differentiating value, normalized contracts/docs, release-gate participation, and clear adoption rules.
- Declare the in-scope Tier-1 packages explicitly.

## 7.4.2 — Create the Platform Primitive Registry

- Author `docs/reference/platform-primitives.md` describing each Tier-1 package’s purpose, concern area, mandatory-use conditions, extension rules, ADR exception rules, canonical docs, and maturity level.

## 7.4.3 — Build the Decision Tree for Feature Authors

- Add a simple decision tree for when a feature must use sharepoint-docs, bic-next-move, or complexity rather than inventing local logic.

## 7.4.4 — Create the Adoption Matrix

- Produce a matrix by package/app showing whether each concern area is present, whether the Tier-1 primitive is required, and whether adoption is implemented, partial, planned, not applicable, or ADR-excepted.

## 7.4.5 — Define the Non-Duplication Rule

- Publish an explicit architecture rule that new domain work must not re-implement Tier-1 primitive concern areas locally without an ADR exception.

## 7.4.6 — Update Planning Templates and Developer Rules

- Update developer planning guidance so every future feature plan states which Tier-1 primitives apply and whether any exception is requested.

---

## Deliverables

- `docs/reference/platform-primitives.md`
- Tier-1 adoption matrix
- updated developer guidance / planning rules
- cross-links from shared-feature docs and/or package READMEs

---

## Acceptance Criteria Checklist

- [ ] Tier-1 primitive policy is documented.
- [ ] The three in-scope packages are explicitly listed as Tier-1.
- [ ] Feature authors have a clear decision tree for when to use each primitive.
- [ ] An adoption matrix exists and covers active packages/apps.
- [ ] Non-duplication rule is published and discoverable.

---

## Verification Evidence

- updated docs link check
- manual spot-check against active feature plans/packages
- build/lint/type-check if any package docs/config are touched

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.4 started: YYYY-MM-DD
PH7.4 completed: YYYY-MM-DD

Artifacts:
- `docs/reference/platform-primitives.md`
- Tier-1 adoption matrix
- updated developer guidance / planning rules
- cross-links from shared-feature docs and/or package READMEs

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
