# P3-E9-T09 — Reports: Shared Feature Integration and Surface Consumption

**Module:** P3-E9 Reports
**Governing contracts:** P3-F1 (Reports contract), P3-E10 (Closeout), P3-D1–P3-D4 (Spines)

---

## 1. P3-F1: Governing Contract

### 1.1 Relationship

P3-F1 (Reports Workspace / Definition / Run / Release Contract Package) is the foundational contract for Reports. It governs:
- The report-definition registry structure
- Draft/snapshot lifecycle and ownership rules (P3-F1 §4)
- Staleness model and refresh rules (P3-F1 §5)
- Generation pipeline contract (P3-F1 §6)
- Run-ledger structure and query model (P3-F1 §7)
- Approval model and approval gating (P3-F1 §8.1–§8.2)
- PER permissions (P3-F1 §8.5–§8.6)
- PM↔PE internal review chain (P3-F1 §14.5)
- Central project-governance policy record (P3-F1 §14)

### 1.2 E9 vs. P3-F1

P3-F1 establishes the locked architecture. P3-E9 adds:
- The field-level implementation of each report family's section definitions (T06)
- The scored data contracts for sub-scorecard (T06 §5.3)
- The lesson entry contracts for lessons-learned (T06 §5.5)
- The template governance model with project extension and promotion workflow (T05)
- The configuration version model with draft vs. active distinction (T03)
- Spine publication contracts (T08)
- Acceptance gate (T10)

E9 T-files do not re-specify what P3-F1 defines. They reference it by section.

---

## 2. P3-E10: Project Closeout Integration

### 2.1 Integration Point

P3-E10 (Project Closeout) is the source-of-truth for sub-scorecard and lessons-learned operational data. Reports consumes P3-E10 snapshots via a governed snapshot API.

### 2.2 Snapshot API Contract

P3-E10 must implement a snapshot API that:
- Returns a confirmed `ISubScorecardSnapshot` per (`projectId`, `subcontractorId`) — for sub-scorecard generation
- Returns a confirmed `ILessonsLearnedSnapshot` per `projectId` — for lessons-learned generation
- Indicates when a snapshot is available and confirmed by PE
- Returns the snapshot version and capture timestamp

The snapshot API contract is specified in P3-E10's T-file family. Reports treats the payload as opaque (except for assembly and PDF rendering).

### 2.3 Snapshot Availability Dependency

Before Reports can generate a `sub-scorecard` or `lessons-learned` run:
- P3-E10 must have a completed, PE-confirmed snapshot for the requested subcontractor or project.
- If the P3-E10 snapshot is not available, Reports blocks generation with a readiness check failure.

### 2.4 Scoring and Calculation Boundary

P3-E10 executes all scoring logic before providing the snapshot to Reports:
- Sub-scorecard section scores (weighted averages excluding N/A criteria)
- Overall weighted score
- Performance rating derivation

Reports receives pre-computed scores. Reports does not re-execute scoring formulas.

---

## 3. Source Module Snapshot Integrations

Reports depends on snapshot APIs from multiple source modules. The following modules must be snapshot-capable for Phase 3 report families:

| Source Module | Used By | Snapshot Content |
|---------------|---------|-----------------|
| P3-A1 (Project Registry) | PX Review, Owner Report | Project metadata, team, contract summary |
| P3-D3 (Work Queue) | PX Review (open-items-summary), Owner Report (open-items) | Open item counts, assignments, aging summaries |
| P3-E4 (Financial) | PX Review, Owner Report | Budget, forecast, change orders, EVM indicators |
| P3-E5 (Schedule) | PX Review, Owner Report | Milestones, percent complete, critical path summary |
| P3-E6 (Constraints) | PX Review (constraints-summary) | Open constraints, delay posture, published review-package summaries |
| P3-E7 (Permits) | PX Review, Owner Report (optional posture summary) | Permit posture, inspection posture, expiration risk summaries |
| P3-E8 (Safety) | PX Review, Owner Report | Safety posture band, composite score band, corrective actions summary |
| P3-E10 (Closeout) | sub-scorecard, lessons-learned | Pre-computed scored data, lesson entries |
| P3-E15 (QC) | PX Review (quality-summary) when implemented | QC health, readiness, and responsible-org rollup snapshots |

Each source module's snapshot API contract is defined in its own T09 file. Reports consumes the envelope (`IModuleSnapshot` wrapper) and relies on the source module's schema reference for field-level rendering.

---

## 4. @hbc/field-annotations

### 4.1 Integration Purpose

Reports surfaces an annotation attachment point for PER review. Annotations are owned by `@hbc/field-annotations`, not by Reports.

### 4.2 Integration Contract

```typescript
// Reports creates an annotation anchor on a run record
interface IReportAnnotationAnchor {
  runId: string;
  projectId: string;
  familyKey: string;
  anchorType: 'report-run';
  annotationArtifactRef: string; // Returned by @hbc/field-annotations on anchor creation
}
```

- For reviewer-generated runs, the `annotationArtifactRef` is recorded on `IReportRunRecord`.
- For standard runs, annotations may optionally be anchored if supported by family policy.
- `@hbc/field-annotations` owns annotation CRUD, threading, resolution, and Push-to-Team initiation.
- Reports does not read or modify annotation content.

---

## 5. @hbc/workflow-handoff

### 5.1 Integration Purpose

The PM↔PE internal review chain (T04 §6) uses `@hbc/workflow-handoff` to manage the submit/approve/return lifecycle.

### 5.2 Integration Contract

When PM submits a run for internal PE review:
- Reports calls `@hbc/workflow-handoff` to create a handoff record.
- The handoff tracks `submitted → reviewed → complete/returned`.
- Reports reads the chain status from the handoff to enforce the approval gate.
- PE's action in the handoff advances the chain status.
- Reports does not own the handoff state machine; it only reads and enforces the outcome.

---

## 6. SharePoint: Artifact Storage

### 6.1 Integration Purpose

Generated PDF artifacts are stored in the project's governed SharePoint document library. Reports records the artifact URL but does not manage SharePoint document lifecycle.

### 6.2 Integration Contract

- The generation pipeline worker calls the SharePoint storage API after rendering.
- The returned SharePoint URL is stored as `artifactUrl` on the run record.
- The URL is permanent — artifacts are not deleted or overwritten.
- SharePoint access permissions are governed separately; Reports stores and exposes the URL.

---

## 7. Spine Package Integrations

Reports integrates with all four spine packages. See T08 for the full publication contracts.

| Spine | Package | Reports Writes | Reports Reads |
|-------|---------|---------------|--------------|
| Activity (P3-D1) | `@hbc/activity-spine` | Activity events | No |
| Health (P3-D2) | `@hbc/health-spine` | Report currency metric | No |
| Work Queue (P3-D3) | `@hbc/work-queue` | Work queue items; reads item resolution | Yes (to resolve items) |
| Related Items (P3-D4) | `@hbc/related-items` | Provenance relationships | No |

---

## 8. Surface Consumption (How Other Modules Consume Reports)

### 8.1 Project Hub Consumption

The Project Hub reads Reports data for:
- **Run status summary** — Which report families have been generated/approved/released, displayed in the Project Hub overview
- **Report currency health metric** — surfaced in the Health spine widget on Project Hub
- **Work Queue items** — Report-related work items surfaced in the PM/PE work queue
- **Activity feed** — Report lifecycle events shown in the project activity feed

Project Hub does not embed the Reports UI directly; it surfaces summary state and links to the Reports module page.

**Repo-truth note — 2026-03-25.** A baseline report catalog and source-readiness surface now exists inside Project Hub at `/project-hub/{projectId}/reports`. The full P3-F1 registry, run-ledger, generation, and release lifecycle remains separate implementation scope.

### 8.2 SPFx Hub Webpart Consumption

SPFx hosts a Reports webpart that provides:
- Run list and status display
- Generate / queue a new run
- Approve PX Review runs
- Release non-gated runs
- View/download generated artifacts
- Staleness warnings and refresh trigger
- Launch-to-PWA for history browsing, advanced editing, and multi-run comparison

### 8.3 PER Executive Review Surface

PER's executive review surface (both PWA and SPFx) consumes:
- All report runs in governed project scope
- Annotation attachment points per run
- Reviewer-generated run initiation (against confirmed PM snapshots)
- Run-ledger history (PWA depth)
- Multi-run comparison (PWA depth)

### 8.4 P3-E10 Closeout Module

P3-E10 does not consume Reports directly. Data flows from P3-E10 to Reports via the snapshot API (Reports pulls from E10). P3-E10 may surface links to released sub-scorecard and lessons-learned report artifacts within the Closeout UI.

### 8.5 P3-H1 Acceptance and Staging

Reports acceptance gate is defined in T10. The final acceptance evidence includes:
- Report-definition registry with 4 families registered and active
- Draft/snapshot model functional
- Staleness handling operational
- Generation pipeline producing PDF artifacts
- Run ledger tracking all runs with `runType` distinction
- PX Review approval gate enforced
- Owner Report non-gated release working
- PER permissions verified
- Project-governance policy enforced
- Spine publication flowing
- Internal review chain blocking when configured
