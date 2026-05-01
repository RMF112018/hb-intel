# Implementation Strategy and Open Decisions

### 4.1 Target architecture

Wave 8 should add the following framework layers:

1. **Shared contracts** in `@hbc/models/pcc`
   - readiness domain taxonomy;
   - lifecycle gate taxonomy;
   - readiness item shape;
   - source-module relationship shape;
   - readiness status/posture;
   - blocker/severity/confidence/evidence status;
   - gate/domain summary read-model;
   - deterministic framework fixtures.

2. **Read-model response map extension**
   - add `project-readiness` or `readiness-framework` read-model key after Prompt 01 resolves naming.
   - Recommended route ID: `project-readiness` because it matches existing `PccMvpSurfaceId` and user-facing surface.
   - Internal data type should still be `PccProjectReadinessFrameworkReadModel` or similar.

3. **Backend mock provider extension**
   - add `getProjectReadiness(...)` read-only provider method;
   - add GET-only route only after Prompt 01 authorizes backend route extension;
   - preserve mock/local mode, deterministic fixtures, and no runtime integrations.

4. **SPFx client/fixture parity**
   - add fixture client support and optional backend client method;
   - keep fixture default;
   - update tests proving no unintended fetch/cutover;
   - do not make backend mode default.

5. **Project Readiness Center shell**
   - replace static readiness preview with framework-driven cards/lenses;
   - use existing bento/card patterns;
   - show domains, gates, blockers, ownership, evidence, source health, and degraded states;
   - use inert/disabled action chips only;
   - no checklist execution and no write actions.

6. **Wave 8 closeout**
   - document exact implementation, validation, exclusions, residual risks, and Wave 9 handoff.

### 4.2 Framework data model intent

Prompt 02 should introduce framework model names similar to:

```text
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

Recommended exports:

```ts
PROJECT_READINESS_DOMAINS
PROJECT_READINESS_LIFECYCLE_GATES
PROJECT_READINESS_SOURCE_MODULES
PROJECT_READINESS_STATUSES
PROJECT_READINESS_POSTURES
PROJECT_READINESS_BLOCKER_STATES
PROJECT_READINESS_SEVERITIES
PROJECT_READINESS_CONFIDENCE_STATES
PROJECT_READINESS_EVIDENCE_STATES
SAMPLE_PROJECT_READINESS_FRAMEWORK
```

Recommended types:

```ts
ProjectReadinessDomainId
ProjectReadinessLifecycleGateId
ProjectReadinessSourceModuleId
ProjectReadinessStatus
ProjectReadinessPosture
ProjectReadinessBlockerState
ProjectReadinessSeverity
ProjectReadinessConfidenceState
ProjectReadinessEvidenceState
IProjectReadinessSourceLineage
IProjectReadinessEvidenceRequirement
IProjectReadinessItem
IProjectReadinessDomainSummary
IProjectReadinessGateSummary
IProjectReadinessOwnershipSummary
IProjectReadinessEvidenceSummary
IProjectReadinessBlockerSummary
IProjectReadinessFrameworkSnapshot
PccProjectReadinessFrameworkReadModel
```

### 4.3 Minimum fields for readiness items

A Wave 8 framework item should support, at minimum:

```ts
interface IProjectReadinessItem {
  id: string;
  title: string;
  description?: string;
  domain: ProjectReadinessDomainId;
  lifecycleGate: ProjectReadinessLifecycleGateId;
  sourceModule: ProjectReadinessSourceModuleId;
  sourceLineage?: IProjectReadinessSourceLineage;
  ownerPersona?: PccPersona;
  accountablePersona?: PccPersona;
  reviewerPersona?: PccPersona;
  dueDate?: string;
  status: ProjectReadinessStatus;
  posture: ProjectReadinessPosture;
  severity: ProjectReadinessSeverity;
  blockerState: ProjectReadinessBlockerState;
  confidence: ProjectReadinessConfidenceState;
  evidenceRequirement?: IProjectReadinessEvidenceRequirement;
  dependencyItemIds?: readonly string[];
  relatedPriorityActionId?: string;
  exceptionSummary?: string;
  readOnly: true;
}
```

### 4.4 Required readiness domains

Use the Wave 8 scope-lock taxonomy as the base, with research-informed labels:

1. Project Setup
2. Team & Access
3. Documents / Project Record
4. Startup / Mobilization
5. Safety / QAQC
6. Permits / Jurisdiction
7. Procurement / Buyout
8. Responsibility / RACI
9. Constraints
10. Schedule / Milestones
11. Financial / Accounting Setup
12. External Systems
13. Site Health
14. Closeout / Turnover

### 4.5 Required lifecycle gates

Use the Wave 8 scope-lock taxonomy as the base:

1. Lead / Pursuit
2. Estimating
3. Preconstruction
4. Turnover to Operations
5. Startup / Mobilization
6. Active Construction
7. Closeout Planning
8. Substantial Completion
9. Turnover / Warranty
10. Archived / Lessons Learned

Do not introduce `archived` as a `PccProjectStage`; repo truth says `Archived` remains a project status, not a lifecycle stage.

### 4.6 Scoring/posture policy

Wave 8 may display deterministic summary values from fixtures, but it must not implement a scoring engine.

Policy:

- blockers override completion percent;
- evidence confidence is separate from completion;
- source health is separate from item completion;
- domain/gate posture is more important than a global blended score;
- use fixture-calculated values, not runtime computation unless trivial and purely presentational.

Recommended posture values:

```ts
'ready' | 'at-risk' | 'blocked' | 'not-started' | 'not-applicable' | 'unknown'
```

Recommended status values:

```ts
'not-started' | 'in-progress' | 'blocked' | 'needs-evidence' | 'needs-review' | 'complete' | 'not-applicable' | 'deferred' | 'waived'
```

### 4.7 Explicit forbidden scope

Wave 8 must not implement:

- Wave 9 checklist item library;
- Startup/Safety/Closeout checklist execution;
- RACI/Responsibility Matrix module;
- Permit Log module;
- Constraints Log module;
- Buyout Log module;
- live approval/workflow execution;
- live Graph file operations;
- SharePoint list/library mutations;
- PnP/SharePoint REST runtime;
- OneDrive folder creation;
- Procore runtime/writeback/sync/mirror;
- Sage runtime/writeback;
- Document Crunch runtime;
- Adobe Sign runtime;
- external-system writeback;
- tenant mutation;
- permission mutation;
- Power Automate flows;
- package/dependency changes;
- SPFx packaging/deployment;
- secrets/app settings;
- production rollout.

---

## 5. Open Decisions and Recommended Decisions

| ID | Decision | Recommended resolution | Prompt |
| --- | --- | --- | --- |
| W8-OD-001 | Does current scope-lock authorize implementation? | No. Prompt 01 must update/lock implementation authorization under blueprint Wave 8 path before source edits. | 01 |
| W8-OD-002 | Route/read-model key name | Use `project-readiness` for route/client key to match current surface ID; use `PccProjectReadinessFrameworkReadModel` for type name. | 01/02/03 |
| W8-OD-003 | Should Wave 8 backend route be added? | Yes, only as GET-only mock/read-model route after Prompt 01 authorizes it; no default SPFx backend cutover. | 03 |
| W8-OD-004 | Should Wave 8 include checklist content? | No. Use only framework demonstration fixtures; Wave 9 owns checklist content. | All |
| W8-OD-005 | Should Wave 8 compute readiness scores? | No scoring engine. Use fixture/precomputed summary values and simple display. | 02/05 |
| W8-OD-006 | Should evidence upload/linking be executable? | No. Model evidence requirement/status/reference only. HB Document Control Center remains evidence source-of-record. | 02/06 |
| W8-OD-007 | Should action chips execute? | No. Inert/disabled metadata-only action chips. | 05/06 |
| W8-OD-008 | Should local agent edit `docs/architecture/plans/**`? | No, unless user explicitly authorizes. Use blueprint/current-state docs. | All |
| W8-OD-009 | Should package/lockfile changes be allowed? | No. Stop if required. | All |

---
