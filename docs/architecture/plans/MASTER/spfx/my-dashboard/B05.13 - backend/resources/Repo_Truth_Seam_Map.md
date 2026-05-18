# Repo-Truth Seam Map

## Purpose

This map instructs the code agent where to inspect before making changes and what must remain behaviorally stable.

---

## 1. Current Runtime Read Path

### Inspect first
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts`
- `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts`
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`

### Preserve
- route path,
- envelope shape,
- card loading posture,
- current My Projects item semantics.

---

## 2. Current Reconciliation Semantics

### Source file
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`

### Preserve
- `projects:{id}` and `legacy:{id}` record keys,
- explicit Registry match precedence,
- fallback merge by project number/year unique match,
- Projects role assignment visibility for merged/project-backed rows,
- Registry role assignment visibility for legacy-only rows,
- action builder behavior,
- warning codes.

---

## 3. Graph Authorization

### Inspect
- `backend/functions/src/services/legacy-fallback/graph-list-client.ts`
- `backend/functions/src/services/legacy-fallback/federated-graph-token-provider.ts`
- `backend/functions/src/services/legacy-fallback/hosting-config.ts`

### Preserve
- federated token posture,
- no raw token logs,
- existing failure-stage classification compatibility.

---

## 4. Timer/Admin Patterns

### Inspect
- `backend/functions/src/functions/legacyFallbackDiscovery/index.ts`

### Reuse
- timer scheduling style,
- admin route authorization style,
- telemetry style,
- operator-triggered rerun pattern.

---

## 5. Schema Provisioning Patterns

### Inspect
- `scripts/verify-my-project-role-fields.ts`
- `scripts/provision-my-projects-source-list-schema.ts`
- `docs/how-to/administrator/provision-my-projects-source-list-schema.md`

### Reuse
- read-only verification first,
- explicit `--apply`,
- wrong-type drift as blocker,
- structured JSON reports,
- operator command ledger/documentation posture.

---

## 6. Source List Schema

### Inspect
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`

### Use for
- selected fields,
- current indexed fields,
- merge key decisions,
- registry behavior and source provenance.

---

## 7. Files Likely to Be Added or Modified

### New backend service tree
- `backend/functions/src/services/my-projects-projection/**`

### New backend functions
- `backend/functions/src/functions/myProjectsProjectionWebhook/index.ts`
- `backend/functions/src/functions/myProjectsProjectionSyncWorker/index.ts`
- `backend/functions/src/functions/myProjectsProjectionSubscriptionRenewal/index.ts`
- `backend/functions/src/functions/myProjectsProjectionDriftAudit/index.ts`
- `backend/functions/src/functions/myProjectsProjectionInactivePurge/index.ts`
- `backend/functions/src/functions/myProjectsProjectionAdmin/index.ts`

### Read-model expansion
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-projection-read-model-provider.ts`
- updates to resolver/config
- possible shared domain extraction

### Scripts
- `scripts/verify-my-projects-registry-schema.ts`
- `scripts/provision-my-projects-registry-schema.ts`
- `scripts/run-my-projects-projection-seed.ts`
- `scripts/run-my-projects-projection-rebuild.ts`
- `scripts/verify-my-projects-projection-readiness.ts`

### Docs
- reference docs for schema,
- operator runbooks,
- telemetry/KQL reference,
- migration/evidence docs.

---

## 8. Agent Guardrail

Do **not** re-read files that are still within the agent’s current context or memory.  
Re-open only files that:
- changed since last read,
- are needed for a new precise seam,
- or were not previously inspected in the current work session.
