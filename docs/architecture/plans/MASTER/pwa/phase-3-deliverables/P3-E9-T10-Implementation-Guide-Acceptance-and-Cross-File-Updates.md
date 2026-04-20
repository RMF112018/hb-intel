# P3-E9-T10 — Reports: Implementation Guide, Acceptance, and Cross-File Updates

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 — Reports Workspace / Definition / Run / Release Contract Package

---

## 1. Package Placement

### 1.1 Feature Package

Reports module implementation belongs in `features/reports` (or the equivalent governed feature package per the monorepo's package-relationship-map). This package:

- Owns all Reports UI components (report list, run ledger view, draft editor, approval/release controls, staleness UI)
- Owns the report run service (generation queue, status polling, artifact download)
- Consumes the `@hbc/field-annotations` package for PER annotation surfaces
- Consumes `@hbc/workflow-handoff` for the PM↔PE internal review chain
- Consumes shared spine packages for publication
- Does NOT own central project-governance policy record storage (reads from the policy service)

### 1.2 Shared Package Dependencies

| Package | Purpose |
|---------|---------|
| `@hbc/report-contracts` (or equivalent) | Shared TypeScript contracts — `IReportFamilyDefinition`, `IReportRunRecord`, etc. (if cross-feature consumption requires shared types) |
| `@hbc/field-annotations` | PER review annotation layer |
| `@hbc/workflow-handoff` | PM↔PE review chain |
| `@hbc/activity-spine` | Activity event publication |
| `@hbc/health-spine` | Health metric publication |
| `@hbc/work-queue` | Work queue item creation and resolution |
| `@hbc/related-items` | Provenance relationship registration |
| `@hbc/versioned-record` | If used for configuration version tracking |

### 1.3 Package Blockers

| Blocker ID | Description | Blocks |
|------------|-------------|--------|
| B-REP-01 | `@hbc/field-annotations` package must be production-ready before PER annotation features can be implemented | T07 annotation layer, T04 reviewer-generated runs with annotation attachment |
| B-REP-02 | `@hbc/workflow-handoff` package must be production-ready before PM↔PE internal review chain can be implemented | T04 §6 internal review chain |
| B-REP-03 | P3-F1 contract package must be finalized before Reports implementation begins | All T-files |
| B-REP-04 | Each source module's snapshot API must be implemented before Reports can generate runs that include that module's sections | T06 §2 snapshot integrations per module |
| B-REP-05 | P3-E10 snapshot API for sub-scorecard and lessons-learned must be implemented before those families can generate runs | T06 §5 — sub-scorecard and lessons-learned ingestion |
| B-REP-06 | SharePoint document library governance for the project must be configured before artifact storage is functional | T04 §2.2 artifact storage |

---

## 2. Implementation Stages

### Stage 9.REP.0 — Contracts and Registry Foundation

**Deliverables:**
- TypeScript interfaces from T02 defined in the shared contracts package
- Report-definition registry data store operational
- Phase 3 corporate template definitions registered: `px-review`, `owner-report`, `sub-scorecard`, `lessons-learned`
- Project family registration model operational
- Configuration version model (draft/active) operational

**Verification:** All four family definitions registered; project family registration creates draft config versions; active config activation workflow passes.

### Stage 9.REP.1 — Draft, Snapshot, and Narrative Layer

**Deliverables:**
- PM draft configuration editing UI (narrative sections, release class, audience class)
- Draft refresh implementation (calls source module snapshot APIs, updates sections)
- Staleness tracking and warning UI
- Snapshot freeze on draft confirmation
- Readiness check before generation queuing

**Verification:** Draft refresh updates `lastRefreshedAt`; staleness warning appears at threshold; confirmation freezes snapshots; readiness check blocks generation when required sections lack snapshots.

### Stage 9.REP.2 — Generation Pipeline and Artifact Storage

**Deliverables:**
- Async generation queue integration
- PDF rendering pipeline
- SharePoint artifact storage
- Artifact URL recording on run record
- Run status polling and UI updates

**Verification:** Queued run transitions through `queued → generating → generated`; artifact URL populated; SharePoint document accessible.

### Stage 9.REP.3 — Run Ledger and Status UI

**Deliverables:**
- Run ledger UI (list view, status badges, filter by family/status/date)
- Run detail view (snapshot refs, artifact download, approval/release metadata)
- `runType` distinction displayed (standard vs. reviewer-generated)
- Run archival action

**Verification:** All runs visible with correct status and metadata; standard and reviewer-generated runs clearly distinguished; run-ledger filters functional.

### Stage 9.REP.4 — Approval Workflow (PX Review)

**Deliverables:**
- PX Review approval gate enforcement
- PE approval UI
- Work Queue item: `report-approval-pending`
- Activity event: `reports.approved`
- Internal review chain (when required by policy)

**Verification:** PX Review run in `generated` status creates approval-pending Work Queue item; PE approval transitions run to `approved`; internal review chain blocks approval when required and unblocks on chain completion.

### Stage 9.REP.5 — Release and Distribution Governance

**Deliverables:**
- Release action UI (per-family authority enforcement)
- Release class selection UI (within allowed set)
- External recipient management (for external-limited release class)
- PER release authority enforcement
- Work Queue item: `report-distribution-pending`
- Activity event: `reports.released`
- Distribution confirmation action

**Verification:** PX Review requires approval before release; Owner Report releases directly; PER release authority respected per effective policy; audience class change to broader audience requires PE approval.

### Stage 9.REP.6 — PER Reviewer Experience

**Deliverables:**
- PER view of all report runs in governed scope
- Reviewer-generated run initiation (against confirmed PM snapshot)
- `@hbc/field-annotations` integration for run-level annotations
- PER release action (where `perReleaseAuthority = 'per-permitted'`)
- PER permission enforcement (no draft access, no narrative editing, no chain authority)

**Verification:** PER sees runs in scope; reviewer-generated runs use latest confirmed PM snapshot; PER annotation attaches via field-annotations and does not modify run record; PER cannot access unconfirmed PM drafts.

### Stage 9.REP.7 — Sub-Scorecard and Lessons-Learned Families

**Deliverables:**
- `sub-scorecard` family generation (pulls P3-E10 snapshot)
- `lessons-learned` family generation (pulls P3-E10 snapshot)
- Integration with P3-E10 snapshot API
- PDF rendering for both families

**Verification:** Sub-scorecard generation fails when no P3-E10 confirmed snapshot exists; succeeds when P3-E10 snapshot available; rendered PDF includes pre-computed scores and narratives from P3-E10; Reports does not re-compute any scores.

### Stage 9.REP.8 — Governance Policy Enforcement

**Deliverables:**
- Central project-governance policy record read and enforcement
- Global floor + project overlay merge logic
- Per-family effective policy resolution
- Policy enforcement at all critical gates (staleness, approval, release, audience)

**Verification:** Global floor policy applied to all projects; PE project overlay tightens policy (not loosens); effective policy governs run behavior.

### Stage 9.REP.9 — Spine Publication

**Deliverables:**
- Activity spine publication (4 event types)
- Health metric: report-currency
- Work Queue integration (all 3 item types)
- Related Items: run → snapshot provenance relationships

**Verification:** Activity events flow on lifecycle transitions; health metric updates on approval/release; related items registered for all completed runs.

### Stage 9.REP.10 — Template Governance (Full)

**Deliverables:**
- Corporate template library management UI (MOE/Admin access)
- Template versioning (structural changes create new version)
- Post-activation structural change workflow (PE re-approval required)
- Template promotion workflow (project extension → corporate template)

**Verification:** Structural change to active config creates new draft version; new draft requires PE re-approval; prior active version still drives runs while draft is pending; promotion workflow submits to MOE review.

---

## 3. Acceptance Gate

All items must be verified before claiming Reports module complete. Items are organized by area.

### 3.1 Registry and Contracts (AC-REP-01 through AC-REP-08)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-01 | Report-definition registry operational with 4 registered families: `px-review`, `owner-report`, `sub-scorecard`, `lessons-learned` | Registry query returns 4 families with correct metadata |
| AC-REP-02 | `IReportFamilyDefinition` contract fully populated for all 4 families including section definitions | All sections have correct `contentType`, `sourceModuleKey`, and `isRequired` |
| AC-REP-03 | `px-review` marked `isLocked: true`; structure not modifiable by project actions | Attempt to structurally modify PX Review at project level is rejected |
| AC-REP-04 | Project family registration creates a draft config version on first registration | New project registration creates `IProjectFamilyRegistration` with `activeConfigVersionId: null` and a draft version |
| AC-REP-05 | Configuration version state machine enforced: draft → active; structural changes require re-approval | Structural change sets `structuralChanges: true`; PE activation required before new version drives runs |
| AC-REP-06 | TypeScript contracts match T02 definitions without deviation | Type check passes; no type widening |
| AC-REP-07 | Effective policy resolution correctly merges global floor + project overlay | PE cannot loosen global floor settings; tighter overlay applied correctly |
| AC-REP-08 | Template version reference recorded on each run's `configVersionId` | Run record's config version matches the active version at queue time |

### 3.2 Draft, Snapshot, and Narrative (AC-REP-09 through AC-REP-18)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-09 | Draft refresh updates `lastRefreshedAt` and clears staleness warning | Refresh timestamp updates; warning disappears |
| AC-REP-10 | PM narrative sections preserved across draft refresh | Narrative content unchanged after refresh |
| AC-REP-11 | Staleness warning shown when draft exceeds `stalenessThresholdDays` | Warning banner appears at threshold |
| AC-REP-12 | Export blocked until staleness acknowledgment when draft is stale | Export button disabled/gated; acknowledgment required |
| AC-REP-13 | Work Queue item `report-draft-stale` created at staleness threshold | Work item appears in PM queue with correct owner and priority |
| AC-REP-14 | Snapshot freeze on draft confirmation — snapshot refs immutable after queuing | Attempt to modify `snapshotRefs` after queuing rejected |
| AC-REP-15 | Readiness check blocks generation when required snapshots missing | Correct source modules listed as missing in readiness failure message |
| AC-REP-16 | PM narrative authorship attribution tracked (UPN, timestamp) | `INarrativeEdit` records created per edit |
| AC-REP-17 | PER cannot access unconfirmed PM drafts | PER API call to in-progress draft returns 403 |
| AC-REP-18 | PER cannot confirm a draft | PER draft confirmation API call rejected |

### 3.3 Generation Pipeline (AC-REP-19 through AC-REP-25)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-19 | Generation is asynchronous — run transitions through `queued → generating → generated` | Status polling confirms correct transitions |
| AC-REP-20 | PDF artifact stored in SharePoint; `artifactUrl` populated | Download link functional; file accessible in SharePoint |
| AC-REP-21 | Generation failure sets `status: 'failed'` and populates `failureReason` | Failed run record has failure reason; new run can be initiated |
| AC-REP-22 | All required snapshots frozen on run creation; provenance traceable | `snapshotRefs` array populated; Related Items spine has provenance records |
| AC-REP-23 | Reviewer-generated runs use latest confirmed PM snapshot only | PER cannot select an unconfirmed draft; run uses frozen snapshot |
| AC-REP-24 | `runType` distinction (`standard` vs. `reviewer-generated`) correctly set and displayed | Run ledger distinguishes run types |
| AC-REP-25 | P3-E10 snapshot unavailability blocks sub-scorecard and lessons-learned generation with clear message | Readiness failure message identifies P3-E10 missing snapshot |

### 3.4 Approval and Release (AC-REP-26 through AC-REP-35)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-26 | PX Review approval gate enforced — run cannot reach `released` without passing through `approved` | Attempt to release PX Review from `generated` without approval rejected |
| AC-REP-27 | PE-only approval constraint enforced for PX Review — non-PE cannot approve | Non-PE approval call rejected |
| AC-REP-28 | Internal review chain blocks PX Review approval when policy requires it | Approval call rejected with chain-incomplete error when chain required and not complete |
| AC-REP-29 | Work Queue item `report-approval-pending` created when PX Review reaches `generated` | Work item in PE queue; resolves on PE approval |
| AC-REP-30 | Owner Report releases directly without approval gate | Owner Report transitions from `generated` → `released` without PE approval |
| AC-REP-31 | Release class enforced within allowed set | Release class outside allowed set rejected |
| AC-REP-32 | Audience class broadening requires PE approval | PM attempt to broaden audience class without PE approval rejected |
| AC-REP-33 | External distribution only where template explicitly permits | External release on PX Review rejected; allowed on Owner Report where template permits |
| AC-REP-34 | PER release authority respected per effective policy | PER can release Owner Report where `perReleaseAuthority = 'per-permitted'`; PX Review release rejected for PER |
| AC-REP-35 | Work Queue item `report-distribution-pending` created when applicable | Item appears in PM queue after release where policy requires it |

### 3.5 PER Review Experience (AC-REP-36 through AC-REP-42)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-36 | PER sees all runs in governed department scope | PER run list populated correctly; projects outside scope not shown |
| AC-REP-37 | PER annotation via `@hbc/field-annotations` attaches to run record via `annotationArtifactRef` | Annotation artifact ref populated on run record; annotation data not in run record itself |
| AC-REP-38 | Annotation does not modify run-ledger, draft state, or PM narrative | Run record unchanged after PER annotation; PM narrative unchanged |
| AC-REP-39 | PER cannot modify run-ledger entries | PER write calls to run-ledger rejected |
| AC-REP-40 | PER cannot advance or skip PM↔PE review chain | PER chain action call rejected |
| AC-REP-41 | Reviewer-generated run does not affect PM's draft state or run history | PM draft unchanged; reviewer run appears as separate entry |
| AC-REP-42 | PER cannot approve PX Review runs | PER approval call rejected |

### 3.6 Sub-Scorecard and Lessons-Learned (AC-REP-43 through AC-REP-48)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-43 | Sub-scorecard assembly uses P3-E10 pre-computed scores — Reports does not re-compute | Scores in PDF match P3-E10 snapshot exactly |
| AC-REP-44 | Lessons-learned assembly includes all lesson entries from P3-E10 snapshot | PDF contains all entries; categories and impact ratings match P3-E10 data |
| AC-REP-45 | Sub-scorecard generation blocked when no P3-E10 confirmed snapshot | Clear readiness failure message |
| AC-REP-46 | Sub-scorecard PDF renders performance rating correctly (Exceptional / Above Average / etc.) | PDF performance rating matches snapshot's `performanceRating` field |
| AC-REP-47 | Lessons-learned PDF renders per-lesson detail and project classifications | All required lesson fields present in PDF |
| AC-REP-48 | Aggregation rows for organizational database are not included in the report artifact | PDF does not contain raw aggregation row data; those remain in P3-E10 |

### 3.7 Spine Publication (AC-REP-49 through AC-REP-55)

| ID | Criterion | Evidence |
|----|-----------|---------|
| AC-REP-49 | `reports.draft-refreshed` (routine) Activity event emitted on draft refresh | Event in Activity spine with correct metadata |
| AC-REP-50 | `reports.approved` (notable) Activity event emitted on PX Review approval | Event in Activity spine |
| AC-REP-51 | `reports.released` (notable) Activity event emitted on any family release | Event in Activity spine |
| AC-REP-52 | `reports.stale-warning` (notable) Activity event emitted when staleness exceeds 2× threshold | Event in Activity spine at correct threshold |
| AC-REP-53 | `report-currency` health metric updated on approval/release | Health spine metric recalculated correctly |
| AC-REP-54 | `report-currency` health metric status turns red when threshold exceeded | Status transitions green → yellow → red correctly |
| AC-REP-55 | Related Items provenance relationships registered for all completed runs | One relationship per `snapshotRef` in run; queryable via Related Items spine |

---

## 4. Migration Notes

### 4.1 Monolith-to-T-File Migration

The prior `P3-E9-Reports-Module-Field-Specification.md` monolith (1,260 lines) has been replaced by this T-file family. Key content movements:

| Prior Monolith Section | Now In |
|------------------------|--------|
| §1–§3 (report family definitions, family registry) | T01 §3, T05 §1 |
| §4 (sub-scorecard section data model, scoring) | T06 §5.3 |
| §5 (lessons-learned data model, categories) | T06 §5.5, §5.6 |
| §6–§7 (TypeScript interfaces) | T02 |
| §8 (scoring formulas) | T06 §5.3 (now clearly attributed to P3-E10) |
| §9 (business rules) | T03 (draft/snapshot), T04 (run ledger), T05 (governance) |
| §11 (PER permissions) | T07 §1 |
| §12 (spine publication) | T08 |
| §13 (review boundary) | T07 §3 |
| §14–§15 (capabilities, acceptance) | T10 §2, §3 |

### 4.2 Ownership Clarification

The monolith treated sub-scorecard and lessons-learned as native report families with data owned by Reports. This T-file family correctly re-classifies them as **integration-driven artifact families** with data owned by P3-E10. The implementation impact:
- Sub-scorecard and lessons-learned data contracts are defined in P3-E10, not here.
- Reports receives a pre-computed snapshot; it does not hold the scoring logic.
- The scoring formulas in §8 of the monolith are moved to T06 §5.3 with explicit attribution to P3-E10 execution.

---

## 5. Cross-File Update Notes

The following files require updates when E9 T-file work is implemented or when this architecture is adopted:

| File | Update Required |
|------|----------------|
| `README.md` | P3-E9 row: update to reference T-file family; update Stage 8.9 Reports description |
| `P3-E1` §9 | Reports module classification: update from monolith reference to T-file family; confirm review-capable surface designation |
| `P3-E2` §8 | Source-of-truth boundary: clarify that sub-scorecard and lessons-learned source truth is P3-E10; Reports is source-of-truth for run ledger and artifact provenance only |
| `P3-F1` | Add T-file family cross-references in the governing contract intro; no structural change to P3-F1 itself |
| `P3-G1` §4.6 | No change required — existing §4.6 Reports lane matrix is consistent with T07 §4; confirm references to T07 |
| `P3-G2` §8.6 | No change required — existing cross-lane navigation entries are consistent with T07 §6; confirm references |
| `P3-G3` §8 | Add AC-REP references to lane-specific acceptance items for Reports |
| `P3-H1` §6.9 (or equivalent Reports section) | Replace monolith acceptance reference with structured AC-REP-01 through AC-REP-55 range |
