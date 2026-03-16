# HB Intel Blueprint Consolidation Report

> **Doc Classification:** Historical Foundational — audit trail and process record for the 2026-03-14 blueprint corpus consolidation pass; sealed after consolidation; do not update.

**Version:** 1.0
**Date:** 2026-03-14
**Executed by:** HB Intel Documentation Consolidation Agent
**Governed by:** `CLAUDE.md` v1.3 · ADR-0084 · `current-state-map.md` (Tier 1) · `HB-Intel-Blueprint-V4.md` · `hb-intel-foundation-plan.md`

---

## Executive Summary

The HB Intel blueprint corpus contained significant summary-level fragmentation as of 2026-03-14:

- The `HB-Intel-Feature-Phase-Mapping-Recommendation.md` document was unclassified, referred to Phase 6 as "NOT STARTED" (now complete), and had no supersession notice despite being wholly outdated.
- Eleven root-level PH7 expansion and deferred scope plans were unclassified (no Tier 1 banner and no §2 matrix row in `current-state-map.md`).
- The `PH7-Estimating-Feature-Plan.md` v1.0 was explicitly superseded by `PH7-Estimating-Features.md` v2.0 per the v2.0 header, but had no supersession notice in the v1.0 file itself.
- The `PH7-ReviewMode-Plan.md` described itself as a "MASTER SUMMARY" but the PH7-RM-* task files it governs were already classified Deferred Scope — creating a classification mismatch that could mislead agents into beginning Review Mode implementation.
- The MVP plan branch (10 files) was unclassified.
- The `ngx-tracker.md` was unclassified.
- No single document explained the relationship between current-state, target architecture, historical baseline, active plan branches, and the future unified blueprint.

This pass addresses all of these issues. Summary-level fragmentation has been materially reduced. The corpus is now ready for creation of `HB-Intel-Unified-Blueprint.md`.

---

## Governing Rules Used

| Rule | Source | Applied How |
|------|--------|-------------|
| Source-of-Truth Hierarchy (Tier 1–6) | ADR-0084 §Decision.1; `current-state-map.md §1` | `current-state-map.md` governs conflicts; Feature-Phase-Mapping declared superseded |
| Six-Class Document Classification Model | ADR-0084 §Decision.2; `current-state-map.md §2.1` | All unclassified files received inline Tier 1 banners and §2 matrix rows |
| Tier 1/2 Banner System | ADR-0084 §Decision.3 | Master-level unclassified plans received Tier 1 banners; sub-plans covered by group matrix row |
| Classification Maintenance Rule | `CLAUDE.md §1 directive 4`; `current-state-map.md §2.1` | Every newly created document (Crosswalk, Consolidation Report) declared a class at creation |
| No-Silent-Deletion Rule | Consolidation instruction §NO SILENT DELETION RULE | All superseded content either preserved in Crosswalk §9 or explicitly labelled with disposition |
| ADR Append-Only Rule | `CLAUDE.md §4`; ADR-0084 | No ADRs were modified, deleted, or renumbered |
| Comment-Only Rule for Blueprint/Foundation Plan | `CLAUDE.md §5` | Blueprint V4 and Foundation Plan were not edited in any substantive way |

**Conflict resolution principle used:** When two sources disagreed about what the repo currently contains or about which plans are active, `current-state-map.md` governed. When two plans disagreed about which was authoritative (e.g., Estimating v1.0 vs v2.0), the explicit supersession declaration in the newer file was treated as the governing rule.

---

## Frozen Blueprint Corpus Inventory

The following files were examined and classified as part of this consolidation pass.

### Primary Consolidation Targets

| File | Lines | Pre-Consolidation Classification |
|------|-------|--------------------------------|
| `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | 1,262 | Canonical Normative Plan (Tier 1 banner present) |
| `docs/architecture/plans/hb-intel-foundation-plan.md` | 777 | Historical Foundational (Tier 1 banner present) |
| `docs/architecture/plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md` | 478 | **Unclassified** — no banner, not in §2 matrix |

### PH7 Root-Level Expansion Plans

| File | Lines | Pre-Consolidation Classification |
|------|-------|--------------------------------|
| `docs/architecture/plans/PH7-Breakout-Webparts-Plan.md` | 232 | **Unclassified** |
| `docs/architecture/plans/PH7-BD-Features.md` | 268 | **Unclassified** |
| `docs/architecture/plans/PH7-Estimating-Features.md` | 207 | **Unclassified** |
| `docs/architecture/plans/PH7-Estimating-Feature-Plan.md` | 1,966 | **Unclassified** (supersession noted in PH7-Estimating-Features.md but not in this file) |
| `docs/architecture/plans/PH7-ProjectHub-Features-Plan.md` | 230 | **Unclassified** |
| `docs/architecture/plans/PH7-Admin-Feature-Plan.md` | 2,136 | **Unclassified** |
| `docs/architecture/plans/PH7-ReviewMode-Plan.md` | 313 | **Unclassified** (Deferred Scope mismatch with PH7-RM-* files) |
| `docs/architecture/plans/PH9b-UX-Enhancement-Plan.md` | 2,211 | **Unclassified** |

### Related Summary/Program Branches Examined (Not Directly Modified)

| File / Group | Pre-Consolidation Classification |
|-------------|--------------------------------|
| `docs/architecture/plans/ph7-breakout-webparts/` (12 files) | Canonical Normative Plan (in §2 matrix) |
| `docs/architecture/plans/ph7-business-development/` (9 files) | Canonical Normative Plan (in §2 matrix — covered by "PH7 domain plans" row) |
| `docs/architecture/plans/ph7-estimating/` (12 files) | Canonical Normative Plan (in §2 matrix) |
| `docs/architecture/plans/ph7-project-hub/` (16 files) | Canonical Normative Plan (in §2 matrix) |
| `docs/architecture/plans/ph7-remediation/PH7.1–PH7.13` (20 files) | Canonical Normative Plan (in §2 matrix with Tier 1 on gate plans) |
| `docs/architecture/plans/PH7-RM-1–9` (9 files) | Deferred Scope (in §2 matrix with Tier 1 banners) |
| `docs/architecture/plans/shared-features/` (SF01–SF22, ~200+ files) | Various — in §2 matrix by family |
| `docs/architecture/plans/PH2-Shared-Packages-Plan.md` | **Unclassified** (omitted from §2 matrix) |
| `docs/architecture/plans/PH3-Query-State-Mngmt-Plan.md` | **Unclassified** (omitted from §2 matrix) |
| `docs/architecture/plans/PH4-*.md` (~24 files) | Historical Foundational (Tier 1 on master plan) |
| `docs/architecture/plans/PH4B-*.md` (~21 files) | Historical Foundational (covered by group row) |
| `docs/architecture/plans/PH4C-*.md` (~15 files) | Historical Foundational (covered by group row) |
| `docs/architecture/plans/PH5-*.md`, `PH5C-*.md` (~32 files) | Historical Foundational (Tier 1 on master plans) |
| `docs/architecture/plans/PH6-*.md`, `PH6F-*.md` (~36 files) | Historical Foundational (Tier 1 on PH6-Provisioning-Plan.md) |
| `docs/architecture/plans/MVP/` (10 files) | **Unclassified** (except MVP-Plan-Review which had Canonical Current-State banner but no §2 row) |
| `docs/architecture/ngx-tracker.md` | **Unclassified** |
| `docs/architecture/adr/` (111 active + 6 archived) | Permanent Decision Rationale — intact, not touched |
| `docs/architecture/blueprint/current-state-map.md` | Canonical Current-State — updated §2 |
| `docs/README.md` | Canonical Current-State — updated navigation |

---

## Blueprint Consolidation Matrix

| Source File | Role Before Consolidation | Disposition | Content Preserved? | Preserved At | Current Authoritative Replacement | Historical Label Applied | Notes / Conflicts |
|-------------|--------------------------|-------------|-------------------|--------------|----------------------------------|-------------------------|-------------------|
| `HB-Intel-Blueprint-V4.md` | Locked target architecture (Canonical Normative Plan) | Keep as authoritative standalone | N/A | N/A | Self | Tier 1 banner already present | No change to content |
| `hb-intel-foundation-plan.md` | Original implementation instructions (Historical Foundational) | Keep as authoritative standalone | N/A | N/A | Self | Tier 1 banner already present | No change to content |
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Pre-Phase-6 feature mapping; unclassified | Superseded with preserved notes | Yes — full §9.1 | `HB-Intel-Blueprint-Crosswalk.md §9.1` | PH7 domain master plans; MVP plans | Supersession notice + Tier 1 banner added to file | Phase 6 is now complete; all forward-looking content superseded |
| `PH7-Breakout-Webparts-Plan.md` | PH7 infrastructure master index; unclassified | Keep — add classification | N/A | N/A | Self (primary); `HB-Intel-Blueprint-Crosswalk.md §5` | Tier 1 banner added | Canonical Normative Plan confirmed |
| `PH7-BD-Features.md` | BD module master summary; unclassified | Keep — add classification | N/A | N/A | Self | Tier 1 banner added | Canonical Normative Plan confirmed |
| `PH7-Estimating-Features.md` | Estimating module master summary v2.0; unclassified | Keep — add classification | N/A | N/A | Self | Tier 1 banner added | Canonical Normative Plan; supersedes v1.0 |
| `PH7-Estimating-Feature-Plan.md` | Estimating module v1.0 monolithic; unclassified | Superseded — retain as archive | Partial — key decisions in v2.0 | `PH7-Estimating-Features.md` + `HB-Intel-Blueprint-Crosswalk.md §9.2` | `PH7-Estimating-Features.md` v2.0 | Supersession notice + Tier 1 banner added | v2.0 explicitly stated supersession; this file retroactively labeled |
| `PH7-ProjectHub-Features-Plan.md` | Project Hub module master summary; unclassified | Keep — add classification | N/A | N/A | Self | Tier 1 banner added | Canonical Normative Plan confirmed |
| `PH7-Admin-Feature-Plan.md` | Admin module complete feature plan; unclassified | Keep — add classification | N/A | N/A | Self | Tier 1 banner added | Canonical Normative Plan confirmed |
| `PH7-ReviewMode-Plan.md` | Review Mode master summary; unclassified; Deferred mismatch | Keep — add Deferred Scope classification | N/A | N/A | N/A (deferred) | Deferred Scope Tier 1 banner added | Conflict resolved: see Conflict Log §7.1 |
| `PH9b-UX-Enhancement-Plan.md` | Post-Phase-7 UX plan; unclassified | Keep — add Deferred Scope classification | N/A | N/A | N/A (deferred) | Deferred Scope Tier 1 banner added | Title clarification note added |
| `PH2-Shared-Packages-Plan.md` | Phase 2 plan; omitted from §2 matrix | Matrix row added | N/A | N/A | N/A | Historical Foundational via §2 matrix | No file edit needed |
| `PH3-Query-State-Mngmt-Plan.md` | Phase 3 plan; omitted from §2 matrix | Matrix row added | N/A | N/A | N/A | Historical Foundational via §2 matrix | No file edit needed |
| `ngx-tracker.md` | Phase 4.15 NGX completion tracker; unclassified | Keep — add classification | N/A | N/A | N/A | Historical Foundational Tier 1 banner added | All 8 areas confirmed complete |
| `MVP/MVP-Plan-Review-2026-03-13.md` | Current-state review; had banner but no §2 matrix row | Matrix row added | N/A | N/A | Self | Canonical Current-State via §2 row | Banner present, classification now formalized |
| `MVP/MVP-Project-Setup-Plan.md` + T01–T09 | Active MVP plans; unclassified | Matrix row added | N/A | N/A | Self | Canonical Normative Plan via §2 row | Pending refinement per MVP Plan Review |
| `current-state-map.md` | Tier 1 present-truth document | Updated §2 matrix (19 new rows) | N/A | Self | Self | N/A | §2 matrix now comprehensive |
| `docs/README.md` | Navigation index | Updated: crosswalk link added; current-state-map link corrected | N/A | Self | Self | N/A | Corrected relative path for current-state-map link |
| `HB-Intel-Blueprint-Crosswalk.md` (new) | New consolidation crosswalk | Created | N/A | Self | Self | Canonical Current-State Tier 1 banner | Primary output of this consolidation |
| `HB-Intel-Blueprint-Consolidation-Report.md` (this file) | New consolidation report | Created | N/A | Self | Self | Historical Foundational Tier 2 | Audit trail document |

---

## Files Kept As Authoritative Standalone Sources

These files were confirmed as authoritative in their current roles and received no substantive edits:

1. **`docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`** — Locked target architecture; Canonical Normative Plan; comment-only updates permitted.
2. **`docs/architecture/plans/hb-intel-foundation-plan.md`** — Historical Foundational baseline; locked for audit; comment-only updates permitted.
3. **`docs/architecture/blueprint/current-state-map.md`** — Tier 1 present truth; updated §2 matrix only (additive; no deletions; no reclassification of existing rows).
4. **`docs/README.md`** — Navigation index; updated to add crosswalk entry and fix the current-state-map link path.
5. **All ADR files** (`docs/architecture/adr/`) — Append-only; untouched.
6. **PH7 domain task files** (`ph7-breakout-webparts/`, `ph7-estimating/`, `ph7-project-hub/`, `ph7-business-development/`) — Implementation detail files; untouched; already classified by group row in §2 matrix.
7. **PH7-RM-* plans** (`PH7-RM-1` through `PH7-RM-9`) — Already had Tier 1 banners; untouched.
8. **PH7 remediation plans** (`ph7-remediation/PH7.1–PH7.13`) — Already classified; untouched.
9. **Shared-feature plans** (`shared-features/SF01–SF22`) — Already classified by family in §2 matrix; untouched.
10. **PH4–PH6 completed phase plans** — Already classified; untouched.
11. **MVP task files** (`MVP-Project-Setup-T01` through `T09`) — Now classified by matrix row; no inline edits needed.

---

## Files Consolidated or Reframed

| File | How Changed | Why |
|------|-------------|-----|
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Supersession header added (Tier 1 banner; redirect to PH7 plans and crosswalk) | Wholly outdated; Phase 6 complete; Phase 7 plans supersede all forward-looking content |
| `PH7-Estimating-Feature-Plan.md` | Supersession header added (Tier 1 banner; redirect to `PH7-Estimating-Features.md` v2.0) | Explicitly superseded by v2.0; retroactive labeling only — content preserved in file |
| `PH7-ReviewMode-Plan.md` | Deferred Scope classification banner added | Classification mismatch resolved: master plan must match the Deferred Scope status of its PH7-RM-* task files |
| `PH9b-UX-Enhancement-Plan.md` | Deferred Scope classification banner added; title clarification note added | Post-Phase-7 work not yet activated; misleading title ("Phase 4 Development Plan") clarified |
| `PH7-Breakout-Webparts-Plan.md` | Canonical Normative Plan Tier 1 banner added | Previously unclassified; gap in governance compliance |
| `PH7-BD-Features.md` | Canonical Normative Plan Tier 1 banner added | Previously unclassified |
| `PH7-Estimating-Features.md` | Canonical Normative Plan Tier 1 banner added | Previously unclassified |
| `PH7-ProjectHub-Features-Plan.md` | Canonical Normative Plan Tier 1 banner added | Previously unclassified |
| `PH7-Admin-Feature-Plan.md` | Canonical Normative Plan Tier 1 banner added | Previously unclassified |
| `ngx-tracker.md` | Historical Foundational Tier 1 banner added | Previously unclassified |
| `current-state-map.md` | §2 matrix: 19 new rows added (additive only) | Formalizes classification of all previously unclassified files |
| `docs/README.md` | New "Blueprint & Program Navigation" section added; crosswalk linked; current-state-map path corrected | Improves discoverability of crosswalk and corrects a relative link path issue |

---

## Historical Notes Preserved

| Source File | Notes Type | Preserved Location |
|-------------|-----------|-------------------|
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Phase 5C completion context (sign-off roles, date, gates passed) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Phase 6 feature sequencing rationale (why PH6.10, PH6.11, PH6.12 in that order) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Feature deferral rationale (why Tracking Table and Scorecard went to Phase 7; why BD integration deferred; why My Work Feed deferred) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Phase 6 locked decisions (table: PH6 sequence, projectCode elimination, frontend package architecture, sequential SPFx migration) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Phase 7 foundation readiness assessment (as taken at Phase 5C sign-off) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | Risk register (Phase 6 risks; notes on Phase 7 relevance) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `PH7-Estimating-Feature-Plan.md` | Key locked interview decisions (Q11–Q15 summary) | `HB-Intel-Blueprint-Crosswalk.md §9.2` + retained in source file |
| `HB-Intel-Blueprint-V4.md` | Target architecture principles summary (ports/adapters, dual-mode auth, single-build/two-target, Zustand/TanStack, ui-kit ownership) | `HB-Intel-Blueprint-Crosswalk.md §9.3` |

---

## Conflict Resolution Log

### 7.1 — PH7-ReviewMode-Plan.md vs PH7-RM-* Plans

| Item | Detail |
|------|--------|
| **Conflict** | `PH7-ReviewMode-Plan.md` described itself as an active "MASTER SUMMARY" with implementation in "numbered task files below." The PH7-RM-1 through PH7-RM-9 task files it governs were already classified Deferred Scope in `current-state-map.md §2` (with Tier 1 banners applied to all 9 files). |
| **Sources involved** | `PH7-ReviewMode-Plan.md` (claims active status) vs `current-state-map.md §2` (classifies PH7-RM-* as Deferred Scope) |
| **Prevailing source** | `current-state-map.md §2` — per ADR-0084 and the source-of-truth hierarchy, Tier 1 governs |
| **Resolution** | `PH7-ReviewMode-Plan.md` reclassified to Deferred Scope (Tier 1 banner added). A master plan must match the classification of the task files it governs. No content was removed or modified. |
| **Historical context preserved** | All locked Review Mode decisions (RM-1 through RM-8) remain intact in the source file. |

### 7.2 — HB-Intel-Feature-Phase-Mapping-Recommendation.md vs Current State

| Item | Detail |
|------|--------|
| **Conflict** | The Feature-Phase-Mapping document stated Phase 5C was complete and Phase 6 was "NOT STARTED — ready to begin." `current-state-map.md` shows PH6 phase plans classified as Historical Foundational (completed). |
| **Sources involved** | `HB-Intel-Feature-Phase-Mapping-Recommendation.md` (historical snapshot, 2026-03-07) vs `current-state-map.md §2` (present truth, 2026-03-13+) |
| **Prevailing source** | `current-state-map.md §2` — Tier 1 governs present truth |
| **Resolution** | Feature-Phase-Mapping declared Superseded / Archived Reference. Phase 6 completion status is authoritative per `current-state-map.md`. |
| **Historical context preserved** | All sequencing rationale, risk register, and phase transition notes preserved in `HB-Intel-Blueprint-Crosswalk.md §9.1`. |

### 7.3 — PH7-Estimating-Feature-Plan.md v1.0 vs PH7-Estimating-Features.md v2.0

| Item | Detail |
|------|--------|
| **Conflict** | `PH7-Estimating-Features.md` v2.0 header stated "Supersedes: PH7-Estimating-Feature-Plan.md v1.0 (monolithic — retained as archive)" but the v1.0 file itself had no supersession notice. Both files were unclassified. An agent navigating the plans directory could encounter the v1.0 file and use it for implementation guidance. |
| **Sources involved** | `PH7-Estimating-Features.md` v2.0 (explicit supersession claim) vs `PH7-Estimating-Feature-Plan.md` v1.0 (no notice) |
| **Prevailing source** | `PH7-Estimating-Features.md` v2.0 — explicit supersession declaration in the newer file governs |
| **Resolution** | Supersession notice and Tier 1 banner added to `PH7-Estimating-Feature-Plan.md` v1.0. Locked decisions preserved in v2.0 and summarized in Crosswalk §9.2. |

### 7.4 — docs/README.md — Incorrect current-state-map Link Path

| Item | Detail |
|------|--------|
| **Conflict** | `docs/README.md` linked to `./architecture/current-state-map.md` (incorrect path). The file lives at `docs/architecture/blueprint/current-state-map.md`. |
| **Resolution** | Link updated to `./architecture/blueprint/current-state-map.md` in the navigation section. |

### 7.5 — PH9b-UX-Enhancement-Plan.md Title Misleads

| Item | Detail |
|------|--------|
| **Conflict** | `PH9b-UX-Enhancement-Plan.md` carries the H1 title "Phase 4 Development Plan" — a legacy artifact from its internal naming history ("extends PH4-UI-Design-Plan.md V2.1"). This creates the false impression it is a Phase 4 document. |
| **Resolution** | A classification note in the added banner clarifies that the title is a carry-over artifact and this is the PH9b UX Enhancement Plan V3.0, not a Phase 4 plan. The H1 was not modified (comment-only principle). |

---

## Superseded / Historical References

| File | New Role | What Now Replaces Its Summary Role |
|------|----------|------------------------------------|
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | **Superseded / Archived Reference** — historical record only; do not use for implementation decisions | `current-state-map.md` (present truth) · PH7 domain master plans (Phase 7 decisions) · MVP plans (next-wave delivery) |
| `PH7-Estimating-Feature-Plan.md` | **Superseded / Archived Reference** — v1.0 archive only | `PH7-Estimating-Features.md` v2.0 + `ph7-estimating/` task files |

---

## Navigation / Discoverability Improvements

1. **New crosswalk document** — `HB-Intel-Blueprint-Crosswalk.md` created as single-entry navigation guide. Eliminates the need to read 3–5 overlapping documents to understand program status.

2. **docs/README.md updated** — Added "Blueprint & Program Navigation" section with prominent crosswalk link. Fixed the current-state-map relative path (was incorrect).

3. **Supersession notices on key files** — Readers who encounter `HB-Intel-Feature-Phase-Mapping-Recommendation.md` or `PH7-Estimating-Feature-Plan.md` now immediately see redirect notices pointing to current authoritative sources.

4. **Classification banners on all PH7 expansion plans** — Readers can immediately determine whether a document is active (Canonical Normative Plan), deferred (Deferred Scope), or historical — without needing to cross-reference the classification matrix.

5. **Review Mode deferred scope made explicit** — The Review Mode cluster (master plan + 9 task files) is now consistently marked Deferred Scope at both the master plan level and the task file level.

6. **MVP plans formally classified** — The 10 MVP plan files are now in the §2 matrix with proper Canonical Normative Plan classification and the reminder about the required refinement pass.

---

## Redirect Map

| Old Primary Source | Now Read For Current Truth | Preserved Notes Location |
|-------------------|---------------------------|--------------------------|
| `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | `current-state-map.md` (present truth); `PH7-Estimating-Features.md` / `PH7-BD-Features.md` / `PH7-ProjectHub-Features-Plan.md` (Phase 7 feature decisions); `MVP/MVP-Project-Setup-Plan.md` (next delivery wave) | `HB-Intel-Blueprint-Crosswalk.md §9.1` |
| `PH7-Estimating-Feature-Plan.md` (v1.0) | `PH7-Estimating-Features.md` (v2.0) + `ph7-estimating/` task files | `HB-Intel-Blueprint-Crosswalk.md §9.2` |
| Multiple overlapping summary docs | `HB-Intel-Blueprint-Crosswalk.md` (new unified navigation guide) | Within crosswalk itself |
| Future program-level summary | `HB-Intel-Unified-Blueprint.md` (not yet created) | `HB-Intel-Blueprint-Crosswalk.md §11` |

---

## Link Validation Summary

The following relative links were validated during this consolidation pass:

| Link | Source File | Status |
|------|-------------|--------|
| `./architecture/blueprint/current-state-map.md` | `docs/README.md` | Fixed — was `./architecture/current-state-map.md` |
| `./architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` | `docs/README.md` | New — valid path, file created |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md §9.1` | `HB-Intel-Feature-Phase-Mapping-Recommendation.md` | New redirect — valid |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md §9.2` | `PH7-Estimating-Feature-Plan.md` | New redirect — valid |
| `PH7-Estimating-Features.md` | `PH7-Estimating-Feature-Plan.md` | Redirect — valid path |
| `current-state-map.md §2` | `PH7-ReviewMode-Plan.md` | Valid |
| `current-state-map.md §2` | `PH9b-UX-Enhancement-Plan.md` | Valid |

**Note:** Full automated link-checking was not performed (no CI pipeline invoked in this pass). The links created and modified in this pass were manually validated to resolve to existing files. Future CI lint passes should validate all relative links in the docs corpus.

---

## Risks / Follow-Up Notes

### Before Generating HB-Intel-Unified-Blueprint.md

1. **PH7.12 gate confirmation:** Confirm PH7.12 acceptance criteria are fully satisfied and ADR-0090 exists on disk before using the unified blueprint to plan feature expansion work.

2. **MVP plan refinement pass:** The MVP Plan Review (2026-03-13) identified 4 categories of issues requiring correction before implementation. These must be resolved before any MVP coding agent begins work. The unified blueprint should reflect the corrected plan state.

3. **SF22 partial completion:** SF22 (post-bid learning loop) has T01–T07 defined; T08–T09 are not yet authored. The unified blueprint should note this boundary clearly.

4. **SF16 ADR-0105:** ADR-0105 is reserved for search but not yet authored. The unified blueprint should note this as pending.

5. **PH9b title inconsistency:** `PH9b-UX-Enhancement-Plan.md` carries the title "Phase 4 Development Plan" as a legacy artifact. Consider renaming the H1 in a future pass (requires comment-only update or a new phase plan that supersedes it).

6. **Scope of PH2/PH3 plans:** These plans were added to the §2 matrix but not deeply reviewed. They should be confirmed as Historical Foundational (complete) and given Tier 1 banners if any agent might misread them as active.

7. **Crosswalk living-document status:** `HB-Intel-Blueprint-Crosswalk.md` is a Canonical Current-State living document. It must be updated whenever new major plan families are created or the delivery status changes. After the unified blueprint is created, add a forward-link from the crosswalk to the unified blueprint per §11 instructions.

8. **ADR-0086 and ADR-0087 absence:** `current-state-map §2.2` shows ADR-0086 and ADR-0087 as conditional. The current-state-map §1 notes "111 active" ADRs. This was not investigated in depth during this consolidation pass; follow-up ADR catalog audit may be warranted before generating the unified blueprint.

---

_End of HB Intel Blueprint Consolidation Report_
_Consolidation pass completed: 2026-03-14_
_Crosswalk artifact: `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md`_
