# P3-F1: Reports Workspace / Definition / Run / Release Contract Package

| Field | Value |
|---|---|
| **Doc ID** | P3-F1 |
| **Phase** | Phase 3 |
| **Workstream** | F — Governed reporting system |
| **Document Type** | Contract |
| **Owner** | Project Hub platform owner + Architecture |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-21 |
| **References** | [Phase 3 Plan §8.7, §12.6, §14.6](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md); [P3-E2 §8](P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md); [P3-E3 §7](P3-E3-Spreadsheet-Document-Replacement-Reference-Note-Set.md); [P3-A3 §7](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-D1 §8.6](P3-D1-Project-Activity-Contract.md); [P3-D2 §11](P3-D2-Project-Health-Contract.md); [P3-D3 §12](P3-D3-Project-Work-Queue-Contract.md); [P3-D4 §9](P3-D4-Related-Items-Registry-Presentation-Contract.md); [P3-G1 §4.6](P3-G1-Lane-Capability-Matrix.md); [PH7-14](../../ph7-project-hub/PH7-ProjectHub-14-PXReview-OwnerReport.md) |

---

## Contract Statement

This contract defines the **governed reporting system** for Phase 3 Project Hub — a real reporting system, not two one-off report pages (Phase 3 plan §14.6). It specifies the report-definition registry, draft/snapshot model, generation pipeline, staleness handling, run-ledger, family-specific approval rules, and release/distribution lifecycle.

Phase 3 reporting uses a **governed report workspace** model (Phase 3 plan §8.7):

- A **hybrid report-definition model** with a central definition registry and module-supplied snapshots
- A **hybrid draft model** with saved narrative overrides plus refreshable live snapshots
- A **hybrid stale-draft model** that warns on staleness and binds final output to a confirmed snapshot
- A **queued governed generation model** with inline readiness/preview
- A **hybrid run-ledger** for run metadata, status, artifact references, and release/distribution state
- An **approval-governed publication/distribution model** with family-specific rules

Minimum governed report families for Phase 3: **PX Review** and **Owner Report**.

Report-family approval rules are explicitly different (Phase 3 plan §8.7):
- **PX Review requires explicit approval** before treated as approved/released.
- **Owner Report does not require a separate explicit approval gate** but still participates in governed run, export, storage, and distribution tracking.

**Repo-truth audit — 2026-03-21.** No production reporting implementation exists. PH7-14 (PX Review & Owner Report) provides detailed implementation specifications including API routes, auto-assembly logic, section layouts, and PDF generation requirements. PH7-14 is locked per ADR-0091 (Deferred Scope). P3-E3 §7 documents the manual report assembly workflow being replaced. No report-definition registry, run-ledger, or draft model exists. This is a **gap requiring new implementation**. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The report-definition registry (family registration, section definitions, module snapshot requirements)
- Report family specifications (PX Review, Owner Report)
- The draft and snapshot model (auto-assembly, narrative overrides, refresh, freeze)
- Staleness handling (thresholds, warnings, confirmed snapshots)
- The generation pipeline (readiness, preview, queued generation, artifact production)
- The run-ledger contract (run metadata, status lifecycle, artifact references)
- Family-specific approval rules (PX Review gated, Owner Report non-gated)
- Release and distribution lifecycle (release tracking, distribution state)
- Module snapshot consumption rules
- PM narrative override contract
- Spine publication requirements (Activity, Health, Work Queue, Related Items)
- Cross-lane reporting consistency

### This contract does NOT govern

- Module source data — Reports consumes snapshots, does not own source data (P3-E2 §8.3)
- Individual module implementations — governed by PH7 plans and P3-E1/E2
- Report canvas tile definition — see [P3-C2](P3-C2-Mandatory-Core-Tile-Family-Definition.md)
- Per-capability lane depth detail — see [P3-G1 §4.6](P3-G1-Lane-Capability-Matrix.md)
- PDF generation engine selection — implementation decision

---

## Definitions

| Term | Meaning |
|---|---|
| **Report family** | A named category of report with defined sections, module snapshot requirements, and approval rules (e.g., PX Review, Owner Report) |
| **Report definition** | A registered metadata record describing a report family's structure, required snapshots, and governance rules |
| **Report run** | A single execution of the report generation pipeline, producing a run-ledger entry and an artifact |
| **Draft** | The current working state of a report — auto-assembled from live module snapshots plus saved PM narrative overrides |
| **Snapshot** | The frozen state of module data captured at generation time — immutable once created |
| **Staleness** | The condition where a draft's module snapshot data has aged beyond the governed threshold |
| **Run ledger** | The history of all report generation runs with metadata, status, and artifact references |
| **Narrative override** | A PM-authored text override for a report section, preserved across draft refreshes |
| **Approval gate** | A governance step requiring explicit human approval before a report can be released (PX Review only) |
| **Release** | The governed act of making a generated report available for distribution |
| **Distribution** | The tracked delivery of a released report to recipients |
| **Report workspace** | The Project Hub surface where users interact with report families, drafts, generation, and history |

---

## 1. Current-State Reconciliation

| Artifact | Status | Relevance |
|---|---|---|
| Report-definition registry | **Gap** | Does not exist — new implementation required |
| Report draft/snapshot model | **Gap** | Does not exist — new implementation required |
| Report run-ledger | **Gap** | Does not exist — new implementation required |
| Report generation pipeline | **Gap** | Does not exist — new implementation required |
| PH7-14 (PX Review & Owner Report) | **Locked** — ADR-0091 (Deferred Scope) | Detailed implementation specs: API routes, auto-assembly logic, section layouts, PDF generation |
| P3-E3 §7 replacement notes | **Locked** | Documents the manual assembly workflow being replaced |
| P3-E1 §3.6 / §6.2 classification | **Locked** | Reports classified as governed report workspace |
| P3-E2 §8 source-of-truth | **Locked** | Reports owns lifecycle, consumes module snapshots |
| Spine publication requirements | **Locked** | P3-A3 §7 + P3-D1 §8.6 + P3-D2 §11 + P3-D3 §12 + P3-D4 §9 |

**Classification:** No reporting implementation exists. All governing contracts are locked. This is a **gap requiring new implementation** with PH7-14 providing implementation-ready specifications.

---

## 2. Report-Definition Registry

### 2.1 Registry pattern

The report-definition registry holds the canonical set of report family definitions. It is extensible — new families can be registered beyond the Phase 3 minimum.

### 2.2 Report definition shape

Each registered report definition carries:

| Field | Type | Description |
|---|---|---|
| `familyKey` | `string` | Unique family identifier (e.g., `'px-review'`, `'owner-report'`) |
| `label` | `string` | Human-readable family name |
| `description` | `string` | Family purpose description |
| `requiredModuleSnapshots` | `string[]` | Module keys whose snapshots are required for generation |
| `approvalGated` | `boolean` | Whether explicit approval is required before release |
| `sections` | `IReportSectionDefinition[]` | Ordered array of section definitions |
| `defaultSchedule` | `string \| null` | Default generation cadence (e.g., `'monthly'`) |

### 2.3 Section definition shape

Each section within a report definition:

| Field | Type | Description |
|---|---|---|
| `sectionKey` | `string` | Unique section identifier within the family |
| `label` | `string` | Section heading |
| `sourceModuleKey` | `string` | Module providing the snapshot data for this section |
| `narrativeOverridable` | `boolean` | Whether PM can override the auto-assembled text |
| `order` | `number` | Display order |

### 2.4 Phase 3 minimum families

The registry MUST contain at least two families at Phase 3 delivery: `px-review` and `owner-report`.

---

## 3. Report Family Specifications

### 3.1 PX Review

| Property | Value |
|---|---|
| **Family key** | `px-review` |
| **Purpose** | Internal project review package prepared by PM and Project Executive |
| **Approval** | **Gated** — requires explicit approval before release |
| **Audience** | Internal project team, executive review |
| **Schedule** | Monthly (default) |

**Sections:**

| # | Section | Source module | Narrative overridable |
|---|---|---|---|
| 1 | Schedule Status | Schedule | Yes |
| 2 | Financial Status | Financial | Yes |
| 3 | Safety | Safety | Yes |
| 4 | Buyout Status | Financial (Buyout) | Yes |
| 5 | Constraints & Delays | Constraints | Yes |
| 6 | Executive Summary | Cross-module (PM-authored) | Yes |
| 7 | Look Ahead | Cross-module (PM-authored) | Yes |

**Required module snapshots:** Financial, Schedule, Safety, Constraints, Permits, Health

### 3.2 Owner Report

| Property | Value |
|---|---|
| **Family key** | `owner-report` |
| **Purpose** | External owner-facing project status report |
| **Approval** | **Not gated** — governed run/export/release without explicit approval step |
| **Audience** | Project owner, external stakeholders |
| **Schedule** | Monthly (default) |

**Sections:**

| # | Section | Source module | Narrative overridable |
|---|---|---|---|
| 1 | Project Overview | Cross-module | Yes |
| 2 | Schedule Summary | Schedule | Yes |
| 3 | Financial Summary | Financial | Yes |
| 4 | Safety Summary | Safety | Yes |
| 5 | Key Issues & Risks | Constraints + Health | Yes |
| 6 | Look Ahead | Cross-module (PM-authored) | Yes |

**Required module snapshots:** Financial, Schedule, Safety, Constraints, Health

---

## 4. Draft and Snapshot Model

### 4.1 Draft lifecycle

```
Auto-Assembly → Draft State → [Refresh] → [PM Narrative Edit] → [Confirm] → Snapshot → Generation
```

| Stage | Description |
|---|---|
| **Auto-assembly** | System pulls latest data from required module snapshots and assembles a draft |
| **Draft state** | Working state combining auto-assembled module data + PM narrative overrides |
| **Refresh** | Pull latest module snapshot data; preserve PM narrative overrides |
| **PM narrative edit** | PM edits narrative sections; overrides carry provenance |
| **Confirm** | PM confirms the draft for generation; triggers snapshot freeze |
| **Snapshot** | Frozen state of module data at confirmation time; immutable |

### 4.2 Draft ownership

Draft state is owned by Reports (P3-E2 §8.1). Module snapshot data within the draft is read-only — PM can override narratives but not source data.

### 4.3 Draft refresh rules

- Refresh pulls the latest data from each required module's spine.
- PM narrative overrides are preserved across refreshes.
- Refresh updates `lastRefreshedAt` timestamp.
- Only the auto-assembled sections are refreshed; PM overrides are untouched.

### 4.4 Snapshot immutability

Once a draft is confirmed for generation, the module data is frozen as a snapshot. The snapshot MUST NOT be modified after creation. If module data changes after snapshot creation, a new draft refresh + confirm cycle is required.

---

## 5. Staleness Handling

### 5.1 Staleness detection

A draft is **stale** when the time since `lastRefreshedAt` exceeds the governed staleness threshold.

### 5.2 Staleness rules

| Rule | Behavior |
|---|---|
| **Staleness warning** | UI shows a stale-draft cue when the draft exceeds the staleness threshold |
| **Pre-export gate** | Stale drafts MUST show a staleness warning before export is permitted |
| **Snapshot binding** | Final output is bound to a specific confirmed draft snapshot — not to live data |
| **Activity event** | Staleness triggers `reports.stale-warning` activity event (P3-D1 §8.6) |
| **Work Queue item** | Stale drafts generate a "Report draft stale" work item (P3-D3 §12) |

### 5.3 Staleness threshold

The staleness threshold is configurable per report family. Default: 7 days since last refresh.

---

## 6. Generation Pipeline

### 6.1 Pipeline stages

```
Readiness Check → Inline Preview → Queued Generation → Artifact Production → Storage → Run-Ledger Entry
```

| Stage | Description |
|---|---|
| **Readiness check** | Verify all required module snapshots are available and the draft is confirmed |
| **Inline preview** | User can preview the report before committing to generation |
| **Queued generation** | Generation request is queued for asynchronous processing |
| **Artifact production** | PDF artifact generated from the confirmed snapshot (backend process) |
| **Storage** | PDF stored in governed SharePoint document library (`/Shared Documents/Reports/`) |
| **Run-ledger entry** | Run metadata recorded in the run ledger |

### 6.2 Generation rules

- Generation is **asynchronous** — the user does not wait for PDF production.
- Generation requires a confirmed (non-stale) snapshot.
- Each generation produces exactly one run-ledger entry.
- Artifact URL is recorded in the run-ledger entry upon completion.
- Generation failure is recorded in the run-ledger with error status.

---

## 7. Run-Ledger Contract

### 7.1 Run-ledger entry shape

| Field | Type | Description |
|---|---|---|
| `runId` | `string` (UUID) | Unique run identifier |
| `familyKey` | `string` | Report family key |
| `projectId` | `string` | Project identity from P3-A1 registry |
| `generatedAt` | `string` (ISO 8601) | When generation was triggered |
| `generatedBy` | `string` | UPN of the user who triggered generation |
| `snapshotVersion` | `string` | Identifier of the frozen snapshot used |
| `artifactUrl` | `string \| null` | URL of the generated PDF artifact (null if generation in progress or failed) |
| `status` | `ReportRunStatus` | Current run status |
| `approvalMetadata` | `IReportApproval \| null` | Approval details (PX Review only) |
| `releaseMetadata` | `IReportRelease \| null` | Release and distribution details |
| `error` | `string \| null` | Error message if generation failed |

### 7.2 Run status lifecycle

```typescript
type ReportRunStatus = 'queued' | 'generating' | 'generated' | 'approved' | 'released' | 'archived' | 'failed';
```

| Status | Meaning |
|---|---|
| `queued` | Generation request submitted, waiting for processing |
| `generating` | PDF production in progress |
| `generated` | PDF produced successfully; awaiting approval (if gated) or release |
| `approved` | PX Review only — explicit approval received |
| `released` | Report released for distribution |
| `archived` | Report archived (superseded by newer run) |
| `failed` | Generation failed; error recorded |

### 7.3 Status transitions

```
queued → generating → generated → approved (PX Review) → released → archived
queued → generating → generated → released (Owner Report, no approval) → archived
queued → generating → failed
```

### 7.4 Run-ledger query

Run history is queryable by `projectId`, `familyKey`, `status`, and date range. Results are ordered by `generatedAt` descending.

---

## 8. Approval Model

### 8.1 PX Review approval

| Aspect | Rule |
|---|---|
| **Gate** | Explicit approval required before release |
| **Approver** | Project Executive or designated approver |
| **Approval metadata** | Approver UPN, timestamp, optional comments |
| **Transition** | `generated` → `approved` → `released` |
| **Activity event** | `reports.approved` (notable, P3-D1 §8.6) |
| **Work Queue item** | "Report approval pending" while in `generated` status |

### 8.2 Owner Report (no approval gate)

| Aspect | Rule |
|---|---|
| **Gate** | No separate explicit approval step |
| **Transition** | `generated` → `released` |
| **Governance** | Still participates in governed run, export, storage, and distribution tracking |
| **Activity event** | `reports.released` (notable, P3-D1 §8.6) — no `reports.approved` event |

### 8.3 Approval shape

```typescript
interface IReportApproval {
  approvedBy: string;       // UPN of the approver
  approvedAt: string;       // ISO 8601 timestamp
  comments?: string | null; // Optional approval comments
}
```

### 8.4 Approval rules

- Approval is a **report-level** action, not a section-level action.
- Only reports in `generated` status can be approved.
- Approval is irreversible — once approved, the status cannot revert to `generated`.
- The `approvalGated` flag on the report definition determines whether approval is required.

---

## 9. Release and Distribution Lifecycle

### 9.1 Release model

```
generated → [approved] → released → distributed
```

| State | Description |
|---|---|
| **Released** | Report is available for distribution; release timestamp and actor recorded |
| **Distributed** | Report has been delivered to recipients; distribution metadata tracked |

### 9.2 Release shape

```typescript
interface IReportRelease {
  releasedBy: string;              // UPN of the person who released
  releasedAt: string;              // ISO 8601 timestamp
  distributionRecipients?: string[]; // UPNs of recipients
  distributionChannel?: string;    // Channel (email, SharePoint, etc.)
  distributedAt?: string | null;   // When distribution was completed
}
```

### 9.3 Export and storage

- Export produces a **PDF artifact** stored in the project's governed SharePoint document library.
- Artifact URL is recorded in the run-ledger entry.
- Storage location follows project document governance conventions.

### 9.4 Activity events

- `reports.released` is published as a `notable` activity event (P3-D1 §8.6).
- Work Queue item "Report distribution pending" may be generated for the distribution step.

---

## 10. Module Snapshot Consumption

Reports consumes module data at generation time via spine queries (P3-E2 §8.2). Reports does NOT own module data — it captures a read-only snapshot.

### 10.1 Source module matrix

| Source module | Data consumed | Spine |
|---|---|---|
| Financial | Forecast summary, exposure level, checklist status, Buyout status | Financial module data |
| Schedule | Milestone status, schedule variance, projections | Schedule module data |
| Constraints | Open/overdue counts, delay impact, Change Tracking summary | Constraints module data |
| Permits | Permit status summary, expiration risk | Permits module data |
| Safety | Incident summary, compliance metrics, checklist status | Safety module data |
| Health | Overall status, dimension scores, compound risks, triage | Health spine (P3-D2) |

### 10.2 Snapshot rules

- Snapshots are captured at draft confirmation time, not at generation time.
- Each snapshot is versioned and immutable.
- If a required module snapshot is unavailable, the readiness check blocks generation.
- Reports may include a "data unavailable" indicator for optional module sections.

---

## 11. PM Narrative Override Contract

### 11.1 Override rules

| Rule | Description |
|---|---|
| **Scope** | Per-section text overrides only |
| **Provenance** | Every override carries PM identity and timestamp (P3-E2 §12.3) |
| **Preservation** | Overrides are preserved across draft refreshes |
| **Module data** | Module snapshot data is NOT overridable through Reports |
| **Authority** | Reports module owns narrative draft state |

### 11.2 Override boundary

Narrative is the **only user-editable content** in a report. Module snapshot data (financial numbers, schedule dates, constraint counts, safety metrics) is read-only within the Reports workspace. PMs provide context and interpretation through narrative; they do not alter source data.

---

## 12. Spine Publication Requirements

Reports publishes to all 4 spines per P3-A3 §7:

### 12.1 Activity spine (P3-D1 §8.6)

| Event type | Category | Significance | Trigger |
|---|---|---|---|
| `reports.draft-refreshed` | `record-change` | `routine` | Report draft refreshed with live data |
| `reports.approved` | `approval` | `notable` | PX Review approved |
| `reports.released` | `handoff` | `notable` | Report released for distribution |
| `reports.stale-warning` | `alert` | `notable` | Report draft is stale |

### 12.2 Health spine (P3-D2 §11)

| Metric | Health dimension | Description |
|---|---|---|
| Report currency | Office | Days since last approved PX Review / Owner Report |

### 12.3 Work Queue spine (P3-D3 §12)

| Work item | Trigger |
|---|---|
| Report draft stale | Draft staleness threshold exceeded |
| Report approval pending | PX Review in `generated` status awaiting approval |
| Report distribution pending | Released report awaiting distribution |

### 12.4 Related Items spine (P3-D4 §9)

| Relationship | Direction | Description |
|---|---|---|
| `report-run` → `module-snapshot` | `references` | Report run references the module snapshots it consumed |

---

## 13. Cross-Lane Consistency

### 13.1 MUST be identical

| Aspect | Rule |
|---|---|
| Report definitions | Same registry in both lanes |
| Run-ledger | Same run history in both lanes |
| Draft model | Same snapshot/narrative model |
| Approval rules | Same family-specific gates |
| Release lifecycle | Same governed release model |

### 13.2 Lane-specific depth

| Capability | PWA | SPFx |
|---|---|---|
| Report list and status | **Required** | **Required** |
| Generate / queue report run | **Required** | **Required** |
| View report output / preview | **Required** | **Required** |
| PM narrative editing | **Required** — full draft editing | **Broad** — basic editing supported |
| Draft refresh and staleness | **Required** — full staleness handling | **Broad** — staleness warnings shown |
| Run-ledger history browsing | **Required** — rich timeline and comparison | **Launch-to-PWA** — deep history in PWA |
| Export | **Required** | **Required** |
| Approval (PX Review) | **Required** | **Required** |
| Release / distribution | **Required** — full release workflow | **Broad** — view status; release action supported |

---

## 14. Repo-Truth Reconciliation Notes

1. **Report-definition registry — gap**
   No registry exists. Phase 3 must implement the report-definition registry with PX Review and Owner Report families. Classified as **gap — new implementation required**.

2. **Report draft/snapshot model — gap**
   No draft or snapshot model exists. Phase 3 must implement the hybrid draft model with auto-assembly, narrative overrides, refresh, and snapshot freeze. Classified as **gap — new implementation required**.

3. **Report run-ledger — gap**
   No run-ledger exists. Phase 3 must implement run tracking with status lifecycle, artifact references, and approval/release metadata. Classified as **gap — new implementation required**.

4. **Report generation pipeline — gap**
   No generation pipeline exists. Phase 3 must implement queued generation with readiness check, preview, PDF production, and SharePoint storage. Classified as **gap — new implementation required**.

5. **PH7-14 — implementation-ready**
   PH7-14 provides detailed implementation specifications including API routes (`GET/PUT/POST` for draft, overrides, export), auto-assembly logic, section layouts, and PDF generation requirements. Locked per ADR-0091 (Deferred Scope). Classified as **implementation-ready — deferred scope**.

6. **Spine publication requirements — locked**
   Activity (P3-D1 §8.6), Health (P3-D2 §11), Work Queue (P3-D3 §12), and Related Items (P3-D4 §9) contracts define Reports publication obligations. All contracts are locked. Classified as **compliant**.

7. **Replacement workflow — documented**
   P3-E3 §7 documents the manual report assembly workflow being replaced. Classified as **compliant**.

---

## 15. Acceptance Gate Reference

**Gate:** Reporting gates (Phase 3 plan §18.6)

| Field | Value |
|---|---|
| **Pass condition** | PX Review and Owner Report are live as governed report families. Draft refresh, staleness warning, queued generation, run tracking, and history work. PX Review explicit approval and Owner Report governed non-approval-gated release behavior are implemented correctly. |
| **Evidence required** | P3-F1 (this document), report-definition registry with 2 families, draft/snapshot model functional, staleness handling operational, generation pipeline producing PDF artifacts, run-ledger tracking all runs, PX Review approval gate enforced, Owner Report non-gated release working, spine publication flowing |
| **Primary owner** | Project Hub platform owner + Architecture |

---

## 16. Policy Precedence

This contract establishes the **governed reporting system specification** that implementation must satisfy:

| Deliverable | Relationship to P3-F1 |
|---|---|
| **Phase 3 Plan §8.7, §12.6** | Provides the reporting model and module boundary that this contract codifies |
| **PH7-14** — PX Review & Owner Report | Provides detailed implementation specifications that this contract governs |
| **P3-E1** — Module Classification Matrix | Classifies Reports as governed report workspace (§3.6, §6.2) |
| **P3-E2 §8** — Reports Source-of-Truth | Defines Reports ownership (lifecycle) vs. consumption (module snapshots) |
| **P3-E3 §7** — Reports Replacement Notes | Documents the manual workflow being replaced |
| **P3-A3 §7** — Module Publication Matrix | Defines spine publication requirements (all 4 spines) |
| **P3-D1 §8.6** — Activity Events | Defines Reports activity event types |
| **P3-D2 §11** — Health Metrics | Defines Reports health metric contribution (Office — report currency) |
| **P3-D3 §12** — Work Queue Items | Defines Reports work item types (stale, approval pending, distribution pending) |
| **P3-D4 §9** — Related Items | Defines Reports relationship registrations (report-run → module-snapshot) |
| **P3-G1 §4.6** — Lane Depth | Defines PWA vs. SPFx reporting depth |
| **P3-H1** — Acceptance Checklist | Must include reporting gate evidence |

If a downstream deliverable conflicts with this contract, this contract takes precedence for reporting system behavior unless the Architecture lead approves a documented exception.

---

**Last Updated:** 2026-03-21
**Governing Authority:** [Phase 3 Plan §8.7, §12.6](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
