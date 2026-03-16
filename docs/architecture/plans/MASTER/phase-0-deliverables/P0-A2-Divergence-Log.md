# P0-A2 Divergence Log

**Doc Classification:** Canonical Normative Plan — Workstream A divergence log; records all identified gaps between planning documents, ADRs, and live repo state as of Phase 0 execution (2026-03-16).

---

## 1. Purpose

This log records all identified divergences between architectural planning documents, ADR statements, and the live repository state. Each item is classified and given a resolution disposition. The log serves as the authoritative inventory of known gaps between plan and present reality, enabling informed Phase 1 entry and reducing assumption-based errors.

---

## 2. Divergence Classification Rubric

| Class | Meaning | Action Required |
|-------|---------|-----------------|
| **(a) Controlled evolution** | Intentional, documented evolution beyond Blueprint V4 | Record and confirm; no correction needed |
| **(b) Not-yet-implemented** | Planned in docs but not built yet | Track in Phase 1 entry checklist or decision register |
| **(c) Superseded** | Replaced by a newer decision or approach | Mark stale documents; consider errata or archive |

---

## 3. Active Divergences

### D-001: Shared-Feature Primitive layer emergence

| Field | Value |
|-------|-------|
| **Area** | Architecture — Package Structure |
| **Description** | Blueprint V4 described core platform packages and feature modules, but did not anticipate the "middle layer" of 20+ shared-feature primitives (SF01–SF29). These packages emerged organically (SF01–SF03) and were then planned deliberately (SF04–SF29). |
| **Classification** | **(a) Controlled evolution** |
| **Resolution** | Explicitly documented in `current-state-map.md` §4.1. Designated Tier-1 Platform Primitives per PH7.4. No correction required. This evolution strengthened package hygiene and dependency clarity. |

---

### D-002: Feature package materialization as `packages/features/*`

| Field | Value |
|-------|-------|
| **Area** | Architecture — Package Structure |
| **Description** | Blueprint V4 described feature modules conceptually. The repo implements them as `packages/features/*` with individual `package.json`, TypeScript path aliases, and source-based exports. |
| **Classification** | **(a) Controlled evolution** |
| **Resolution** | Documented in `current-state-map.md` §4.2. No correction required. This structure enables strong boundary enforcement and independent CI/test scoping. |

---

### D-003: Workspace scope expansion

| Field | Value |
|-------|-------|
| **Area** | Architecture — Workspace Structure |
| **Description** | Original workspace covered `packages/*` and `apps/*`. It now includes `backend/*` (Azure Functions), `tools/*` (monorepo build/governance tooling), and `packages/features/*`. |
| **Classification** | **(a) Controlled evolution** |
| **Resolution** | Documented in `current-state-map.md` §4.3. No correction required. Expansion reflects intentional multi-runtime support. |

---

### D-004: ADR-0090 gate reference in Wave 0 plans (stale cross-reference)

| Field | Value |
|-------|-------|
| **Area** | Governance — ADR References |
| **Description** | Wave 0 Group plans G1–G6 each state "ADR-0090 required before implementation." However, ADR-0090 on disk is `ADR-0090-signalr-per-project-groups.md` (a PH6 SignalR decision). The actual Phase 7 Final Verification and Sign-Off ADR is ADR-0091. The v1.1 validation correction applied to `HB-Intel-Wave-0-Buildout-Plan.md` inadvertently pointed to the wrong ADR number. ADR-0091 exists on disk and Phase 7 signed off 2026-03-09, meaning the gate condition is **already satisfied** — but the Wave 0 plan documents contain a stale cross-reference. |
| **Classification** | **(c) Superseded / stale reference** |
| **Resolution** | ✅ RESOLVED (2026-03-16). The gate condition is satisfied — ADR-0091 (`ADR-0091-phase-7-final-verification.md`) exists on disk, Phase 7 signed off 2026-03-09. All Phase 7 gate references in Wave 0 MVP plan files corrected from ADR-0090 to ADR-0091 (HB-Intel-Wave-0-Buildout-Plan.md, G1–G4 group plans, W0-Completion-Plan.md, project-setup plans — 42 occurrences across 20+ files). Errata note added to wave-0-validation-report.md. See branch fix/p0-d004-adr-gate-references. |

---

### D-005: Wave 0 plan formal approval not yet issued

| Field | Value |
|-------|-------|
| **Area** | Governance — Plan Approval |
| **Description** | `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` v1.1 header states "Status: Proposed — awaiting review." Phase 0 has discovered that Wave 0 surface work (G4 and G5 T01–T08) is already built and recorded as `Canonical Current-State` in `current-state-map.md`. The plan's formal approval status has not caught up with the implementation work that was completed. |
| **Classification** | **(c) Superseded — plan status is stale relative to actual implementation state** |
| **Resolution** | The Wave 0 plan must be formally approved/signed-off by product owner and architecture owner. The plan header should be updated to "Approved" and individual group plans should record "Implementation complete" where that is true. **Action owner:** Product owner + architecture lead. **Blocker:** Yes — Phase 1 entry gate item. |

---

### D-006: PH7-RM-* Deferred Scope plans (9 files) not yet reclassified

| Field | Value |
|-------|-------|
| **Area** | Planning — Document Classification |
| **Description** | Nine Review Mode plans (`PH7-RM-1` through `PH7-RM-9`) are classified as "Deferred Scope" per `current-state-map.md` §2.1. Per the transition rule, these must be reclassified to "Canonical Normative Plan" when entering active development, or formally archived if out of scope. No reclassification decision has been made. |
| **Classification** | **(b) Not-yet-implemented** |
| **Resolution** | Decision pending — tracked in P0-E2 OD-006. Recommendation: Assign PH7-RM-1 through PH7-RM-9 (review-mode feature suite) to Phase 3 (Project Hub and Project Context) milestone. Classification would change from "Deferred Scope" to "Canonical Normative Plan" upon Phase 3 scope confirmation. PH7-RM-* banners updated (2026-03-16) to reflect PH7.12 completion and pending Phase assignment. Pending product owner + delivery lead approval per OD-006. |

---

### D-007: SF16 (Search) and SF22 (post-bid-autopsy T08–T09) pending activation

| Field | Value |
|-------|-------|
| **Area** | Planning — Document Classification |
| **Description** | SF16 (`@hbc/search`, Azure Cognitive Search integration) has an ADR number reserved (ADR-0105) and plans marked as Canonical Normative Plan, but has not entered active development. `@hbc/post-bid-autopsy` (SF22) T01–T07 are complete but T08–T09 remain unbuilt. |
| **Classification** | **(b) Not-yet-implemented** |
| **Resolution** | Phase 1 entry checklist must explicitly decide whether either enters Phase 1 scope. Deferred scope candidates; track in Open Decisions Register (P0-E2). **Decision owner:** Product owner. **Deadline:** Phase 0 exit gate. |

---

### D-008: `HB-Intel-Feature-Phase-Mapping-Recommendation.md` is superseded

| Field | Value |
|-------|-------|
| **Area** | Planning — Document Classification |
| **Description** | This document (at `docs/architecture/plans/`) is an early phase mapping recommendation that has been superseded by the full MASTER plan set and active PH7 plans. It is not classified in the `current-state-map.md` matrix. |
| **Classification** | **(c) Superseded / Archived Reference** |
| **Resolution** | ✅ RESOLVED (pre-2026-03-16). Classification banner already applied to `docs/architecture/plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md`: "Superseded / Archived Reference — pre-Phase-6 feature placement recommendation." Status: SUPERSEDED (2026-03-14). No further action required. |

---

### D-009: Several feature packages and SPFx apps at v0.0.0 (scaffold-only)

| Field | Value |
|-------|-------|
| **Area** | Implementation — Package Maturity |
| **Description** | Six feature packages (`features-accounting`, `features-leadership`, `features-safety`, `features-quality-control-warranty`, `features-risk-management`, `features-operational-excellence`, `features-human-resources`) and their corresponding SPFx apps are at v0.0.0. Their presence in the inventory might be interpreted as "functional" by future contributors without checking version/maturity. |
| **Classification** | **(b) Not-yet-implemented** |
| **Resolution** | Explicitly classified as `scaffold-only` in P0-B1 Production Readiness Matrix. No code correction required; classification prevents false-baseline assumptions. Ensure developers reference the readiness matrix before assuming feature availability. **Owner:** Architecture documentation lead. |

---

### D-010: `@hbc/versioned-record` and `@hbc/strategic-intelligence` are scaffold-only but depended on by production-path packages

| Field | Value |
|-------|-------|
| **Area** | Implementation — Dependency Readiness |
| **Description** | `@hbc/versioned-record` (v0.0.1) and `@hbc/strategic-intelligence` (v0.0.1) are both scaffold-only primitives. However, they are listed as dependencies of `@hbc/post-bid-autopsy`, `@hbc/score-benchmark`, and `@hbc/ai-assist` — all of which have production-facing plans. Using these packages in production flows before they are upgraded would violate the production path restrictions. |
| **Classification** | **(b) Not-yet-implemented** |
| **Resolution** | Add to Phase 1 entry blockers and Open Decisions Register (P0-E2). **Gating rule:** Production use of dependent packages must be blocked until `versioned-record` and `strategic-intelligence` are upgraded from scaffold-only status. **Owner:** Architecture lead + dependent package owners. **Deadline:** Phase 1 entry gate. |

---

## 4. Resolved Divergences (Historical)

The following divergences were identified and resolved during Phase 7 or prior, included here for completeness:

| Divergence | Resolution | Date |
|------------|-----------|------|
| ADR catalog filesystem vs. index discrepancy (93 ADR files vs. 74 index entries) | Resolved via PH7.11 ADR reconciliation and indexing | 2026-03-09 |
| Duplicate-numbered ADR pairs (4 pairs: ADR-0013, ADR-0053, ADR-0054, ADR-0055) | Resolved via PH7.11 ADR deduplication | 2026-03-09 |
| Un-prefixed PH6 ADRs (5 files with non-standard naming) | Resolved via PH7.11 ADR catalog hygiene | 2026-03-09 |
| ADR index gap (ADR-0073–ADR-0079 and ADR-0082 missing from `docs/README.md`) | Resolved via PH7.11 index rebuild and cross-check | 2026-03-09 |

---

## 5. Summary Counts

| Classification | Count | Notes |
|----------------|-------|-------|
| **(a) Controlled evolution** — no action | 3 | Known and intentional divergences; documented |
| **(b) Not-yet-implemented** — track in Phase 1 or decisions register | 4 | Planned work not yet built; requires Phase 1 scope decision |
| **(c) Superseded / stale** — correction action required | 1 | D-005 remains open; D-004, D-008 resolved 2026-03-16 |
| **Total active divergences** | **8** | — |
| **Phase 0 resolved** | **2** | D-004 (ADR-0090 gate refs), D-008 (Feature-Phase-Mapping already classified) |
| **Pre-Phase-0 resolved** | **4** | Historical resolution record from Phase 7 |

---

## 6. Next Steps

- **High-priority corrections (blockers):** D-005, D-010 must be resolved before Phase 1 entry gate sign-off.
- **Open decisions:** D-006, D-007 require explicit decision within Phase 0 exit governance (P0-E2 Open Decisions Register).
- **Awareness / classification:** D-009 requires developer documentation and tooling guidance to prevent misinterpretation.

---

**Document owner:** Program architecture lead
**Last updated:** 2026-03-16
**Status:** Phase 0 Canonical Normative Plan
**Related documents:** `current-state-map.md`, `01_Phase-0_Program-Control-and-Repo-Truth-Plan.md`, P0-E2 Open Decisions Register
