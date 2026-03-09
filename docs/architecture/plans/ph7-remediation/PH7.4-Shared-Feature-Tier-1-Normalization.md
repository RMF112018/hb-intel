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
- **Starting-state note (PH7.4R, 2026-03-09):** All three packages confirmed at v0.1.0 with zero adoption across all 11 feature packages and all apps. No package has a `README.md`. `docs/reference/platform-primitives.md` does not yet exist. Two package-specific platform-primitive ADRs referenced in SF02/SF03 master plans do not exist in the repository (see §7.4.2 ADR governance note).

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
- Author per-package `README.md` files for `packages/sharepoint-docs/`, `packages/bic-next-move/`, and `packages/complexity/` covering purpose, concern area, installation, and quick-start. These are the first developer-visible documentation for each package and must exist before cross-linking from `platform-primitives.md`.
- **ADR governance (PH7.4R, 2026-03-09):** The SF02 (BIC-Next-Move) and SF03 (Complexity-Dial) master plans each reference a package-specific platform-primitive ADR that does not exist in the repository. The actual `ADR-0011` is `ADR-0011-verification-deployment.md` and the actual `ADR-0012` is `ADR-0012-models-comprehensive-structure.md`; neither is related to these shared-feature packages. PH7.4 must **create** — not merely validate — the following ADRs using the next sequential numbers, then update the SF02 and SF03 master plans to reference the corrected filenames:
  - `docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md`
  - `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md`

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
- `packages/sharepoint-docs/README.md`
- `packages/bic-next-move/README.md`
- `packages/complexity/README.md`
- `docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md`
- `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md`
- updated SF02 and SF03 master plans (corrected ADR references)
- Tier-1 adoption matrix
- updated developer guidance / planning rules
- cross-links from shared-feature docs and package READMEs

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
- `packages/sharepoint-docs/README.md`
- `packages/bic-next-move/README.md`
- `packages/complexity/README.md`
- `docs/architecture/adr/ADR-0080-bic-next-move-platform-primitive.md`
- `docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md`
- updated SF02 and SF03 master plans (corrected ADR references)
- Tier-1 adoption matrix
- updated developer guidance / planning rules
- cross-links from shared-feature docs and package READMEs

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

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.4R validation completed: 2026-03-09
Amendments applied: 2026-03-09

Findings:
- All three packages (sharepoint-docs, bic-next-move, complexity) at v0.1.0 with zero adoption
  across all 11 feature packages and all apps. Zero package.json dependencies declared anywhere.
- No README.md exists for any of the three packages.
- ADR numbering conflict: SF02 master plan references ADR-0011-bic-next-move-platform-primitive.md
  (does not exist; actual ADR-0011 is ADR-0011-verification-deployment.md). SF03 master plan
  references ADR-0012-complexity-dial-platform-primitive.md (does not exist; actual ADR-0012 is
  ADR-0012-models-comprehensive-structure.md). Highest existing sequential ADR is ADR-0079.
  Assigned ADR-0080 (bic-next-move) and ADR-0081 (complexity-dial) as next sequential numbers.
- SF04 (Acknowledgment), SF05 (Step-Wizard), SF06 (Versioned-Record) confirmed out of scope.
- PH7.5, PH7.6, and PH7.7 each list PH7.4 complete as a hard prerequisite.

Amendments applied:
- Prerequisites: added starting-state note (zero READMEs, zero adoption, platform-primitives.md
  absent, ADR conflict flagged).
- §7.4.2: added per-package README authoring task.
- §7.4.2: added ADR creation directive for ADR-0080 and ADR-0081 with conflict explanation and
  SF02/SF03 update requirement.
- Deliverables: added per-package READMEs, ADR-0080, ADR-0081, and SF02/SF03 master plan
  corrections as explicit named deliverables.
- Progress Notes template: updated artifact list to match amended Deliverables section.

Next: PH7.4 implementation (awaiting user confirmation to proceed).
-->
