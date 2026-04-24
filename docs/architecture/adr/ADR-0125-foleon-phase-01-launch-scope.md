# ADR-0125 — Foleon Phase 01 launch scope

- Status: Accepted
- Date: 2026-04-24
- Prompt authority: `docs/architecture/plans/MASTER/spfx/foleon/phase-01/wave-02/Prompt-03-Backend-Sync-Admin-Snapshots.md`
- Audit authority: `docs/architecture/plans/MASTER/spfx/foleon/phase-01/audit-reports/07-Deferred-Work-Production-Impact.md`, `08-Production-Readiness-Gap-Register.md`, `10-Recommended-Execution-Waves.md`

## Context

Foleon Phase 01 Wave 01 shipped the SPFx webpart, runtime binding proof, reader / origin / iframe hardening (Prompt 01), and the telemetry envelope + sink abstraction (Prompt 02). The remaining Prompt 03 objective is to determine the **minimum** backend / admin / sync architecture required for a governed production launch, and to document which work belongs to launch versus Wave 02.

Repo truth on `main` at the time of this ADR:

- No backend Azure Function host exists for Foleon. `backend/functions/src/hosts` contains only `admin-control-plane` and `project-setup`.
- No Foleon OAuth client or API integration anywhere in the repo.
- No `HB_FoleonProjectsRegistry` or `HB_FoleonAnalyticsSnapshots` schemas exist in code or docs.
- `HB_FoleonSyncRuns` schema is now codified by this change (Prompt 03) so the contract is stable before any writer ships.
- `apps/admin` exposes a generic admin webpart gated by `HB Intel Administrators` SharePoint group via `packages/auth/src/spfx/SpfxRbacAdapter.ts`. No Foleon-specific admin UI exists.
- The SPFx bundle at `apps/hb-intel-foleon/dist/hb-intel-foleon-app.js` contains no Foleon credentials (proven by `src/__tests__/bundleSecretsInvariant.test.ts`).

Prompt 03 explicitly allows scoping: "Implement **or explicitly scope** a backend sync route/job ... Document which pieces block launch vs Wave 02."

## Decision

Launch **Foleon Phase 01 under IT-managed list governance** with **no backend sync**, **no Foleon OAuth client**, **no Foleon-specific admin UI**, and **no Projects / Analytics lists**.

Wave 02 adds each of those capabilities behind the seams that Wave 01 already established (sink abstraction, sync-runs schema, gate/origin policy).

## Launch posture

The launch configuration is as follows.

### Tenant provisioning

Before the webpart is deployed to production pages, a SharePoint administrator provisions the following lists on `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral` using the dry-run plan emitted by `pnpm --filter @hbc/spfx-hb-intel-foleon provision:print`:

1. `HB_FoleonContentRegistry` — manually curated by marketing/IT at launch.
2. `HB_FoleonHomepagePlacements` — manually curated at launch.
3. `HB_FoleonInteractionEvents` — receives client-side telemetry writes.
4. `HB_FoleonSyncRuns` — provisioned empty; consumed by future Wave 02 writers.

### Content curation

At launch, `HB_FoleonContentRegistry` rows are created and maintained by members of the `HB Intel Administrators` SharePoint group. This is the current repo-wide admin group mapped via `packages/auth/src/spfx/SpfxRbacAdapter.ts` (`'HB Intel Administrators'` → `admin:read/write/delete/approve`, `feature:audit-logs`, etc.). No delegated marketing-admin role exists at launch.

### Telemetry

Client-side interaction events go directly to `HB_FoleonInteractionEvents` via the SharePoint sink shipped in Prompt 02 (`createSharePointEventSink`). The emitter is best-effort; failures are swallowed. Privacy envelope is tagged `telemetry-minimal` and redacts raw queries / URLs / user PII.

### Secrets posture

The SPFx bundle carries **no Foleon API credentials** and **no Foleon REST calls**. The `bundleSecretsInvariant.test.ts` asserts this on every build. The future backend sync host will consume Foleon OAuth client credentials from Azure Key Vault via Managed Identity (precedent in `backend/functions/src/config/wave0-env-registry.ts`); none of that flows to the client bundle.

### Admin access

Tenant admin access to Foleon lists is gated by SharePoint site permissions on `HBCentral` and Azure AD Admin / `HBIntelAdmin` role per `backend/functions/src/middleware/authorization.ts` `ADMIN_ROLES`. There is no Foleon-specific admin webpart or backend route at launch.

### Observability

Without a writer, `HB_FoleonSyncRuns` is empty at launch. The frontend ships `apps/hb-intel-foleon/src/services/FoleonSyncStatus.ts::deriveFoleonSyncStatus`, a pure reducer that will light up once Wave 02 writers produce rows. Until then, any caller of the utility reports `isStale: true` — the honest state.

## Wave 02 scope (explicitly not absorbed by this launch)

Each item below is acknowledged, named, and deferred. None is implemented as part of Prompt 03.

1. **Backend Foleon sync host.** New `backend/functions/src/hosts/foleon` host with:
   - Azure Function routes: `POST /api/foleon/sync/docs`, `POST /api/foleon/sync/projects`, `POST /api/foleon/sync/analytics` (admin-gated).
   - Timer triggers for scheduled Docs + Projects sync.
   - Foleon OAuth 2.0 client-credentials flow with tokens cached in memory and secrets in Key Vault.
   - Writes to `HB_FoleonSyncRuns` (shipped schema) and upserts into `HB_FoleonContentRegistry`, `HB_FoleonProjectsRegistry`.
2. **`HB_FoleonProjectsRegistry` schema.** Requires business-side field design (marketing-owner model, HB project-number mapping, department ownership). Will land with the Projects sync job.
3. **`HB_FoleonAnalyticsSnapshots` schema.** Requires Foleon Analytics API client and decisions on snapshot cadence, per-doc aggregates, and retention. Will land with an analytics dashboard effort.
4. **Admin webpart Foleon tab.** New tab in `apps/admin` that:
   - Displays sync health from `deriveFoleonSyncStatus`.
   - Exposes manual sync triggers calling the backend admin routes.
   - Surfaces delegated marketing-admin actions.
5. **Delegated admin RBAC.** Add `HBIntelFoleonAdmin` app role to the Entra admin scope and `foleon:admin` permission keys in `SpfxRbacAdapter.ts`. Backend adds `requireFoleonAdmin(claims, requestId)` middleware alongside `requireAdmin`.
6. **Homepage launcher registration.** Register the Foleon webpart with the HB Intel homepage launcher directory so it is discoverable inside the governed launcher.
7. **Backend event sink cutover.** Flip the telemetry emitter's `selectSink` in `apps/hb-intel-foleon/src/FoleonApp.tsx` from `createSharePointEventSink` to `createBackendEventSink({ baseUrl })` once `POST /api/foleon/events` is available. The seam already exists (Prompt 02); only the flag flip is pending.

## Consequences

Accepted tradeoffs at launch:

- **Stale content risk.** Without automated sync, the Content Registry depends on manual curation cadence. Editorial latency is the price of a zero-backend MVP.
- **No executive analytics.** No Foleon-sourced analytics dashboard ships in Phase 01. Marketing must use Foleon's own analytics UI until Wave 02.
- **No delegated admin.** IT or a designated admin group is the only privileged surface. Marketing cannot self-service registry changes.
- **Support tooling gap.** Without `HB_FoleonSyncRuns` writers, "when did we last sync?" is unanswerable until Wave 02 ships; until then the `deriveFoleonSyncStatus` utility truthfully reports stale.

Gains at launch:

- **Zero-secrets client.** The SPFx bundle carries no Foleon credentials. The invariant is automated (`bundleSecretsInvariant.test.ts`).
- **Stable contracts.** All four governed list schemas are codified, indexed, and tested before any writer lands — Wave 02 is a straight-through implementation, not a schema design exercise.
- **Seam completeness.** Telemetry sink abstraction, sync-status reducer, and authorization model are in place; Wave 02 flips switches rather than introducing new architecture.

## References

- Prompt text: `docs/architecture/plans/MASTER/spfx/foleon/phase-01/wave-02/Prompt-03-Backend-Sync-Admin-Snapshots.md`
- Audit reports 04–10 under `docs/architecture/plans/MASTER/spfx/foleon/phase-01/audit-reports/`
- Schema: `apps/hb-intel-foleon/src/schema/foleonListSchemas.ts`
- Sync-status utility: `apps/hb-intel-foleon/src/services/FoleonSyncStatus.ts`
- Telemetry sink: `apps/hb-intel-foleon/src/services/FoleonEventSink.ts`, `FoleonTelemetryEmitter.ts`
- Secrets invariant: `apps/hb-intel-foleon/src/__tests__/bundleSecretsInvariant.test.ts`
- RBAC: `packages/auth/src/spfx/SpfxRbacAdapter.ts`
- Backend authorization precedent: `backend/functions/src/middleware/authorization.ts`
- Backend env precedent: `backend/functions/src/config/wave0-env-registry.ts`
- List docs: `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-*.md`
