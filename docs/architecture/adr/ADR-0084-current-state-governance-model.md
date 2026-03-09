# ADR-0084: Current-State Source-of-Truth and Documentation Governance Model

**Status:** Accepted
**Date:** 2026-03-09
**Phase:** PH7.10 / PH7.11

## Context

As the HB Intel monorepo accumulated plans, ADRs, and operational documentation across Phases 1–7, no formal governance model existed to distinguish present implementation truth from historical plans, future targets, or deferred scope. Developers and agents frequently misread locked blueprint descriptions as current-state facts, leading to incorrect assumptions during implementation.

PH7.10 established a document classification system and source-of-truth hierarchy. PH7.11 locks these governance structures into a permanent ADR.

## Decision

1. **Source-of-Truth Hierarchy** — Six tiers govern conflict resolution:
   - Tier 1: `current-state-map.md` (Canonical Current-State)
   - Tier 2: Blueprint V4 (Canonical Normative Plan)
   - Tier 3: Foundation Plan (Historical Foundational)
   - Tier 4: ADRs (Permanent Decision Rationale)
   - Tier 5: Phase/Task Plans (Time-bound Execution)
   - Tier 6: Package READMEs (Current Implementation Detail)

2. **Six-Class Document Classification Model:**
   - Canonical Current-State
   - Canonical Normative Plan
   - Historical Foundational
   - Deferred Scope
   - Superseded / Archived Reference
   - Permanent Decision Rationale

3. **Tier 1/2 Banner System** — High-risk documents that could be misread as authoritative current-state carry an inline `Doc Classification` banner immediately below their H1 title.

4. **Classification Maintenance Rule** — Every new architecture, plan, reference, or release document must declare one of the six classes at creation time, either via an inline Tier 1 banner or by being added to the §2 matrix.

5. **Conflict Resolution Rule** — When documents at different tiers disagree about what the repo currently contains, Tier 1 governs. Each divergence is annotated as controlled evolution, not-yet-implemented, or superseded.

## Consequences

- All new documents must be classified at creation time.
- The §2 matrix in `current-state-map.md` is the single source of truth for classification.
- Developers joining the project start at `current-state-map.md` to understand what exists today.
- Living Reference (Diátaxis) docs are classified by quadrant placement; no inline banner required.

## References

- Current-state-map: `docs/architecture/blueprint/current-state-map.md` (§1, §2, §2.1)
- PH7.10 plan: `docs/architecture/plans/ph7-remediation/PH7.10-Documentation-Drift-Classification.md`
