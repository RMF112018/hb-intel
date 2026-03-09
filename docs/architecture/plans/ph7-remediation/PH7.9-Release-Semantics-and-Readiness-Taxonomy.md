# PH7.9 — Release Semantics & Readiness Taxonomy

**Version:** 1.0  
**Purpose:** Formalize release-readiness semantics so the platform distinguishes code completion from environment setup and operational readiness.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Replace ambiguous readiness language with a three-level taxonomy — Code-Ready, Environment-Ready, Operations-Ready — and update release/checklist guidance so “production-ready” is only used when all three are true.

---

## Prerequisites

- PH7.1 complete.
- Review PH6 master plan, release checklists, sign-off docs, and major phase plans that currently use readiness language.

---

## Source Inputs

- `docs/architecture/plans/PH6-Provisioning-Plan.md`
- release docs under `docs/architecture/release/*`
- package/app sign-off docs
- CI/CD docs and runbooks
- current ADRs that imply readiness boundaries

---

## 7.9.1 — Define the Three Readiness Levels

- Publish canonical definitions for Code-Ready, Environment-Ready, Operations-Ready, and the rule that Production-Ready may be used only when all three are true.

## 7.9.2 — Define the Language Rules

- Document explicit language rules for plans, completion notes, commit summaries, and sign-off artifacts so “production-ready” is not used for code-only completion.

## 7.9.3 — Update Release/Checklist Artifacts

- Add fields for Code-Ready date, Environment-Ready date, Operations-Ready date, and optional Production-Ready date to major release/sign-off artifacts.

## 7.9.4 — Update Active Phase Plans Where Needed

- Add targeted cross-reference/terminology notes to PH6 and other active high-value plans without rewriting them wholesale.

## 7.9.5 — Publish the Readiness Reference Doc

- Create `docs/reference/release-readiness-taxonomy.md` with definitions, language rules, examples, anti-patterns, and template snippets.

---

## Deliverables

- `docs/reference/release-readiness-taxonomy.md`
- targeted updates to active release/sign-off docs
- terminology cross-links in major plans where needed

---

## Acceptance Criteria Checklist

- [ ] Code-Ready, Environment-Ready, and Operations-Ready are defined.
- [ ] “Production-ready” has a constrained meaning.
- [ ] Release/sign-off artifacts can record readiness by level.
- [ ] Active plans/docs reference the taxonomy where needed.
- [ ] Future contributors have examples and template snippets.

---

## Verification Evidence

- updated docs list
- spot-check of at least two active plans/release docs using the taxonomy correctly
- build/lint/type-check if any structured config/docs tooling is touched

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.9 started: YYYY-MM-DD
PH7.9 completed: YYYY-MM-DD

Artifacts:
- `docs/reference/release-readiness-taxonomy.md`
- targeted updates to active release/sign-off docs
- terminology cross-links in major plans where needed

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
