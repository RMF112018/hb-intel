# Prompt 03 — Implement Registry-Aware Foleon Manager Two-Tab UI

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Implement the Foleon Manager two-tab shell after registry provisioning, registry runtime bridge implementation, and Manager readiness remediation.

Tabs:

```text
Homepage Foleon Content
Config
```

The Config tab must be registry-aware. It must not create a new isolated configuration store.

The two-tab UI must consume the completed registry-backed readiness model. Do not redo the registry provisioning, registry runtime bridge, or Manager readiness-state work unless repo truth proves a defect.

## Current Completed Work to Preserve

Treat these commits as current repo truth:

| Commit | Completed Work |
| --- | --- |
| `9b32ec870` | Provisioned the **HB Platform Configuration Registry** in HBCentral, including schema, fields, indexes, safe baseline seed records, validation script, proof artifacts, and registry documentation. |
| `69aa206f7` | Updated the registry with confirmed Foleon list GUIDs and backend URL values: content registry, homepage placements, interaction events, sync runs, `BackendFunctionAppUrl`, and `FoleonApiBaseUrl`. |
| `24ce06d54` | Added the Foleon registry runtime bridge so valid central registry values can fill missing runtime config while preserving explicit page/webpart overrides. |
| `088788344` | Bumped/marked the SPFx Foleon package for the registry bridge runtime, moving the Foleon package to the next SharePoint-compatible version. |
| `1336c4dbb` | Updated the `FoleonApiResource` registry item to `api://08c399eb-a394-4087-b859-659d493f8dc7` and enhanced registry update/validation tooling to support that targeted value. |
| `0bcec4289` | Implemented registry-backed Foleon Manager readiness, including separate token-provider, token-acquisition, read, write, and sync readiness states, plus safe read-only backend probes. |

## Required Preservation Rules

Do **not** collapse these readiness states into a single `ready` flag:

```text
registry readiness
list binding readiness
backend URL readiness
API resource readiness
token-provider readiness
token-acquisition readiness
read-path readiness
write-path readiness
sync-path readiness
```

Preserve this rule:

```text
writePathReady must remain false until backend safe-config and route authorization are proven.
```

Do not treat `apiBaseUrl` alone as sufficient to unlock hosted Manager writes.

Do not expose secrets, raw tokens, unsafe runtime values, raw backend URLs, raw API resource values, or sensitive identifiers in standard UI proof.

If a diagnostic value is useful but sensitive, show:

```text
Configured / Missing
Valid / Warning / Blocked
Source: Override / Registry / Default / Missing / Blocked
Redacted fingerprint where already supported by repo truth
```

## Required Preconditions

Before implementing the UI, verify or document:

```text
HB Platform Configuration Registry exists or blocker documented
Registry validation tooling exists
Registry reader/runtime bridge exists
Manager load/write-readiness blocker has been remediated or documented
Readiness model exposes the split states listed above
```

If these prerequisites are missing because the local branch is stale, stop and report that the local branch must be updated before Prompt 03 can be executed.

## Files to Inspect

Inspect current repo truth before changing code.

Start with:

```text
apps/hb-intel-foleon/src/pages/manage/**
apps/hb-intel-foleon/src/components/**
apps/hb-intel-foleon/src/types/foleon-management.types.ts
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
apps/hb-intel-foleon/src/runtime/**
apps/hb-intel-foleon/src/pages/__tests__/**
apps/hb-intel-foleon/src/schema/**
tools/spfx-shell/src/webparts/shell/foleonRuntimeConfigBridge.ts
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
apps/hb-webparts/src/webparts/hbHomepage/wiring/foleonHomepageConfig.ts
apps/hb-webparts/src/webparts/hbHomepage/zones/FoleonHomepageLaneHost.tsx
docs/reference/spfx-surfaces/**
docs/reference/ui-kit/doctrine/**
docs/architecture/plans/MASTER/platform/config-registry/**
docs/architecture/plans/MASTER/spfx/foleon/**
```

Do not assume the specific component/file names remain unchanged. Follow repo truth.

## Target UX

Implement a professional, registry-aware Manager interface with two primary tabs:

```text
Homepage Foleon Content
Config
```

The UI should be compact, executive-quality, and consistent with the HB/SPFx design doctrine already in the repo.

The implementation should reorganize existing Manager functionality rather than replacing it with a new disconnected workflow.

## Tab 1 — Homepage Foleon Content

Purpose:

Marketing users should manage the homepage Foleon reader content without editing raw SharePoint lists.

Supported lanes:

```text
Project Spotlight
Company Pulse
Leadership Message
```

### Required Sections

#### 1. Lane Status Overview

Create a clear overview of the three homepage lanes.

Each lane should show:

```text
lane name
reader key / lane key where appropriate
current state: Live / Preview / Blocked / Empty / Config Incomplete
active content title
active Foleon doc/publication ID, redacted or shortened if needed
placement status
display window
validation status
publish status
next required action
```

#### 2. Lane Cards

Provide a lane card for each:

```text
Project Spotlight
Company Pulse
Leadership Message
```

Each lane card should show:

```text
current active edition
staged/draft item if available
last published date if available
homepage eligibility
active edition status
display dates
placement key/status
preview/live/blocked state
validation warnings
```

Actions should be visible only where supported by existing permissions/readiness:

```text
View
Edit
Validate
Publish
Suppress / Archive
Open Foleon
Open Preview
Manage Placement
```

Disable actions when readiness or authorization is insufficient and show a direct reason.

#### 3. Content Registry Table

Preserve or improve the existing content registry table.

Default grouping/filtering should prioritize:

```text
active or staged records
homepage-eligible records
records grouped by lane
blocked records requiring action
recently updated records
```

Table fields should include, as repo data supports:

```text
title
reader lane
Foleon doc/publication ID
content type
publish status
visibility
homepage eligible
active edition
display from / through
validation status
sync/source status
last updated
```

#### 4. Create/Edit Content Drawer or Panel

Preserve the existing create/edit workflow if present. Organize fields into logical groups:

```text
Content identity
Foleon source
Homepage lane / placement
Visibility and publishing
Display dates
Validation and readiness
Preview copy / summary
Admin notes
```

Do not invent new required fields unless existing data model requires them.

#### 5. Placement Alignment Panel

Expose placement state in a marketing-readable way.

Show:

```text
placement key
associated content
active/inactive
display window
layout variant
sort rank
validation status
```

#### 6. Publish Readiness Checklist

Provide a checklist that explains why content can or cannot be published to a homepage lane.

Checklist items should include, where repo data supports:

```text
Foleon doc/publication ID present
published URL present
origin accepted
preview URL not promoted to production
embed eligibility valid
visibility enabled
homepage eligible
publish status valid
active edition uniqueness
display window valid
placement assigned
read path ready
write path ready
route authorization proven
```

## Tab 2 — Config

Purpose:

Admins should understand and validate registry-backed runtime readiness without using browser console or raw SharePoint lists.

The Config tab must display the completed readiness model from Prompts 00–02.

### Required Sections

#### 1. Runtime Readiness Summary

Show top-level readiness cards for:

```text
Registry
List Bindings
Backend URL
API Resource
Token Provider
Token Acquisition
Read Path
Write Path
Sync Path
Backend Safe Config
Route Authorization
```

Do not reduce this to one generic ready/not-ready indicator.

Each readiness card should show:

```text
status
source where applicable
blocking reason
next action
last checked time if available
```

#### 2. Registry Source Status

Show:

```text
registry source status
registry read status
registry validation status
active config records status
duplicate active key status if exposed
secret hygiene status if exposed
```

#### 3. Config Source by Value

Show a registry-aware config table.

Each value should show:

```text
config key
display value or redacted status
source: Override / Registry / Default / Missing / Blocked
validation status
required/optional
last validation or last checked state if available
action needed
```

At minimum include rows for:

```text
FoleonContentRegistryListGuid
FoleonHomepagePlacementsListGuid
FoleonInteractionEventsListGuid
FoleonSyncRunsListGuid
BackendFunctionAppUrl
FoleonApiBaseUrl
FoleonApiResource
AcceptedFoleonOrigins
ExpectedManifestId
FoleonExpectedPackageVersion
HomepageExpectedPackageVersion
MarketingNewHostPageUrl
HBCentralHubSiteUrl
```

Use redaction/fingerprinting for sensitive values if repo truth requires it.

#### 4. SharePoint List Bindings

Show list readiness for:

```text
HB_FoleonContentRegistry
HB_FoleonHomepagePlacements
HB_FoleonInteractionEvents
HB_FoleonSyncRuns
HB Platform Configuration Registry
```

Show whether each list is:

```text
configured
reachable
validated
blocked
```

#### 5. Backend / API / Auth Readiness

Show:

```text
backend URL status
safe-config probe status
API resource status
token-provider status
token-acquisition status
route authorization status
read readiness
write readiness
sync readiness
```

Preserve the completed rule that `writePathReady` remains false until backend safe-config and route authorization are proven.

#### 6. Origin and Production URL Policy

Show:

```text
accepted Foleon origins
production viewer URL policy
allow preview/admin review behavior
blocked origin messages
preview URL warning state
```

#### 7. Package / Manifest Governance

Show:

```text
runtime manifest ID status
expected manifest ID status
runtime package version
expected package version
registry bridge package marker if available
homepage expected package version if available
package/version match status
```

#### 8. Admin Diagnostics

Add an expandable diagnostics section for admins.

It may include:

```text
redacted runtime binding proof
registry resolution proof
safe readiness object
last backend probe results
known environment caveat
```

Do not expose secrets or raw tokens.

## Role Clarity

Marketing users should focus on content, lanes, placements, validation, preview, and publishing.

Admins should manage or inspect configuration, runtime proof, registry readiness, backend/API/token readiness, package governance, and blocked-state causes.

If repo truth already exposes role/authorization details, use it. If not, implement the UI with readiness-aware disablement and copy that avoids promising unavailable actions.

## Required UI Behavior

- Display configuration source per value:
  - `Override`
  - `Registry`
  - `Default`
  - `Missing`
  - `Blocked`
- Display validation status per value.
- Clearly label preview fallback/sample content.
- Provide actionable blocked-state messages.
- Preserve existing Manager workflows while reorganizing UI.
- Avoid raw SharePoint list editing as the normal user workflow.
- Do not remove existing validation, publish, suppress, placement, sync, or content edit behavior.
- Do not create a new data model if existing repo data supports the required UI.
- Keep the UI responsive and compatible with SharePoint page constraints.

## Required Component Strategy

Prefer incremental refactor over rewrite.

Potential component structure, adjusted to repo truth:

```text
ManageTabs.tsx
HomepageFoleonContentTab.tsx
FoleonConfigTab.tsx
LaneStatusOverview.tsx
LaneStatusCard.tsx
ContentRegistryPanel.tsx
PlacementStatusPanel.tsx
PublishReadinessChecklist.tsx
RuntimeReadinessSummary.tsx
RegistrySourceStatusPanel.tsx
ConfigSourceTable.tsx
BackendAuthReadinessPanel.tsx
PackageGovernancePanel.tsx
AdminDiagnosticsPanel.tsx
```

Do not create unnecessary files if current components can be cleanly refactored.

## Testing Requirements

Add or update tests for:

```text
two tabs render
default selected tab is correct
Homepage Foleon Content tab renders three lane cards
Config tab renders split readiness states
Config tab renders source labels: Override / Registry / Default / Missing / Blocked
writePathReady false state is displayed distinctly
apiBaseUrl alone does not show write path ready
backend safe-config missing state blocks writes
route authorization missing state blocks writes
marketing/content actions are disabled when write readiness is false
no secret values, raw tokens, or unsafe runtime values are rendered
existing content table/edit/publish/suppress behavior remains available
```

If existing test infrastructure cannot support all UI states, add focused unit tests for readiness view models or component helpers.

## Validation Commands

Run repo-truth commands applicable to changed packages.

Candidate commands:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
```

If SPFx gulp build is blocked under Node 22, do not treat that as source closure. Use Node 18 for final SPFx build/package validation before deployment.

If the local environment remains on Node 22, document the limitation and run all available TypeScript, unit, registry, runtime-bridge, and package-proof checks that can run in that environment.

Also run any relevant registry/runtime validation commands introduced in Prompts 00–02.

## Package / Version Guidance

If source changes alter the shipped SPFx package behavior, update package/version markers consistently according to repo truth.

Do not bump versions blindly. If a version bump is required, update all package/runtime/package-proof files that repo truth identifies as version authority.

## Documentation Requirements

Create or update a closure report under the repo’s established documentation location for Foleon Manager or platform config work.

The closure report must include:

```text
summary
changed files
UI structure implemented
registry-aware Config behavior
readiness states preserved
tests added/updated
commands run
validation results
known Node/SPFx environment limitations
manual hosted validation still required
commit message
```

## Acceptance Criteria

Prompt 03 is complete only when:

- Foleon Manager has a two-tab UI.
- `Homepage Foleon Content` tab organizes existing content and placement workflows by lane.
- `Config` tab displays the split readiness model from Prompts 00–02.
- Config tab clearly shows config source by key.
- `writePathReady=false` remains visible and meaningful until backend safe-config and route authorization are proven.
- Existing Manager workflows are preserved.
- No secrets or unsafe runtime values are exposed.
- Tests cover the tab shell and critical readiness states.
- Validation commands are run and documented.
- Any Node 22/SPFx build limitation is documented honestly.

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
UX Structure Implemented:
Homepage Content Tab Behavior:
Registry-Aware Config Behavior:
Readiness States Preserved:
Tests Added:
Commands Run:
Validation Results:
Known Environment Limitations:
Hosted Validation Needed:
Unresolved Follow-Up:
Commit Message:
```
