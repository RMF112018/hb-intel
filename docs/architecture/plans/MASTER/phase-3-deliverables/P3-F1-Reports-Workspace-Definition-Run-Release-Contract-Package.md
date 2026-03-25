# P3-F1: Reports Workspace / Definition / Run / Release Contract Package

| Field | Value |
|---|---|
| **Doc ID** | P3-F1 |
| **Phase** | Phase 3 |
| **Workstream** | F — Governed reporting system |
| **Document Type** | Contract |
| **Owner** | Project Hub platform owner + Architecture |
| **Update Authority** | Architecture lead; changes require review by Experience lead and Project Hub platform owner |
| **Last Reviewed Against Repo Truth** | 2026-03-25 |
| **References** | [Phase 3 Plan §8.7, §12.6, §14.6](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md); [P3-E1](P3-E1-Phase-3-Module-Classification-Matrix.md); [P3-E2 §8](P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md); [P3-E3 §7](P3-E3-Spreadsheet-Document-Replacement-Reference-Note-Set.md); [P3-A3 §7](P3-A3-Shared-Spine-Publication-Contract-Set.md); [P3-D1 §8.6](P3-D1-Project-Activity-Contract.md); [P3-D2 §11](P3-D2-Project-Health-Contract.md); [P3-D3 §12](P3-D3-Project-Work-Queue-Contract.md); [P3-D4 §9](P3-D4-Related-Items-Registry-Presentation-Contract.md); [P3-G1 §4.6](P3-G1-Lane-Capability-Matrix.md); [PH7-14](../../ph7-project-hub/PH7-ProjectHub-14-PXReview-OwnerReport.md) |
| **Field-level specification** | [P3-E9 — Reports Module Field Specification](P3-E9-Reports-Module-Field-Specification.md) *(master index + T01–T10)* — governs template library architecture, project registration model, draft/active config version model, section source model, sub-scorecard/lessons-learned ingestion from P3-E10 (PE-approved snapshot; precondition: `publicationStatus ≥ PE_APPROVED`), PER review boundaries, lane depth, spine publication contracts, and acceptance gate |

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

Reports is also a major downstream consumer of the native integration backbone. Financial, schedule, workforce-aware, and document-aware report content must arrive through source-module snapshots or governed published read models aligned to [P1-F5](../phase-1-deliverables/P1-F5-Procore-Connector-Family.md), [P1-F6](../phase-1-deliverables/P1-F6-Sage-Intacct-Connector-Family.md), [P1-F7](../phase-1-deliverables/P1-F7-BambooHR-Connector-Family.md), [P1-F12](../phase-1-deliverables/P1-F12-Microsoft-365-Graph-Content-Connector-Family.md), and [P1-F14](../phase-1-deliverables/P1-F14-Oracle-Primavera-Connector-Family.md). Reports does not consume raw connector layers directly.

Minimum governed report families for Phase 3: **PX Review** and **Owner Report**.

Report-family approval rules are explicitly different (Phase 3 plan §8.7):
- **PX Review requires explicit approval** before treated as approved/released.
- **Owner Report does not require a separate explicit approval gate** but still participates in governed run, export, storage, and distribution tracking.

**Repo-truth audit — 2026-03-25.** No full production reporting implementation exists. PH7-14 (PX Review & Owner Report) provides detailed implementation specifications including API routes, auto-assembly logic, section layouts, and PDF generation requirements. PH7-14 is locked per ADR-0091 (Deferred Scope). P3-E3 §7 documents the manual report assembly workflow being replaced. A baseline report catalog and source-readiness seam now exists in `@hbc/features-project-hub` and is surfaced at `/project-hub/{projectId}/reports`, but no report-definition registry, run-ledger, draft model, generation pipeline, or release workflow exists yet. This remains a **gap requiring new implementation**. See §1 for full reconciliation.

---

## Contract Scope

### This contract governs

- The report-definition registry (family registration, section definitions, module snapshot requirements)
- Report family specifications (PX Review, Owner Report)
- The draft and snapshot model (auto-assembly, narrative overrides, refresh, freeze)
- Staleness handling (thresholds, warnings, confirmed snapshots)
- The generation pipeline (readiness, preview, queued generation, artifact production)
- The run-ledger contract (run metadata, status lifecycle, artifact references, run type)
- Family-specific approval rules (PX Review gated, Owner Report non-gated)
- Release and distribution lifecycle (release tracking, distribution state)
- Module snapshot consumption rules
- PM narrative override contract
- **Portfolio Executive Reviewer report permissions** (what PER may and may not do in the reporting system)
- **Reviewer-generated review runs** (PER-initiated runs against confirmed PM snapshots)
- **Central project-governance policy record** (global and project-level report-family approval/release policy; Reports enforces, does not own)
- **PM↔PE internal review chain** (optional project-level governance step; PX Review cannot bypass when configured)
- Spine publication requirements (Activity, Health, Work Queue, Related Items)
- Cross-lane reporting consistency

### This contract does NOT govern

- Module source data — Reports consumes snapshots, does not own source data (P3-E2 §8.3)
- Individual module implementations — governed by PH7 plans and P3-E1/E2
- Report canvas tile definition — see [P3-C2](P3-C2-Mandatory-Core-Tile-Family-Definition.md)
- Per-capability lane depth detail — see [P3-G1 §4.6](P3-G1-Lane-Capability-Matrix.md)
- PDF generation engine selection — implementation decision
- PER posture and scope eligibility — governed by [P3-A2 §3.2](P3-A2-Membership-Role-Authority-Contract.md)

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
| **Project-governance policy record** | The authoritative governance record owning report-family approval and release policy for a project; Reports module enforces this policy but does not own it |
| **Internal review chain** | An optional PM↔PE governance step, configurable at project level, that must complete before PX Review (or release) may proceed |
| **Reviewer-generated review run** | A report run initiated by a Portfolio Executive Reviewer, using only the latest already-confirmed PM-owned snapshot; tagged as `reviewer-generated` in the run ledger |
| **PER report posture** | The Portfolio Executive Reviewer's permissions in the reporting system: view, annotate (review layer only), and generate reviewer-generated runs; no authority over PM draft state |

---

## 1. Current-State Reconciliation

| Artifact | Status | Relevance |
|---|---|---|
| Report-definition registry | **Gap** | Does not exist — new implementation required |
| Report draft/snapshot model | **Gap** | Does not exist — new implementation required |
| Report run-ledger | **Gap** | Does not exist — new implementation required |
| Report generation pipeline | **Gap** | Does not exist — new implementation required |
| Baseline report catalog / source-readiness surface | **Implemented** | `@hbc/features-project-hub/src/reports` and `/project-hub/{projectId}/reports` expose the baseline catalog and module-readiness matrix; informational only, not a full Reports workspace |
| PH7-14 (PX Review & Owner Report) | **Locked** — ADR-0091 (Deferred Scope) | Detailed implementation specs: API routes, auto-assembly logic, section layouts, PDF generation |
| P3-E3 §7 replacement notes | **Locked** | Documents the manual assembly workflow being replaced |
| P3-E1 §3.6 / §6.2 classification | **Locked** | Reports classified as governed report workspace |
| P3-E2 §8 source-of-truth | **Locked** | Reports owns lifecycle, consumes module snapshots |
| Spine publication requirements | **Locked** | P3-A3 §7 + P3-D1 §8.6 + P3-D2 §11 + P3-D3 §12 + P3-D4 §9 |

**Classification:** No full reporting workspace implementation exists. A baseline catalog/source-readiness seam is live, but the governed registry, draft, run-ledger, generation, approval, and release lifecycle remain a **gap requiring new implementation** with PH7-14 providing implementation-ready specifications.

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
| `runType` | `'standard' \| 'reviewer-generated'` | Distinguishes PM/PE-initiated runs from PER reviewer-generated runs |
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

### 8.5 Portfolio Executive Reviewer report permissions

PER posture provides access to report content under a distinct permission set that differs from PM, PE, and project team roles. The central project-governance policy record (§14) further governs family-specific release authority.

**What PER may do:**

| Action | Permitted | Rules |
|---|---|---|
| View report runs (all families in scope) | **Yes** | Subject to department scope; PER sees runs for projects in their governed scope only |
| Annotate report content (review layer) | **Yes** | Annotations stored in separate `@hbc/field-annotations` artifact; MUST NOT modify run-ledger, draft state, or PM narrative (P3-E2 §8.4) |
| Generate reviewer-generated review runs | **Yes** | Only against the latest already-confirmed PM-owned snapshot; see §8.6 |
| View release status | **Yes** | Read-only |
| Release a report family | **Project-policy governed** | Authority is per-family, governed by the central project-governance policy record (§14); not universal |

**What PER may NOT do:**

| Action | Prohibited |
|---|---|
| Confirm a PM draft | PER MUST NOT initiate, approve, or modify PM draft confirmation. Draft state confirmation is PM/PE-owned exclusively. |
| Edit PM narrative | PER MUST NOT modify PM narrative override content. Narrative is PM/PE-authored exclusively. |
| Modify run-ledger entries | PER has no write access to the run ledger. Reviewer-generated runs are added as new entries only. |
| Access unconfirmed PM drafts | Reviewer-generated runs must use the latest confirmed snapshot only; in-progress or unconfirmed PM drafts are not accessible to PER. |
| Advance or bypass PM↔PE internal review chain | The PM↔PE internal review chain is PM/PE-owned; PER cannot initiate, advance, or skip it. |

### 8.6 Reviewer-generated review runs

A reviewer-generated review run is initiated by a Portfolio Executive Reviewer, distinct from PM/PE-initiated runs.

| Rule | Description |
|---|---|
| **Snapshot source** | MUST use only the latest already-confirmed PM-owned snapshot. PER cannot trigger a new confirmation; no unconfirmed drafts are accessible. |
| **Run type tag** | Run is recorded in the run-ledger as `runType: 'reviewer-generated'`. The `generatedBy` field captures PER identity. |
| **Annotation attachment** | Reviewer-generated run may carry an attached `@hbc/field-annotations` review artifact as a contextual annotation layer. |
| **No bypass** | A reviewer-generated run does not bypass, replace, or modify the PM's draft state, PM narrative, or the PM's own run history. |
| **No new draft confirmation** | PER initiating a reviewer run does NOT trigger any PM draft state change. The PM's draft lifecycle is entirely unaffected. |
| **Visibility** | Reviewer-generated runs are visible to the project team and PER. Review annotations are restricted to the review circle before PER pushes to the project team. |

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

## 14. Central Project-Governance Policy Record

### 14.1 Purpose and ownership

The central project-governance policy record is the **authoritative source** for report-family approval and release policy for a project. The Reports module **enforces** this policy but does **not own** it.

| Concern | Owner |
|---|---|
| Report-family approval/release policy | Project-governance policy record |
| Policy enforcement in the reporting pipeline | Reports module (enforcer only) |
| Global policy floor | Manager of Operational Excellence (company-wide default) |
| Project-level policy customization | Project Executive (project-specific; may tighten global policy; may NOT loosen it) |

### 14.2 Policy hierarchy

| Level | Authority | Scope | Rule |
|---|---|---|---|
| **Global** | Manager of Operational Excellence | Company-wide floor | All projects comply by default; no project may loosen global policy |
| **Project** | Project Executive | Project-specific | May add stricter rules; may NOT loosen or override the global floor |
| **Effective** | Merged result | Per-project | Reports module reads effective policy = project overlay on global floor |

### 14.3 Project-governance policy record shape

| Field | Type | Description |
|---|---|---|
| `projectId` | `string` | Project identity (normalized per P3-A1 §3.4) |
| `familyPolicies` | `Record<familyKey, IReportFamilyPolicy>` | Per-family policy overrides relative to global floor |
| `internalReviewChainConfig` | `IInternalReviewChainConfig \| null` | PM↔PE internal review chain configuration (§14.5) |
| `lastModifiedBy` | `string` | UPN of the PE who last modified project-level policy |
| `lastModifiedAt` | `string` | ISO 8601 timestamp |

### 14.4 Per-family policy shape

| Field | Type | Description |
|---|---|---|
| `perReleaseAuthority` | `'pe-only' \| 'per-permitted' \| 'global'` | Governs PER release capability for this family |
| `requiresInternalReviewChain` | `boolean` | Whether PM↔PE chain must complete before release/PX Review proceeds |
| `bypassInternalReviewChainForOwnerReport` | `boolean` | Owner Report only: explicit opt-out of chain requirement (default: `false`) |

**`perReleaseAuthority` values:**

| Value | Meaning |
|---|---|
| `'pe-only'` | Only Project Executive (or Leadership) may release; PER may not release this family |
| `'per-permitted'` | PER may release this family (subject to scope); PE may also release |
| `'global'` | Apply global floor policy for this family |

**Default global policy (set by Manager of OpEx):** `pe-only` for PX Review; `per-permitted` for Owner Report. Both are configurable at global level by Manager of OpEx.

### 14.5 PM↔PE internal review chain

The PM↔PE internal review chain is an optional project-level governance step that inserts a required PE review before PX Review (or other release actions) may proceed for a given report family.

| Rule | Description |
|---|---|
| **Configuration** | PE enables the chain in the project-governance policy record per report family. Default: chain not required (unless global policy requires it). |
| **Chain behavior** | PM submits the report run to PE for internal review → PE approves or returns for revision → chain marked complete → PX Review and/or release may proceed |
| **PX Review cannot bypass** | When `requiresInternalReviewChain: true` for the PX Review family, PX Review CANNOT proceed until the PM↔PE chain is marked complete for that run. |
| **PER cannot bypass** | PER cannot advance, approve, or skip PM↔PE internal review chain steps. The chain is PM/PE-owned exclusively. |
| **Owner Report bypass** | Owner Report MAY bypass the chain ONLY when `bypassInternalReviewChainForOwnerReport: true` is explicitly set in the project family policy. Default: `false` (chain applies if enabled). |
| **Chain ownership** | All chain steps are PM/PE-owned. PER has no role in this chain. |

### 14.6 Reports module as policy enforcer

The Reports module:
- Reads effective policy at generation, approval, and release time
- Enforces the `perReleaseAuthority` rule when PER attempts to release a report family
- Enforces the `requiresInternalReviewChain` gate before PX Review or release actions are permitted
- Does NOT modify the policy record itself — policy changes go through the PE (project-level) or Manager of OpEx (global-level)
- Rejects any action that would violate the effective policy, regardless of the requesting actor's role

---

## 15. Repo-Truth Reconciliation Notes

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

8. **PER report permissions and reviewer-generated runs — gap filled**
   No PER report permission model, reviewer-generated run type, or run-ledger `runType` field previously existed. Now locked in §8.5–§8.6 and §7.1. Classified as **gap — now resolved**.

9. **Central project-governance policy record — gap filled**
   No project-governance policy record previously existed. Policy record structure, hierarchy, PM↔PE internal review chain, and PER release authority rules now locked in §14. Reports module is enforcer-only; Manager of OpEx sets global floor; PE sets project-level policy. Classified as **gap — now resolved**.

---

## 16. Acceptance Gate Reference

**Gate:** Reporting gates (Phase 3 plan §18.6)

| Field | Value |
|---|---|
| **Pass condition** | PX Review and Owner Report are live as governed report families. Draft refresh, staleness warning, queued generation, run tracking, and history work. PX Review explicit approval and Owner Report governed non-approval-gated release behavior are implemented correctly. PER report permissions enforced (no draft authority, reviewer-generated runs against confirmed snapshots only). Central project-governance policy record enforced; global and project-level policy hierarchy in effect; PM↔PE internal review chain blocks PX Review when configured. |
| **Evidence required** | P3-F1 (this document), report-definition registry with 2 families, draft/snapshot model functional, staleness handling operational, generation pipeline producing PDF artifacts, run-ledger tracking all runs with `runType` distinction, PX Review approval gate enforced, Owner Report non-gated release working, PER permission rules verified, project-governance policy record enforced, spine publication flowing |
| **Primary owner** | Project Hub platform owner + Architecture |

---

## 17. Policy Precedence

This contract establishes the **governed reporting system specification** that implementation must satisfy:

| Deliverable | Relationship to P3-F1 |
|---|---|
| **Phase 3 Plan §8.7, §12.6** | Provides the reporting model and module boundary that this contract codifies |
| **PH7-14** — PX Review & Owner Report | Provides detailed implementation specifications that this contract governs |
| **P3-A2 §3.2** — PER Governed Authority | Defines the Portfolio Executive Reviewer posture and scope; PER report permissions (§8.5–§8.6) derive from this authority model |
| **P3-E1** — Module Classification Matrix | Classifies Reports as governed report workspace (§3.6, §6.2); §9.1 classifies Reports as review-capable |
| **P3-E2 §8** — Reports Source-of-Truth | Defines Reports ownership (lifecycle) vs. consumption (module snapshots); §8.4 governs executive review boundary |
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

**Last Updated:** 2026-03-22
**Governing Authority:** [Phase 3 Plan §8.7, §12.6](../04_Phase-3_Project-Hub-and-Project-Context-Plan.md)
