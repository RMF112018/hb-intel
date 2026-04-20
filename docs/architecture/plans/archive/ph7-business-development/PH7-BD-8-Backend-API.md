# PH7-BD-8 — Business Development: Backend API Endpoints

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-7 (Analytics) complete and passing build. All feature data shapes confirmed.
**Purpose:** Define and implement all Azure Function HTTP trigger endpoints for the BD module. Covers scorecard CRUD, stage transitions, committee operations, analytics aggregation, notification dispatch, and document operations.

---

## Prerequisite Checks

Before starting this task:

- [ ] All `IGoNoGoScorecard`, `IVersionSnapshot`, `IScorecardHandoffPackage`, `IBdAnalyticsSummary` interfaces finalized.
- [ ] Azure Functions project exists at `apps/api/` with TypeScript configuration.
- [ ] SharePoint list setup scripts are accessible (PH7-BD-9 will finalize SharePoint schemas).
- [ ] PnPjs and Managed Identity auth configured in the Functions app.
- [ ] Bearer token validation middleware exists from prior phases.

---

## Task 1 — SharePoint List Schemas

All BD data is persisted to SharePoint lists via PnPjs with Managed Identity authentication.

**SharePoint Lists for BD module:**

### `GoNoGoScorecards` list

| Column | SP Type | Notes |
|---|---|---|
| `Title` (=leadName) | Single line | Required |
| `ClientName` | Single line | — |
| `ProjectAddress` | Single line | — |
| `HbcRegion` | Choice | `HbcRegion` enum values |
| `ProjectSector` | Choice | `ProjectSector` enum values |
| `DeliveryMethod` | Choice | `DeliveryMethod` enum values |
| `EstimatedConstructionValue` | Number | — |
| `EstimatedGcFee` | Number | — |
| `BidDate` | Date | — |
| `LeadOriginDept` | Choice | `LeadOriginDept` enum values |
| `LeadOriginContact` | Single line | — |
| `BdManagerId` | Single line | AAD Object ID |
| `BdManagerName` | Single line | Display name |
| `DirectorOfPreconId` | Single line | — |
| `DirectorOfPreconName` | Single line | — |
| `ProjectExecutiveId` | Single line | Optional |
| `ProjectManagerId` | Single line | Optional |
| `IsTargetMarket` | Yes/No | — |
| `Stage` | Choice | `ScorecardStage` enum values |
| `Decision` | Choice | `GoNoGoDecision` enum values |
| `DecisionNotes` | Multi-line text | — |
| `DecisionRecordedAt` | Date/Time | — |
| `DecisionRecordedByUserId` | Single line | — |
| `CurrentVersion` | Number | Integer |
| `StrategicPursuitAnswer` | Choice | `StrategicPursuitAnswer` enum values |
| `BdManagerSubmitComment` | Multi-line text | — |
| `DirectorClarificationRequest` | Multi-line text | — |
| `DirectorRejectionReason` | Multi-line text | — |
| `DirectorAcceptedAt` | Date/Time | — |
| `CommitteeMeetingDeadline` | Date | — |
| `CommitteeMeetingDate` | Date/Time | — |
| `CommitteeMeetingLocation` | Single line | — |
| `WaitFollowUpDate` | Date | — |
| `WaitReason` | Multi-line text | — |
| `ExecutiveOverrideReason` | Multi-line text | — |
| `CommitteeScoringOpenedAt` | Date/Time | — |
| `CommitteeScoresRecordedAt` | Date/Time | — |
| `CriteriaJson` | Multi-line text | JSON array of `IGoNoGoScorecardCriterion[]` |
| `DepartmentalSectionsJson` | Multi-line text | JSON array |
| `CommitteeMembersJson` | Multi-line text | JSON array |
| `CreatedAt` | Date/Time | Auto |
| `UpdatedAt` | Date/Time | Managed |

### `GoNoGoVersionSnapshots` list

| Column | SP Type | Notes |
|---|---|---|
| `ScorecardId` | Single line | FK to GoNoGoScorecards |
| `VersionNumber` | Number | — |
| `SnapshotAt` | Date/Time | — |
| `CreatedByUserId` | Single line | — |
| `CreatedByDisplayName` | Single line | — |
| `TriggerAction` | Choice | `VersionTriggerAction` enum values |
| `OverallChangeComment` | Multi-line text | — |
| `CriterionChangesJson` | Multi-line text | JSON array of `ICriterionChange[]` |

### `GoNoGoDocuments` list

| Column | SP Type | Notes |
|---|---|---|
| `ScorecardId` | Single line | FK |
| `DocumentName` | Single line | — |
| `SharepointUrl` | Single line | — |
| `UploadedAt` | Date/Time | — |
| `UploadedByUserId` | Single line | — |

---

## Task 2 — API Endpoint Inventory

All endpoints are Azure Functions HTTP triggers at `apps/api/src/functions/bd/`.

### Scorecards

| Method | Path | Function File | Description |
|---|---|---|---|
| `GET` | `/api/bd/scorecards` | `getScorecards.ts` | List scorecards (role-scoped) |
| `POST` | `/api/bd/scorecards` | `createScorecard.ts` | Create new scorecard |
| `GET` | `/api/bd/scorecards/{id}` | `getScorecard.ts` | Get single scorecard |
| `PUT` | `/api/bd/scorecards/{id}` | `updateScorecard.ts` | Full update + version snapshot |
| `PATCH` | `/api/bd/scorecards/{id}/stage` | `transitionStage.ts` | Stage transition |
| `PATCH` | `/api/bd/scorecards/{id}/committee-scores` | `saveCommitteeScores.ts` | Intermediate save (no version) |
| `POST` | `/api/bd/scorecards/{id}/close-session` | `closeCommitteeSession.ts` | Close scoring + version |
| `POST` | `/api/bd/scorecards/{id}/decision` | `recordDecision.ts` | Record GO/NO-GO + handoff |
| `POST` | `/api/bd/scorecards/{id}/copy-documents-to-project` | `copyDocumentsToProject.ts` | Document copy on GO |
| `GET` | `/api/bd/scorecards/by-project/{projectId}` | `getScorecardByProject.ts` | Cross-module read (Project Hub) |

### Versions

| Method | Path | Function File | Description |
|---|---|---|---|
| `GET` | `/api/bd/scorecards/{id}/versions` | `getVersions.ts` | Get all version snapshots |
| `GET` | `/api/bd/scorecards/{id}/versions/{versionNum}` | `getVersion.ts` | Get specific version snapshot |

### Notifications

| Method | Path | Function File | Description |
|---|---|---|---|
| `POST` | `/api/bd/notifications` | `dispatchNotification.ts` | Send notification (email/Teams) |

### Analytics

| Method | Path | Function File | Description |
|---|---|---|---|
| `GET` | `/api/bd/analytics` | `getAnalytics.ts` | Aggregated analytics (BD Manager scoped) |

---

## Task 3 — Endpoint Implementations

### `GET /api/bd/scorecards` — `getScorecards.ts`

**Query params:** `bdManagerId` (optional), `stage` (optional, comma-separated), `sector` (optional), `region` (optional), `searchText` (optional).

**Role-scoping logic:**
```typescript
const role = getCallerBdRole(req); // from Bearer token claims
switch (role) {
  case 'BdManager':
    // Filter: BdManagerId = callerId
    break;
  case 'EstimatingCoordinator':
    // Filter: stage IN [Accepted, MeetingScheduled, CommitteeScoring, DecisionReached, HandedOff]
    break;
  case 'DirectorOfPreconstruction':
  case 'VPOfOperations':
    // No filter on owner — all scorecards
    break;
  case 'Admin':
    // Return ID + metadata only (no content fields)
    break;
  default:
    return unauthorizedResponse();
}
```

Returns: `IGoNoGoScorecard[]` (admin gets `IGoNoGoScorecardMeta[]` — id, leadName, stage, bdManagerId only).

### `POST /api/bd/scorecards` — `createScorecard.ts`

- Validates Bearer token → caller is BD Manager.
- Validates required fields (leadName, clientName, hbcRegion, projectSector, deliveryMethod, leadOriginDept, bdManagerId, directorOfPreconId).
- Sets `stage: 'Draft'`, `currentVersion: 1`.
- Creates version snapshot `VersionTriggerAction.InitialDraft`.
- Creates SharePoint list item in `GoNoGoScorecards`.
- Creates version snapshot item in `GoNoGoVersionSnapshots`.
- Returns created scorecard.

### `PUT /api/bd/scorecards/{id}` — `updateScorecard.ts`

- Validates caller can edit (BD Manager for own, Director for any).
- Requires `versionChangeComment` in body.
- Calls `buildVersionSnapshot()` logic server-side.
- Increments `currentVersion`.
- Upserts SharePoint list item.
- Creates new `GoNoGoVersionSnapshots` item.
- Returns updated scorecard.

### `PATCH /api/bd/scorecards/{id}/stage` — `transitionStage.ts`

- Validates caller role for requested transition.
- Calls `assertTransition(currentStage, targetStage)`.
- Updates `Stage` column on SharePoint list item.
- Returns updated `stage`.

### `POST /api/bd/scorecards/{id}/decision` — `recordDecision.ts`

- Validates caller is Director or VP.
- Validates `decision` (Go or NoGo) and `decisionNotes` are present.
- Records decision fields.
- On GO: assembles `IScorecardHandoffPackage`, triggers `copyDocumentsToProject`, fires notifications to Estimating Coordinator and Chief Estimator.
- On NO-GO: fires notification to BD Manager.
- Creates version snapshot.
- Transitions stage to `HandedOff` (GO) or `Closed` (NO-GO).

### `GET /api/bd/analytics` — `getAnalytics.ts`

**Query params:** `bdManagerId` (required), `dateRange` ('3m' | '6m' | '12m' | '24m' | 'all'), `sector` (optional), `region` (optional).

**Aggregation steps:**
1. Fetch all scorecards where `BdManagerId = bdManagerId` (enforced even for non-BD-Manager callers — the API adds this guard).
2. Apply date range filter on `CreatedAt`.
3. Apply sector/region filters if provided.
4. Compute:
   - `totalLeads`, `totalGo`, `totalNoGo`, `goRate`.
   - `avgOriginatorTotal`, `avgCommitteeTotal` from `CriteriaJson`.
   - `avgBidToDecisionDays` = avg days from `CreatedAt` to `DecisionRecordedAt`.
   - `scoresDistribution` buckets.
   - `criterionDistribution`: per-criterion avg scores across all scorecards.
   - `criterionDivergence`: per-criterion avg `|originator - committee|`.
   - `scoresPeriodBuckets`: group by quarter.
   - `bySector`, `byRegion` breakdowns.
5. Returns `IBdAnalyticsSummary` plus all breakdown arrays.

### `POST /api/bd/notifications` — `dispatchNotification.ts`

- Accepts `IScorecardNotification` payload.
- Routes to MS Graph API to send email **or** Teams adaptive card (configurable via `NOTIFICATION_CHANNEL` env var: `'email'` | `'teams'`).
- Idempotency key: `scorecardId + notificationType + timestamp`.

---

## Task 4 — Authentication & Authorization

All endpoints use the existing Bearer token validation middleware from prior phases:

```typescript
import { validateBearerToken, getCallerClaims } from '../../middleware/auth';

export default async function handler(req: HttpRequest, context: InvocationContext) {
  const claims = await validateBearerToken(req);
  if (!claims) return unauthorizedResponse();
  // ... proceed
}
```

`getCallerBdRole(claims)` maps AAD group membership or app role claims to `BdAccessRole`.

---

## Task 5 — Error Handling Standards

All endpoints return consistent error shapes:

```typescript
{
  error: string;         // human-readable message
  code: string;          // machine-readable code, e.g. 'INVALID_STAGE_TRANSITION'
  details?: unknown;     // optional debug details
}
```

HTTP status codes used: 200, 201, 400, 401, 403, 404, 409 (conflict/invalid transition), 500.

---

## Task 6 — SharePoint Setup Script

**File:** `apps/api/scripts/bd-sharepoint-setup.ts`

Creates all BD SharePoint lists with correct columns if they don't exist. Run once per environment. Referenced in deployment runbook.

```typescript
// Uses PnPjs with Managed Identity
// Idempotent: skips list/column creation if already exists
// Logs all created/existing resources
```

---

## Task 7 — Verification

```bash
pnpm turbo run build
pnpm turbo run type-check

# Unit tests (PH7-BD-9 will formalize):
# - getScorecards role-scoping logic
# - buildVersionSnapshot diff detection
# - getAnalytics aggregation math

# Integration tests:
# POST /api/bd/scorecards → 201 with created scorecard
# GET /api/bd/scorecards?bdManagerId={id} → list of own scorecards
# PUT /api/bd/scorecards/{id} → version incremented
# PATCH /api/bd/scorecards/{id}/stage → stage updated
# POST /api/bd/scorecards/{id}/decision (GO) → notifications fired, HandedOff
# GET /api/bd/analytics?bdManagerId={id} → aggregated data returned

# Security checks:
# All endpoints return 401 without Bearer token
# BD Manager cannot access other BD Manager's scorecards
# Admin receives metadata-only response
```

---

## Success Criteria

- [ ] BD-8.1 All 14 BD API endpoints exist as Azure Function HTTP triggers.
- [ ] BD-8.2 All endpoints validate Bearer token and return 401 without valid token.
- [ ] BD-8.3 `GET /api/bd/scorecards` correctly scopes results by caller role.
- [ ] BD-8.4 `POST /api/bd/scorecards` creates scorecard with version 1 and `Draft` stage.
- [ ] BD-8.5 `PUT /api/bd/scorecards/{id}` requires `versionChangeComment` and increments version.
- [ ] BD-8.6 `PATCH /api/bd/scorecards/{id}/stage` enforces valid transitions via `assertTransition`.
- [ ] BD-8.7 `POST /api/bd/scorecards/{id}/decision` fires GO notifications to Estimating Coordinator and Chief Estimator.
- [ ] BD-8.8 `GET /api/bd/analytics` enforces `bdManagerId` scoping regardless of caller role.
- [ ] BD-8.9 All endpoints return consistent error shapes with HTTP status codes.
- [ ] BD-8.10 Admin role receives metadata-only scorecard response (no content fields).
- [ ] BD-8.11 `GET /api/bd/scorecards/by-project/{projectId}` returns GO scorecard for cross-module use.
- [ ] BD-8.12 `bd-sharepoint-setup.ts` script creates all required lists idempotently.
- [ ] BD-8.13 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-7 complete
-->
