# Phase Summary — PriorityActionsRail Proof-Case Package

## Objective

Advance the hb-webparts rollout by migrating `PriorityActionsRailWebPart` as the next single-webpart proof case under the first-class SPFx loader-contract model.

## Current posture

The validated reference point is `HbHeroBannerWebPart`. The rollout handoff established that the preferred scale-out model is:

- one webpart at a time
- isolated proof-case Vite entry
- direct real manifest ID at compile time
- no neutral shell manifest
- no AMD shim generation
- tenant validation after package inspection

This package applies that same pattern to `PriorityActionsRailWebPart`.

## Target webpart

- **Name:** `PriorityActionsRailWebPart`
- **Manifest ID:** `b3f07190-79cf-437d-a1d6-ecbf3f77e616`
- **Component file:** `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- **Manifest file:** `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json`

## Package intent

This package is designed to:

1. generalize proof-case entry selection so the build does not remain hardcoded to the hero entry
2. create an isolated PriorityActionsRail proof-case entry
3. switch the single active proof-case target from hero to PriorityActionsRail
4. rebuild and inspect the package
5. perform tenant validation
6. refresh the rollout documentation

## Risk Exposure

### Primary risk
The build script may still contain hero-specific proof-case routing. If that remains hardcoded, switching the allowlist alone can produce a package whose loader contract is correct but whose bundle entry is wrong.

### Secondary risk
A version bump may be missed or malformed, causing an App Catalog upload rejection unrelated to loader behavior.

### Tertiary risk
The package may pass local build checks but still serve stale assets in SharePoint because of CDN/service-worker caching.

## Standards / Best Practices

- Keep the migration **single-target only**
- Keep the shell contract stable
- Prefer explicit proof-case entry routing over hidden inference
- Separate package-metadata fixes from loader-contract fixes
- Inspect the emitted `.sppkg` before judging tenant behavior
- Treat tenant runtime as the final acceptance gate

## Anti-patterns to avoid

- adding multiple IDs to the proof-case allowlist
- restoring the multi-manifest batch model early
- changing `ShellWebPart.ts` preemptively
- modifying unrelated homepage components
- treating console noise from other SharePoint webparts as proof-case failure

## Deliverables

- generalized proof-case entry routing
- `mount-priority-actions-rail-proof-case.tsx`
- active proof-case switched to `PriorityActionsRailWebPart`
- rebuilt `.sppkg`
- package inspection results
- tenant validation record
- refreshed rollout handoff naming the next target
