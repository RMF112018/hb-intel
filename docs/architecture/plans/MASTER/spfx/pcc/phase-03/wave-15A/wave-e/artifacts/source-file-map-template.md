# Source File Map Template — Wave E

## Branch / Version

- Branch:
- HEAD:
- PCC package version:
- Lockfile MD5:

## Shared State Sources

| File | Owner | Purpose | Change needed? | Notes |
|---|---|---|---:|---|
| `apps/project-control-center/src/ui/PccPreviewState.tsx` | PCC UI | State display primitive |  |  |
| `apps/project-control-center/src/ui/PccDisabledAffordance.tsx` | PCC UI | Disabled action primitive |  |  |
| `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts` | PCC UI | Surface posture copy |  |  |
| `apps/project-control-center/src/api/pccReadModelStateMapping.ts` | PCC API client seam | Source-status mapping |  |  |

## Surface State Sources

| Surface | Files | State/language ownership | Change needed? |
|---|---|---|---:|
| Project Home |  |  |  |
| Team & Access |  |  |  |
| Documents |  |  |  |
| Project Readiness |  |  |  |
| Approvals |  |  |  |
| External Systems |  |  |  |
| Control Center Settings |  |  |  |
| Site Health |  |  |  |
| Router fallback | `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` | Fallback state |  |

## Tests

| Test file | Coverage | Change needed? |
|---|---|---:|

## Forbidden Token Hits

| File | Token | User-visible? | Action |
|---|---|---:|---|

## Decisions

| Decision | Rationale | Owner |
|---|---|---|
