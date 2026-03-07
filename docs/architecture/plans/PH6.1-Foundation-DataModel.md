# PH6.1 — Foundation & Data Model Migration

**Version:** 2.0
**Purpose:** Eliminate `projectCode` from the entire codebase, establish the `projectId` / `projectNumber` dual-identifier model, update all TypeScript types in `@hbc/models`, scaffold the `@hbc/provisioning` package, and create the foundational ADRs before any other Phase 6 work begins.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** Produce a clean, type-safe codebase with zero references to `projectCode`, a correctly scaffolded `@hbc/provisioning` package, and locked ADRs that govern the data model and package boundary for all downstream Phase 6 tasks.

---

## Prerequisites

- Phase 5C must be fully complete and passing (`pnpm turbo run build` exits 0).
- Read `CLAUDE.md` v1.2, Blueprint §2i, §2j, and Foundation Plan Phase 6 before beginning.
- Confirm the current branch is `main` (or a Phase 6 feature branch created from `main`).

---

## 6.1.1 — Audit All `projectCode` References

Run the following commands from the monorepo root to produce a complete list of every file that must be updated:

```bash
grep -r "projectCode" --include="*.ts" --include="*.tsx" --include="*.json" \
  --exclude-dir=node_modules --exclude-dir=dist -l
```

Expected files (minimum — verify against live output):
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step1-create-site.ts` through `step7-hub-association.ts`
- `backend/functions/src/services/table-storage-service.ts`
- `backend/functions/src/services/signalr-push-service.ts`
- Any `@hbc/models` type definition files

Record the full list and do not proceed until every file is identified.

---

## 6.1.2 — Update `@hbc/models` Type Definitions

Locate the models package (check `packages/` directory for a `models` or `types` package). Update every provisioning-related interface as follows.

**Replace `IProvisionSiteRequest`:**
```typescript
/** Request body for triggering a new provisioning saga. */
export interface IProvisionSiteRequest {
  /** Immutable auto-generated project identifier (UUID v4). */
  projectId: string;
  /** Human-assigned project number. Format: ##-###-## (e.g. "25-001-01"). */
  projectNumber: string;
  /** Display name of the project. */
  projectName: string;
  /** UPN of the user who triggered provisioning (from validated Bearer token). */
  triggeredBy: string;
  /** Correlation ID for this provisioning run (UUID v4, generated at trigger time). */
  correlationId: string;
  /** Members to be added to the project SharePoint group. Array of UPNs. */
  groupMembers: string[];
  /** UPN of the Estimating Coordinator who submitted the Project Setup Request. */
  submittedBy: string;
}
```

**Replace `IProvisioningStatus`:**
```typescript
/** Authoritative provisioning run record stored in Azure Table Storage. */
export interface IProvisioningStatus {
  projectId: string;
  projectNumber: string;
  projectName: string;
  correlationId: string;
  overallStatus: 'NotStarted' | 'InProgress' | 'BaseComplete' | 'Completed' | 'Failed' | 'WebPartsPending';
  currentStep: number;
  steps: ISagaStepResult[];
  siteUrl?: string;
  triggeredBy: string;
  submittedBy: string;
  groupMembers: string[];
  startedAt: string;
  completedAt?: string;
  failedAt?: string;
  step5DeferredToTimer: boolean;
  retryCount: number;
  escalatedBy?: string;
}
```

**Replace `ISagaStepResult`:**
```typescript
export interface ISagaStepResult {
  stepNumber: number;
  stepName: string;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Failed' | 'Skipped' | 'DeferredToTimer';
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  /** Whether this step was skipped because idempotency check confirmed it was already done. */
  idempotentSkip?: boolean;
}
```

**Replace `IProvisioningProgressEvent`:**
```typescript
/** Payload sent to SignalR group on each step state change. */
export interface IProvisioningProgressEvent {
  projectId: string;
  projectNumber: string;
  projectName: string;
  correlationId: string;
  stepNumber: number;
  stepName: string;
  status: ISagaStepResult['status'];
  overallStatus: IProvisioningStatus['overallStatus'];
  timestamp: string;
  errorMessage?: string;
}
```

**Add new types:**
```typescript
/** Project Setup Request — submitted by Estimating Coordinator. */
export interface IProjectSetupRequest {
  requestId: string;           // UUID v4, auto-generated
  projectId: string;           // UUID v4, auto-generated on first submission
  projectName: string;
  projectLocation: string;
  projectType: string;
  projectStage: 'Pursuit' | 'Active';
  submittedBy: string;         // UPN of Estimating Coordinator
  submittedAt: string;         // ISO timestamp
  state: ProjectSetupRequestState;
  projectNumber?: string;      // ##-###-## — populated by Controller
  groupMembers: string[];      // UPNs selected during request
  clarificationNote?: string;  // populated when state = NeedsClarification
  completedBy?: string;        // UPN of Controller
  completedAt?: string;
}

export type ProjectSetupRequestState =
  | 'Submitted'
  | 'UnderReview'
  | 'NeedsClarification'
  | 'AwaitingExternalSetup'
  | 'ReadyToProvision'
  | 'Provisioning'
  | 'Completed'
  | 'Failed';

/** Audit record written to the SharePoint ProvisioningAuditLog list. */
export interface IProvisioningAuditRecord {
  projectId: string;
  projectNumber: string;
  projectName: string;
  correlationId: string;
  event: 'Started' | 'Completed' | 'Failed';
  triggeredBy: string;
  submittedBy: string;
  timestamp: string;
  siteUrl?: string;
  errorSummary?: string;
}
```

---

## 6.1.3 — Migrate All Backend References

For each file identified in step 6.1.1, perform the following replacements:

1. Replace every occurrence of `projectCode` (property name and variable) with `projectId`.
2. Update HTTP route parameters: `/provision-project-site` payload, `/provisioning-status/{projectCode}` → `/provisioning-status/{projectId}`, `/provisioning-retry/{projectCode}` → `/provisioning-retry/{projectId}`, `/provisioning-escalate/{projectCode}` → `/provisioning-escalate/{projectId}`.
3. Update Azure Table Storage partition/row key strategy: `partitionKey = projectId`, `rowKey = correlationId` (this supports multiple runs per project in history).
4. Update SignalR group name construction: `provisioning-${projectCode}` → `provisioning-${projectId}`.
5. Update all log statements to use `projectId` and include `correlationId`.

After all replacements, run:
```bash
grep -r "projectCode" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist .
```
Expected output: zero matches.

---

## 6.1.4 — Scaffold `packages/provisioning`

Create the `@hbc/provisioning` package directory and configuration files:

```bash
mkdir -p packages/provisioning/src
```

**`packages/provisioning/package.json`:**
```json
{
  "name": "@hbc/provisioning",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "vite build",
    "lint": "eslint src",
    "check-types": "tsc --noEmit",
    "test": "vitest run"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "vite": "catalog:",
    "vitest": "catalog:"
  }
}
```

**`packages/provisioning/src/index.ts`** (barrel — populated in PH6.9):
```typescript
// @hbc/provisioning — headless provisioning logic
// Populated in PH6.9. Do not import visual components here.
export * from './types.js';
export * from './api-client.js';
export * from './store.js';
export * from './hooks/useProvisioningSignalR.js';
```

**`packages/provisioning/src/types.ts`:**
```typescript
// Re-export provisioning types from @hbc/models for package consumers
export type {
  IProjectSetupRequest,
  IProvisionSiteRequest,
  IProvisioningStatus,
  IProvisioningProgressEvent,
  IProvisioningAuditRecord,
  ISagaStepResult,
  ProjectSetupRequestState,
} from '@hbc/models';
```

Add the package to `pnpm-workspace.yaml` if not auto-discovered, and add to `turbo.json` pipeline.

---

## 6.1.5 — Create ADRs

Create the following Architecture Decision Records before any implementation work begins:

**`docs/architecture/adr/0060-project-identifier-model.md`:**
```markdown
# ADR-0060: Project Identifier Model — projectId + projectNumber

**Status:** Accepted
**Date:** 2026-03-07

## Context
The existing codebase used a single `projectCode` field as the project identifier throughout
all backend functions, frontend stores, and Azure Table Storage keys. This created ambiguity
between the system-internal key and the human-assigned business reference number.

## Decision
`projectCode` is eliminated entirely. Two distinct identifiers are used:
- `projectId`: UUID v4, auto-generated, immutable, system-internal key.
- `projectNumber`: 9-digit string matching /^\d{2}-\d{3}-\d{2}$/, human-assigned by
  the Controller at provisioning approval, used in SharePoint URLs and external systems.

## Consequences
All backend routes, Azure Table keys, SignalR group names, and frontend stores use `projectId`.
All SharePoint site titles/URLs and external system references use `projectNumber`.
```

**`docs/architecture/adr/0061-provisioning-package-boundary.md`:**
```markdown
# ADR-0061: @hbc/provisioning Package Boundary

**Status:** Accepted
**Date:** 2026-03-07

## Context
Phase 6 introduces provisioning UI across seven apps. Shared logic risks duplication.

## Decision
`@hbc/provisioning` owns headless logic only: API client, SignalR hook, Zustand store slice,
TypeScript types. Visual UI components are built in each consuming app. This mirrors the
@hbc/auth / @hbc/shell pattern established in Phase 5.

## Consequences
The package has no React component exports. Apps must build their own visual surfaces
consuming the package's hooks and store.
```

---

## 6.1.6 — Verification Commands

```bash
# Zero projectCode references
grep -r "projectCode" --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist . | wc -l
# Expected: 0

# Build passes
pnpm turbo run build --filter=@hbc/models --filter=@hbc/provisioning \
  --filter=backend-functions
# Expected: EXIT CODE 0

# Type check passes
pnpm turbo run check-types --filter=@hbc/models --filter=@hbc/provisioning \
  --filter=backend-functions
# Expected: EXIT CODE 0

# ADRs exist
ls docs/architecture/adr/0060-project-identifier-model.md
ls docs/architecture/adr/0061-provisioning-package-boundary.md
# Expected: files present
```

---

## 6.1 Success Criteria Checklist

- [x] 6.1.1 Zero occurrences of `projectCode` in any `.ts` or `.tsx` file.
- [x] 6.1.2 `IProvisionSiteRequest`, `IProvisioningStatus`, `ISagaStepResult`, `IProvisioningProgressEvent`, `IProjectSetupRequest`, `ProjectSetupRequestState`, `IProvisioningAuditRecord` all defined and exported from `@hbc/models`.
- [x] 6.1.3 All backend HTTP routes updated to use `projectId`.
- [x] 6.1.4 Azure Table key strategy updated: `partitionKey = projectId`, `rowKey = correlationId`.
- [x] 6.1.5 SignalR group name format: `provisioning-${projectId}`.
- [x] 6.1.6 `packages/provisioning` scaffolded with `package.json`, `tsconfig.json`, `vite.config.ts`, and `src/index.ts`.
- [x] 6.1.7 PH6.1 ADR decisions captured with renumbered files `ADR-0076` and `ADR-0077` (preserving required PH6.1 content).
- [x] 6.1.8 `pnpm turbo run build` passes with zero errors.

## PH6.1 Progress Notes

- 6.1.1 completed: 2026-03-07 — baseline audit captured before edits:
  - ./backend/functions/src/functions/timerFullSpec/index.ts
  - ./backend/functions/src/functions/provisioningSaga/steps/step1-create-site.ts
  - ./backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts
  - ./backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts
  - ./backend/functions/src/functions/provisioningSaga/index.ts
  - ./backend/functions/src/services/table-storage-service.ts
  - ./backend/functions/src/services/signalr-push-service.ts
  - ./backend/functions/src/services/sharepoint-service.ts
  - ./packages/models/src/provisioning/IProvisioningFormData.ts
  - ./packages/models/src/provisioning/IProvisioning.ts
- 6.1.2 completed: 2026-03-07
- 6.1.3 completed: 2026-03-07
- 6.1.4 completed: 2026-03-07
- 6.1.5 completed: 2026-03-07
- 6.1.6 completed: 2026-03-07
- 6.1.7 completed: 2026-03-07 — ADR-0076, ADR-0077 created (PH6.1 ADR-0060/0061 content preserved)
- 6.1.8 completed: 2026-03-07

### Verification Evidence

- `grep -r "projectCode" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=dist . | wc -l` → 0 — PASS
- `pnpm turbo run build --filter=@hbc/models --filter=@hbc/provisioning --filter=@hbc/functions` → EXIT 0 — PASS
- `pnpm turbo run lint --filter=@hbc/models --filter=@hbc/provisioning --filter=@hbc/functions` → EXIT 0 — PASS
- `pnpm turbo run check-types --filter=@hbc/models --filter=@hbc/provisioning --filter=@hbc/functions` → EXIT 0 — PASS

<!-- IMPLEMENTATION PROGRESS & NOTES
PH6.1 implementation executed: 2026-03-07
Scope: projectId/projectNumber migration, provisioning model replacement, backend route/key/group updates, @hbc/provisioning scaffold, ADR-0076/ADR-0077, checklist closure.
Traceability:
- D-PH6-01 identifier model: projectId system key + projectNumber business key.
- D-PH6-02 package boundary: @hbc/provisioning exports headless logic/types only.
-->
