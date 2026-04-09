# Prompt 00 — Repo-Truth Architecture and Scope Lock Report

Date: 2026-04-09  
Plan: `docs/architecture/plans/MASTER/spfx/pnp/phase-01/Plan-Summary.md`  
Prompt: `docs/architecture/plans/MASTER/spfx/pnp/phase-01/Prompt-00-Repo-Truth-Architecture-and-Scope-Lock.md`

## 1. Locked architecture

### 1.1 Operator UI location

**Decision:** The PnP Operations operator surface will be implemented as a new lane inside the existing SPFx admin app (`apps/admin`, package `@hbc/spfx-admin`), not as a new standalone SPFx app.

**Locked placement:**
- Webpart shell/app host: `apps/admin`
- Route/lane model extension: existing lane registry and router in `apps/admin/src/router/`
- UI composition: existing `@hbc/ui-kit` admin shell patterns used by current operator lanes.

### 1.2 Backend execution seam

**Decision:** Privileged PnP extraction runs through the existing Admin Control Plane backend in `backend/functions`.

**Locked seam:**
- API entry family: `/api/admin/*` routes under `backend/functions/src/functions/adminApi/`
- Host composition root: `backend/functions/src/hosts/admin-control-plane/`
- Service container and adapter seam: `backend/functions/src/hosts/admin-control-plane/service-factory.ts` and `backend/functions/src/services/admin-control-plane/`.

PnP execution remains server-side only; no browser-side PnP runtime is allowed.

### 1.3 Job execution model

**Decision:** Use the existing asynchronous run lifecycle model (`launchRun` + run polling/history/detail), not synchronous blocking request/response.

**Locked lifecycle contract (existing model reused):**
1. client submits run request (`POST /api/admin/runs`),
2. backend creates run envelope and dispatches through adapter/orchestration seam,
3. client polls run detail/history (`GET /api/admin/runs`, `GET /api/admin/runs/{runId}`),
4. run outcome and artifacts are surfaced from audit/evidence/run stores.

### 1.4 Download artifact model

**Decision:** Outputs are emitted as explicit run-linked artifacts with manifest metadata, surfaced through existing evidence/run APIs.

**Locked output contract (Prompt-00 level):**
- each action produces raw export + normalized export + markdown summary,
- each run provides a deterministic artifact manifest,
- UI renders downloadable file list by run.

### 1.5 Authorization model

**Decision:** Reuse existing backend security gates and add PnP-ops-specific policy keys in admin access control.

**Locked security posture:**
- backend API continues to enforce delegated-scope + admin access checks,
- UI lane visibility/action execution will require explicit PnP-ops permission keys (to be introduced in later prompts),
- no secret/token exposure in client code.

### 1.6 Mock/dev mode

**Decision:** Reuse existing admin-control-plane adapter mode (`mock`/`real`) as the development seam for PnP operations.

Prompt-00 locks the pattern; implementation of concrete mock PnP action outputs is deferred to later prompts.

### 1.7 Logging and audit expectations

**Decision:** Reuse existing admin run/audit/evidence services as the system of record.

**Locked telemetry/audit posture:**
- run lifecycle recorded by run store,
- execution events recorded by audit store,
- artifact references recorded by evidence store,
- route-level error instrumentation reused from current admin API conventions.

## 2. Repo-truth rationale for app choice

## Why `apps/admin` and not `apps/hb-webparts`

`apps/hb-webparts` is the constrained homepage package for HB Central homepage webparts with `@hbc/ui-kit/homepage` doctrine and single-homepage `.sppkg` packaging responsibility. The requested PnP Operations surface is an operator/admin workflow, not a homepage content webpart.

`apps/admin` is already the SPFx operator console for IT Control Center with lane-based navigation and existing integration to `/api/admin/*` backend routes. Extending this app avoids creating a second admin surface and preserves existing admin-control-plane boundaries.

## 3. Locked first-wave scope

Prompt-00 scope is architecture lock only.

First-wave action family is locked to read-heavy export operations:
- site starting-point template extraction,
- list schema extraction,
- page/layout extraction.

Detailed action definitions are in `Prompt-00-V1-Action-Catalog-Note.md`.

## 4. Key risks

1. PnP execution prerequisites (module, auth posture, tenant consent) must be provisioned in backend runtime before live actions can pass.
2. Large artifact payloads require explicit offload/manifest discipline to avoid oversized inline responses.
3. Action-key drift between UI catalog and backend catalog will cause run launch failures unless one shared source of truth is introduced in Prompt-01/02.
4. Permission granularity must be explicit; defaulting to broad admin-only access may over-authorize operators.

## 5. Unresolved prerequisites

1. Final action-key namespace registration in admin action catalog implementation.
2. Backend host/runtime mechanism for executing PnP operations (PowerShell process boundary and credential source) to be finalized in Prompt-02.
3. Artifact storage locator strategy (inline threshold vs durable blob/file storage) for larger outputs to be finalized in Prompt-02/03.

## 6. Prompt-00 deliverable status

- Locked architecture: complete
- Chosen repo locations: complete
- Chosen backend pattern: complete
- First-wave action family lock: complete
- Deferred scope handoff: complete (see `Prompt-00-Deferred-Scope-Note.md`)
