# Wave 6 Closed Decisions

## W6-OD-001 — Shared model strategy

**Decision:** Use existing `packages/models/src/pcc/TeamAccess.ts` as the shared vocabulary. Add app-local view models/adapters for richer UI behavior unless the local repo-truth gate proves a shared model gap that cannot be represented app-locally.

**Guardrail:** Do not rewrite shared Team & Access model vocabulary casually.

## W6-OD-002 — Backend read-model posture

**Decision:** Start fixture-first. Optional Prompt 06 may add a read-only `team-access` backend route and SPFx client method because the provider/interface/model map already support Team & Access but the HTTP route/client method do not.

**Guardrail:** Prompt 06 is GET-only and read-only. No write routes.

## W6-OD-003 — Backend opt-in pattern

**Decision:** Team & Access must follow the Project Home explicit backend opt-in pattern if backend wiring is added.

**Guardrail:** Default mount remains fixture. Backend mode requires explicit `readModelMode: 'backend'` and `backendBaseUrl`.

## W6-OD-004 — Approve/reject/comment controls

**Decision:** Controls may be rendered as local preview/read-model controls only. They may show selected local visual state in tests, but may not persist or execute.

**Guardrail:** Controls must clearly communicate “Preview only” and “No permission change has been executed.”

## W6-OD-005 — Approved pending execution meaning

**Decision:** `approved-pending-execution` means business review is approved and manual IT execution remains pending. No permission mutation has occurred.

## W6-OD-006 — Admin/IT execution queue

**Decision:** Visual/read-model queue only in Wave 6. Future backend workflow is `backend-gated-later`.

## W6-OD-007 — Request data storage

**Decision:** No persistence in Wave 6. Request data is fixture/read-model/local UI state only.

## W6-OD-008 — Priority Actions Rail

**Decision:** Do not expand Priority Actions Rail in Wave 6 unless adding metadata-only Team & Access links is explicitly scoped later. Existing Wave 5 rail already maps Team & Access-related actions to `access-requests`.

## W6-OD-009 — Unauthorized / missing config / backend unavailable states

**Decision:** Use existing `PccPreviewState` state catalog. Unauthorized persona displays access-manager restrictions without treating persona as auth. Missing config and backend unavailable remain safe state displays.

## W6-OD-010 — Allowed vs forbidden files

**Decision:** Implementation prompts define narrow allowed file lists. Package, manifest, workflow, lockfile, deployment, tenant, backend write, Graph/PnP/SharePoint REST, Procore, Document Crunch, Adobe Sign, provisioning, Site Health repair, and permission execution files are forbidden.
