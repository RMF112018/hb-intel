# 05 — Graph-Only Cutover Plan

## Target outcome
A single backend-facing application data plane for SharePoint-backed Safety operations that uses Microsoft Graph where feasible, keeps managed identity as the privileged runtime identity, and removes the current dependency on the failing SharePoint REST repository seam.

## Stage A — Current mixed state
### Characteristics
- Graph already exists in the backend for some admin/identity seams.
- SharePoint/PnP exists for control-plane provisioning and topology checks.
- Safety ingestion still crosses into a SharePoint REST repository for operational reads/writes.
- The registered app currently holds broad permissions that are useful for staging/test stabilization.

### Risk
Operational success in one lane does not imply success in the other lane. The backend currently behaves like two partially overlapping backends.

## Stage B — Staging/test cutover posture
### Objective
Stabilize end-to-end Safety upload → parse → validate → commit using the Graph permissions that already exist, without blocking on final permission minimization.

### Required moves
1. Introduce a Graph-native Safety repository.
2. Move reporting-period read/write operations first.
3. Move ingestion-run, inspection-event, finding, and project-week mutations next.
4. Move upload-library file landing to Graph drive upload APIs.
5. Preserve the current list topology and GUID/descriptor authority until Graph IDs can be resolved and cached cleanly.
6. Keep the provisioning dry-run path intact while the repository is cut over.

### Staging/test permissions posture
Broad permissions are acceptable here if they are the shortest path to:
- proving the Graph repository end-to-end,
- eliminating the failing REST data-plane seam,
- and producing before/after write proof on the authoritative Safety lists.

### Staging/test success evidence
- `POST /api/admin/safety-records/ingest` succeeds end-to-end against real HBCentral/Safety targets.
- `delta > 0` is proven for `Safety Ingestion Runs`, `Safety Project Week Records`, `Safety Inspection Events`, and `Safety Findings`.
- upload-library landing file is created and linked correctly.
- no SharePoint REST data-plane calls remain in the Safety ingestion path.
- correlation logs clearly show Graph site/list/item operations and resulting created/updated IDs.

## Stage C — Pre-rollout tightening posture
### Objective
Reduce permissions from “convenient and broad” to “justified and governable”.

### Required moves
1. Inventory exactly which Graph permissions the new repository actually used.
2. Remove any app permission that is no longer needed after REST removal.
3. Evaluate whether site-level `Sites.Selected` is enough, or whether list/list-item selected scopes materially improve governance for this solution.
4. Grant only the specific sites/lists/roles needed for rollout.
5. Re-run end-to-end proof under the tightened permission set.
6. Fail rollout if the tightened posture has not been proven.

### Pre-rollout evidence
- permission matrix with required vs convenience permissions,
- successful ingest and upload under tightened permissions,
- explicit residual-risk statement if any broad permission remains temporarily unavoidable.

## Recommended implementation boundary
Do **not** mutate the existing REST repository into a hybrid adapter. Instead:
- create a new Graph repository implementation,
- introduce a stable repository interface for the Safety lane,
- cut `SharePointService.ingestSafetyWorkbook()` over to the Graph repository,
- then retire the REST repository from backend ingestion.

## Steady-state target posture
- Managed identity for privileged runtime access.
- Graph as the default application-facing integration surface for Safety list/file operations.
- Selected-scope permissions wherever they still satisfy the functional design.
- No Safety-ingestion dependency on SharePoint REST data-plane calls.
