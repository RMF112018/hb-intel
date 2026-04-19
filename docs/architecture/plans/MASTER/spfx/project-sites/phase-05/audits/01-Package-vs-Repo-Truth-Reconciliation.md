# Package-vs-Repo Truth Reconciliation

## Audit posture

This document compares the two attached packages against the live `main` branch and classifies each major claim as one of the following:

- **validated** — materially correct and still useful,
- **underdeveloped** — directionally correct but too shallow,
- **obsolete** — once true, no longer the active blocker,
- **misleading** — partially correct but framed in a way that can drive the wrong remediation,
- **missed** — important active issue not surfaced by the attached packages.

## Reconciliation summary

| Attached package claim/theme | Classification | Reconciliation result |
|---|---|---|
| Earlier zero-registration / zero-indexed-jobs defect was the main blocker | **obsolete** | Repo evidence indicates registration materially improved after the packaging changes. It is no longer the best current blocker statement. |
| First hosted SharePoint persistence boundary is the next blocker | **validated** | `startSyncRun()` remains the first durable write boundary and still needs hosted proof. |
| Artifact is broader than the objective | **validated** | Still true. Shared host entrypoint and unrelated workspace dependencies remain in scope. |
| Hosting/deployment docs are inconsistent | **validated** | Still true, and more severe than described because repo truth mixes Flex-style deployment storage, dedicated defaults, and conflicting operator instructions. |
| Split legacy fallback from shared host | **underdeveloped** | Correct direction, but the attached package missed the more specific repo-truth contradiction between default entrypoint registration and admin/review route registration. |
| Harden hosted validation / closure proof | **validated** | Correct and still needed. |
| Close sync-run persistence boundary | **validated** | Correct and still needed. |
| Minimize artifact composition | **validated** | Correct and still needed. |

## What the attached packages got right

### 1. They correctly stopped treating the old registration failure as the only story

The attached audit package properly recognized that the packaging and hosted registration situation had changed and that the next likely blocker sits at the first SharePoint-backed persistence boundary.

### 2. They correctly identified artifact breadth as an architectural defect, not just an optimization opportunity

The attached packages correctly observed that the current artifact is not purpose-fit to the legacy fallback lane because it still relies on a shared host surface and unrelated workspace packages.

### 3. They correctly identified deployment-model truth as a closure issue

The attached package correctly recognized that a repo cannot safely close this lane while manual deployment instructions, workflow expectations, and host model assumptions disagree.

## Where the attached packages were too shallow

### 1. They did not separate “registration of discovery endpoints” from “registration of review/admin endpoints”

The attached packages focused on `legacyFallbackDiscoveryRun` and `legacyFallbackDiscoveryTimer`, but they did not fully surface that the repo also documents and implements a review/override API surface that registers through the admin API lane, not through the default shared entrypoint.

That is an active reconciliation issue, not just a future cleanup task.

### 2. They did not inspect the project-index mapping seam deeply enough

The attached packages focused on deployment, packaging, and persistence, but they missed a correctness defect in the project-index provider itself: field resolution is called, but the returned field names are not actually used when mapping rows.

That means successful hosted execution could still produce degraded or misleading matching outcomes.

### 3. They treated sync-run persistence primarily as a single boundary rather than also a schema/observability contract

The attached packages correctly focused on `startSyncRun()`, but they did not fully surface that the service computes richer run-level operational counters than the shared model/list schema currently persists as first-class state.

## What the attached packages missed entirely

### Missed issue A — route-registration mismatch between documented legacy fallback admin surface and default deployed entrypoint

The repo has:

- a shared default entrypoint at `backend/functions/src/index.ts`,
- a dedicated admin-control-plane host at `backend/functions/src/hosts/admin-control-plane/index.ts`,
- and `legacy-fallback-routes.ts` imported via `backend/functions/src/functions/adminApi/index.ts`.

The attached packages did not make this a first-class active finding. They should have.

### Missed issue B — project-index provider ignores its own resolved field names

This was not surfaced at all in the attached materials.

### Missed issue C — prompt-phase residue still exists inside current code and operational docs

Multiple repo files still frame behavior as “Prompt 01 / Prompt 03 / Prompt 07” or say implementation is deferred, even though the user’s stated objective for this replacement package explicitly rejects deferral for required work. The attached packages did not cleanly call this out as a repo-truth clarity issue.

## Sequencing corrections to the attached prompt package

The attached prompt set had a sensible high-level sequence, but it needs three upgrades:

1. **Field-resolution correctness** must be inserted early, before trusting match outcomes.
2. **Host composition / route registration truth** must explicitly reconcile discovery routes and review/admin routes, not just “split the host.”
3. **Sync-run schema/observability hardening** must be added as its own closure unit instead of being treated as a side effect of persistence closure.

## Final reconciliation verdict

The attached packages are not junk. They are simply not deep enough for closure.

They should be treated as:

- a useful partial precursor,
- no longer authoritative,
- and insufficient to drive a local code agent through the full set of active seams that still matter now.
