# PH7.11 — ADRs, Reference Docs & Developer Rules

**Version:** 1.0  
**Purpose:** Lock Phase 7 stabilization decisions into durable governance artifacts so the platform does not regress after remediation is complete.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Publish the ADRs, reference docs, and developer-rule updates required to make Phase 7 decisions traceable, enforceable, and discoverable.

---

## Prerequisites

- PH7.1 through PH7.10 materially complete or draft-complete.
- Review the current ADR naming/indexing conventions and the root lint/developer-rule infrastructure.

---

## Source Inputs

- ADR catalog in `docs/architecture/adr/`
- `docs/README.md`
- `.eslintrc.base.js`
- local lint plugin/rules package(s)
- developer how-to / package-authoring guides
- Phase 7 task outputs

---

## 7.11.1 — Create the Required ADR Set

- At minimum create ADRs for: current-state architecture source-of-truth model, auth store responsibility boundary, shell core decomposition boundary, Tier-1 shared-feature primitive policy, and release-readiness taxonomy.

## 7.11.2 — Update ADR Indexing and Discoverability

- Add new ADRs to the ADR index, link them from the docs index, and connect them from relevant Phase 7 docs and package docs where useful.

## 7.11.3 — Publish Reference Docs Produced by Phase 7

- Ensure current-state map, platform primitives, readiness taxonomy, package testing matrix, and complexity sensitivity matrix are indexed and linked.

## 7.11.4 — Update Developer Rules / Guidance

- Update guidance so future work respects source-of-truth hierarchy, Tier-1 primitive rules, test governance, readiness terminology, and doc classification rules.

## 7.11.5 — Assess Rule/Lint Opportunities

- Evaluate whether any Phase 7 decisions should be mechanically enforced, but only add rules where the target is stable and low-noise.

---

## Deliverables

- ADR set
- ADR index updates
- reference doc index updates
- developer guidance updates
- any justified lint/rule updates

---

## Acceptance Criteria Checklist

- [ ] Required ADRs are written and indexed.
- [ ] New reference docs are discoverable from the docs entrypoints.
- [ ] Developer guidance reflects Phase 7 stabilization decisions.
- [ ] Any lint/rule additions are justified, scoped, and documented.
- [ ] Phase 7 governance is durable rather than relying on memory or chat history.

---

## Verification Evidence

- ADR files created
- ADR index updated
- docs links validated
- lint/build/type-check if rules/config changed

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.11 started: YYYY-MM-DD
PH7.11 completed: YYYY-MM-DD

Artifacts:
- ADR set
- ADR index updates
- reference doc index updates
- developer guidance updates
- any justified lint/rule updates

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
