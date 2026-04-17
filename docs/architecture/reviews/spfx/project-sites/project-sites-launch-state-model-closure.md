# Project Sites Launch-State Model Closure

## Objective

Replace coarse card-state inference (`hasSiteUrl + limited stage shortcut`) with an explicit, typed launch-state model that is more trustworthy and user-legible.

## New Launch-State Contract

Project Sites now defines and carries an explicit launch-status contract per normalized record:

- `ProjectSiteLaunchState`: `live | provisioning | archived | attention-needed`
- `ProjectSiteLaunchReasonCode`
- `IProjectSiteLaunchStatus` with:
  - `state`
  - `reasonCode`
  - `isLaunchable`
  - `userMessage`

Contract and record integration are in:

- `packages/spfx/src/webparts/projectSites/types.ts`

## Derivation Rules (Explicit, Typed)

Launch state is derived in one place:

- `packages/spfx/src/webparts/projectSites/projectSiteLaunchState.ts`

Ruleset summary:

1. Critical non-provisioning data issues -> `attention-needed`
2. Valid live site URL + inactive/archive stage -> `archived`
3. Valid live site URL + non-inactive stage -> `live`
4. No site URL + inactive/archive stage -> `archived` (not launchable)
5. No site URL + otherwise valid data -> `provisioning`

This replaces the previous simplistic shortcut and prevents defects from being mislabeled as provisioning.

## Card Behavior by State

`ProjectSiteCard` now renders from `entry.launchStatus` rather than local heuristic inference:

- `live`: launch action remains primary (`Open Site`)
- `archived`: explicit archived treatment with `View Archived Site` action when launchable
- `provisioning`: non-launchable with provisioning treatment and message
- `attention-needed`: non-launchable warning treatment with explicit guidance message

Users now get a clear “why” for non-launchable records via `launchStatus.userMessage`.

## Test Coverage Added/Updated

- `projectSiteLaunchState.test.ts`: explicit state derivation combinations
- `normalizeProjectSiteEntry.test.ts`: verifies launch-state outputs for malformed/provisioning/archived/live records
- `ProjectSiteCard.test.tsx`: verifies attention-needed and provisioning non-launchable behavior

## Trust Improvement Over Prior Heuristic

The model is now more trustworthy because:

- state meaning is centralized and typed (not spread across card rendering shortcuts)
- malformed data is separated from normal provisioning
- inactive/archive semantics are explicit and not conflated with launch readiness
- non-launchable records include user-legible reasons
