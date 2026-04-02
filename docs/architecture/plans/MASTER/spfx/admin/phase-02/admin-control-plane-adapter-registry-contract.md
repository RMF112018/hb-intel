# Admin Control Plane — Adapter Registry and Normalized Execution Result Contract

## Purpose

This document defines the contract model for adapter registration, invocation, and normalized results. It enables the control-plane orchestrator to route work through platform-specific adapters without each adapter inventing its own result shape.

The shared type surface lives in `@hbc/models/admin-control-plane`. This document is the human-readable reference.

## Adapter family matrix

9 adapter categories covering all platform interactions in the target architecture:

| Category | Key | Platform | Current repo anchor | Status |
|----------|-----|----------|---------------------|--------|
| Azure Deployment | `azure-deployment` | ARM / Bicep | Not yet implemented | Planned (Phase 6) |
| Entra / Graph | `entra-graph` | Microsoft Graph v1.0 | `graph-service.ts` | Partial (group lifecycle) |
| SharePoint ALM | `sharepoint-alm` | SharePoint App Catalog | `sharepoint-service.ts` (installWebParts) | Partial |
| SharePoint API Access | `sharepoint-api-access` | SharePoint API Permissions | Not yet implemented | Planned (Phase 8) |
| SharePoint Site | `sharepoint-site` | PnPjs / SharePoint REST | `sharepoint-service.ts` (site lifecycle) | Implemented |
| Validation / Probe | `validation-probe` | Multiple | `@hbc/features-admin` probes | Partial (2/5 live) |
| Table Storage | `table-storage` | Azure Table Storage | `table-storage-service.ts` | Implemented |
| SignalR | `signalr` | Azure SignalR | SignalR push service | Implemented |
| Notification | `notification` | Email / Teams webhook | Notification service | Implemented |

**Typed as**: `AdminAdapterCategory` enum in `@hbc/models`.

## Adapter descriptor

Each adapter is described by an `IAdminAdapterDescriptor`:

| Field | Type | Purpose |
|-------|------|---------|
| `adapterKey` | `string` | Unique key (e.g., `'entra-graph:group-lifecycle'`) |
| `category` | `AdminAdapterCategory` | Platform category |
| `label` | `string` | Human-readable name |
| `description` | `string` | What this adapter does |
| `domains` | `AdminDomain[]` | Which admin domains this adapter serves |
| `supportsDryRun` | `boolean` | Whether preview/dry-run is available |
| `supportsCompensation` | `boolean` | Whether rollback is available |
| `idempotent` | `boolean` | Whether re-invocation is safe |
| `operations` | `string[]` | Specific operations available |
| `implementationStatus` | `'implemented' \| 'partial' \| 'planned'` | Current state |

### Existing adapter mapping

| Current service | Adapter key | Category | Operations |
|----------------|-------------|----------|------------|
| `GraphService` | `entra-graph:group-lifecycle` | `entra-graph` | createSecurityGroup, addGroupMembers, getGroupByDisplayName, grantSiteAccess |
| `SharePointService` (site) | `sharepoint-site:lifecycle` | `sharepoint-site` | createSite, siteExists, deleteSite, associateHubSite, disassociateHubSite |
| `SharePointService` (content) | `sharepoint-site:content` | `sharepoint-site` | createDocumentLibrary, uploadTemplateFiles, createDataLists |
| `SharePointService` (permissions) | `sharepoint-site:permissions` | `sharepoint-site` | setGroupPermissions, assignGroupToPermissionLevel |
| `SharePointService` (ALM) | `sharepoint-alm:package-install` | `sharepoint-alm` | installWebParts |
| `SharePointService` (audit) | `sharepoint-site:audit` | `sharepoint-site` | writeAuditRecord |
| `TableStorageService` | `table-storage:run-persistence` | `table-storage` | upsertProvisioningStatus, getLatestRun, listAllRuns, escalateProvisioning |
| `SignalRPushService` | `signalr:progress` | `signalr` | pushProgress, closeGroup |
| `NotificationService` | `notification:dispatch` | `notification` | dispatch |

## Invocation context

When the orchestrator invokes an adapter, it passes an `IAdminAdapterInvocationContext`:

| Field | Type | Purpose |
|-------|------|---------|
| `runId` | `string` | Run this invocation belongs to |
| `stepNumber` | `number` | Step number within the run |
| `actor` | `IAdminActorContext` | Operator who initiated the run |
| `dryRun` | `boolean` | Whether this is a preview invocation |
| `isRetry` | `boolean` | Whether this is a retry of a previously failed step |
| `retryAttempt` | `number` | Attempt number (0 = first) |
| `correlationId` | `string` | Tracing correlation ID |
| `input` | `Record<string, unknown>` | Domain-specific input payload |
| `resolvedConfig` | `Record<string, unknown>` | Config/standards values pre-resolved by orchestrator |

The invocation context provides everything the adapter needs. Adapters do not look up run, actor, or config state themselves — the orchestrator resolves and passes it.

## Normalized adapter result

All adapters return `IAdminAdapterResult` regardless of platform:

| Field | Type | Purpose |
|-------|------|---------|
| `adapterKey` | `string` | Which adapter produced this result |
| `outcome` | `AdminAdapterOutcome` | Success, SuccessWithWarnings, Failed, Skipped, DryRunComplete |
| `summary` | `string` | Human-readable summary |
| `durationMs` | `number` | Execution duration |
| `warnings` | `IAdminAdapterWarning[]` | Non-blocking warnings |
| `issues` | `IAdminAdapterIssue[]` | Blocking issues (on failure) |
| `remediationHints` | `IAdminRemediationHint[]` | Suggested fixes |
| `evidenceRefs` | `IAdminEvidenceReference[]` | Evidence produced |
| `adapterSpecificData` | `Record<string, unknown> \| null` | Platform-specific output (passthrough) |
| `deduplicatedInvocation` | `boolean` | Whether duplicate detection skipped work |

### Outcome classifications

| Outcome | Meaning | Run progression |
|---------|---------|----------------|
| `Success` | Completed without issues | Continue to next step |
| `SuccessWithWarnings` | Completed but with non-blocking warnings | Continue; warnings logged |
| `Failed` | Blocking error | Step fails; run may retry or compensate |
| `Skipped` | Already completed or not applicable | Continue (idempotent retry) |
| `DryRunComplete` | Preview analysis completed, no state changes | Return preview results |

**Typed as**: `AdminAdapterOutcome` enum in `@hbc/models`.

## Warning / issue / remediation DTOs

### Warnings (`IAdminAdapterWarning`)

Non-blocking observations. Examples:
- "Group already exists, membership updated" (idempotent re-run)
- "Site template version is older than current standard"

### Issues (`IAdminAdapterIssue`)

Blocking problems that caused failure. Each issue includes a `transient` flag:
- `transient: true` — retry may help (network timeout, throttling, temporary service outage)
- `transient: false` — retry will not help without intervention (missing permissions, schema mismatch)

### Remediation hints (`IAdminRemediationHint`)

Actionable guidance with audience targeting:

| Audience | Examples |
|----------|---------|
| `operator` | "Retry after verifying network connectivity" |
| `it-admin` | "Grant Group.ReadWrite.All to the Managed Identity" |
| `devops` | "Set GRAPH_GROUP_PERMISSION_CONFIRMED=true in Function App configuration" |

Each hint may include a `documentationUrl` linking to a runbook or setup guide.

## Preview / dry-run expectations

Adapters that support dry-run (`supportsDryRun: true`) must:
1. Accept `invocationContext.dryRun === true`
2. Analyze what would change without making state changes
3. Return `outcome: 'DryRunComplete'`
4. Populate `adapterSpecificData` with the impact analysis
5. Produce an `IAdminEvidenceReference` of type `preview-result`

Adapters that do not support dry-run (`supportsDryRun: false`) must reject dry-run invocations with a clear error.

## Evidence linkage

Adapters produce evidence references in the `evidenceRefs` array. The orchestrator:
1. Persists the evidence payload to the evidence store
2. Attaches the `IAdminEvidenceReference` to the step result and audit record
3. The adapter does not manage evidence storage — it produces the payload and reference metadata

This preserves the separation between adapter execution and evidence persistence (P2-D11).

## Guidance for future registry implementation (Phase 3)

Phase 3 should implement an adapter registry that:
1. Maintains a collection of `IAdminAdapterDescriptor` entries
2. Resolves which adapter handles a given action + step combination
3. Constructs `IAdminAdapterInvocationContext` from the run and step state
4. Invokes the adapter and captures the `IAdminAdapterResult`
5. Maps adapter outcomes to step status updates
6. Routes warnings, issues, and remediation hints to the appropriate display/notification channels

The registry should use the existing service factory pattern (`service-factory.ts`) for adapter lifecycle management, extending it with descriptor metadata.

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Run model](admin-control-plane-run-model.md) | Run envelope, step results — adapter results map to step results |
| [API contract catalog](admin-control-plane-api-contract-catalog.md) | Preview responses use adapter dry-run results |
| [Audit/evidence contracts](admin-control-plane-audit-evidence-and-config-contracts.md) | Evidence references produced by adapters |
| [Action catalog](admin-control-plane-action-catalog.md) | Actions reference adapter capabilities |
| [Target architecture](../admin-spfx-target-architecture.md) | Adapter layer in the architecture diagram |
| [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) | Adapters own platform-specific execution |
| `@hbc/models/admin-control-plane` | Shared type surface |
