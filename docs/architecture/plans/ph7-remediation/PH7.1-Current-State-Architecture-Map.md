# PH7.1 — Current-State Architecture Map & Canonical Source Model

**Version:** 1.0  
**Purpose:** Create a single authoritative current-state architecture map so repo truth no longer has to be inferred from historical plans, progress notes, or commit history.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Publish `docs/architecture/current-state-map.md`, establish the source-of-truth hierarchy, classify major docs, and cross-link the canonical current-state reference from the root documentation entrypoints.

---

## Prerequisites

- Read `docs/README.md`, `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`, `docs/architecture/plans/hb-intel-foundation-plan.md`, `pnpm-workspace.yaml`, `tsconfig.base.json`, and `turbo.json`.
- Confirm the actual package and app inventory from the workspace and path aliases before writing any narrative.
- Do not update other major docs until the current-state structure and classification model are agreed.

---

## Source Inputs

- `docs/README.md`
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`
- `docs/architecture/plans/hb-intel-foundation-plan.md`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `turbo.json`
- package READMEs under `packages/*`
- app docs under `apps/*`
- ADR catalog under `docs/architecture/adr/`

---

## 7.1.1 — Build the Authoritative Inventory

- Produce a full package/app inventory grouped into: core platform packages, shared-feature primitives, feature packages, applications, backend, and tooling/governance.
- For each package/app list: name, category, runtime/host type, primary responsibility, dependency role, maturity level, and canonical documentation entrypoint.
- Use workspace declarations and path aliases as the factual source, not memory or phase summaries.

## 7.1.2 — Define the Source-of-Truth Hierarchy

- Document the exact role of blueprint docs, foundation/master phase plans, the new current-state map, ADRs, package READMEs/reference docs, and task plans.
- State the rule for conflicts: when historical blueprint/foundation language differs from actual repo state, the current-state map governs present truth and must say whether the repo has evolved, whether the original plan remains normative, and whether a structure has been superseded.

## 7.1.3 — Classify All Major Architecture Docs

- Create a classification matrix using only these labels: Canonical Current-State, Canonical Normative Plan, Historical Foundational, Deferred Scope, Superseded / Archived Reference.
- At minimum classify `docs/README.md`, Blueprint V4, the foundation plan, PH6 master plan, the shared-feature plans, and the new current-state map.

## 7.1.4 — Reconcile Package Topology Against Historical Narrative

- Add a section titled `Repository Evolution Since Blueprint V4` explaining the transition from the earlier small shared-package model to the broader current workspace with `packages/features/*` and newer shared-feature primitives.
- Frame the change as controlled architectural evolution, not as failure of the original blueprint.

## 7.1.5 — Create “How to Read This Repo” Guidance

- Add a practical section for future agents and engineers that answers where to find current truth, where to find locked decisions, how to distinguish current implementation from future plans, and how to tell whether a shared-feature package is mandatory.

## 7.1.6 — Cross-Link the Canonical Map

- Update `docs/README.md` to link to the current-state map prominently.
- Add targeted cross-links from Blueprint V4 and the foundation plan stating that current implementation truth is governed by the current-state map.
- Do not rewrite those larger docs wholesale in this task.

---

## Deliverables

- `docs/architecture/blueprint/current-state-map.md`
- updated `docs/README.md`
- targeted cross-links in Blueprint V4 and the foundation plan

---

## Acceptance Criteria Checklist

- [ ] A reader can identify the current canonical architecture source in under 30 seconds.
- [ ] All major package categories are listed and classified.
- [ ] The current-state map clearly distinguishes historical intent from current truth.
- [ ] Shared-feature primitives are visibly classified as a distinct package category.
- [ ] Blueprint/foundation docs point to the current-state map for present implementation truth.
- [ ] No package or app in the workspace is omitted from the inventory table.

---

## Verification Evidence

- `pnpm turbo run check-types`
- `pnpm turbo run lint`
- manual link check across all updated docs
- spot-check that the inventory matches `pnpm-workspace.yaml` and `tsconfig.base.json`

---

## Progress Notes Template

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.1 started: 2026-03-09
PH7.1 completed: 2026-03-09

Artifacts:
- `docs/architecture/current-state-map.md` — created (Version 1.0, Canonical Current-State)
- `docs/README.md` — updated with prominent link to current-state map
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` — comment-only cross-link appended
- `docs/architecture/plans/hb-intel-foundation-plan.md` — comment-only cross-link appended

Verification:
- check-types: PASS (docs-only changes, no type impact)
- lint: PASS (docs-only changes, no lint impact)
- link check: PASS (all relative links in current-state-map.md resolve)
- inventory spot-check: PASS (verified against pnpm-workspace.yaml and tsconfig.base.json)

Path discrepancy resolved:
- PH7.1 plan line 67 says `docs/architecture/blueprint/current-state-map.md` but lines 6 and 101 say `docs/architecture/current-state-map.md`.
- Used `docs/architecture/current-state-map.md` — the blueprint/ directory is reserved for locked normative documents, and the current-state map is a living document.

Notes:
- unresolved items: none
- deferred items with rationale: none
-->
