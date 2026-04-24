# 07 — Prioritized Remediation Plan

## R-01 — Prove and restore the live Safety Graph data plane
**Closes:** G-03, G-04  
**Priority:** Immediate  
**Type:** Refinement + targeted closure

### Implementation direction
- instrument the live Graph reporting-period read path with exact site/list/identity diagnostics
- verify descriptor/guid overlay resolution
- verify runtime identity selection
- verify deployed artifact equals current backend source
- rerun preview and ingest with evidence capture

### Expected impact
Restores trust in the actual blocker diagnosis.

## R-02 — Make parser-derived values authoritative
**Closes:** G-05, G-06  
**Priority:** Immediate  
**Type:** Refinement

### Implementation direction
- stop allowing request-context `inspectionDate` / `inspectionNumber` to override parsed values
- return mismatch diagnostics instead
- expose source-of-truth indicators in preview
- preserve fallback compatibility only for legacy/no-marker templates

### Expected impact
Raises correctness and makes the workbook contract meaningful.

## R-03 — Lock the Safety ingestion lane as Graph-only direction of record
**Closes:** G-04, G-11  
**Priority:** High  
**Type:** Structural direction

### Implementation direction
- explicitly retire remaining Safety data-plane dependence on SharePoint REST/PnP
- preserve Graph repository/data-plane seam
- mark legacy SharePoint repository paths as retired or unsupported for Safety ingest

### Expected impact
Prevents backsliding and simplifies permission reasoning.

## R-04 — Rebuild deployment packaging around the actual function app
**Closes:** G-01, G-10  
**Priority:** High  
**Type:** Structural redesign

### Implementation direction
- build from `backend/functions`
- produce a package containing only runtime-required backend content
- add artifact manifest + checksum
- add post-deploy route/version proof
- align CI with Flex Consumption one-deploy expectations

### Expected impact
Eliminates the most plausible repo/live drift cause.

## R-05 — Split public liveness from privileged readiness
**Closes:** G-07  
**Priority:** High  
**Type:** Structural refinement

### Implementation direction
- keep a minimal anonymous liveness endpoint
- move detailed readiness and permission posture behind authenticated admin access or environment gating

### Expected impact
Improves security without sacrificing operations.

## R-06 — Tighten production CORS posture
**Closes:** G-08  
**Priority:** Medium  
**Type:** Refinement

### Implementation direction
- constrain to exact trusted origins
- verify enforcement layer
- avoid broad wildcard patterns in credentialed admin scenarios

### Expected impact
Reduces browser-surface risk.

## R-07 — Separate staging stabilization permissions from rollout permissions
**Closes:** G-09  
**Priority:** High  
**Type:** Rollout governance

### Implementation direction
- keep broad Graph permissions only as long as needed for stabilization
- map actual API calls to minimum required permissions
- choose rollout-time narrowed permission model
- prove backend behavior under the tightened set before rollout

### Expected impact
Converts a staging convenience posture into a production posture.

## R-08 — Decompose `SharePointService`
**Closes:** G-02, G-11  
**Priority:** Medium  
**Type:** Structural redesign

### Implementation direction
Create clearer boundaries:
- Safety ingestion application service
- Safety provisioning/control-plane service
- Graph data-plane service
- SharePoint/PnP provisioning service

### Expected impact
Improves maintainability, testability, and cutover clarity.

