# PnP Ops Render and Authoring Gap Closure

## Render Path Findings

Audit focus path:

- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/pnp/PnpOps.tsx`

Findings before this closure pass:

- Shell diagnostics were strong for module-resolution failures but weak for mount-time exceptions and mode-specific misconfiguration guidance.
- `mount.tsx` fell back to `ReferenceHomepageComposition` when a webpart ID was missing from the mount map, which masked package/linkage defects.
- PnP authoring remained largely implicit via raw property JSON instead of explicit property-pane support.
- PnP manifest remained hidden from toolbox, which hindered controlled deployment/test diagnostics in tenant pages.

## Diagnostics Improved

Implemented:

1. ShellWebPart structured diagnostics envelope
- Adds runtime diagnostics context for load and render failures:
  - webpart ID
  - global name
  - bundle URL
  - execution mode
  - runner/legacy endpoint presence
  - correlation-style diagnostic ID

2. ShellWebPart mount exception handling
- Wraps `mount(...)` promise with explicit `.catch(...)` handling.
- Logs structured failure metadata and renders actionable in-DOM error guidance.

3. ShellWebPart actionable operator error surface
- Replaces generic fallback with mode-aware guidance for local-runner, remote-runner, and legacy-admin-api misconfiguration classes.

4. mount.tsx unknown-webpart-ID hardening
- Unknown supplied webpart IDs now emit explicit diagnostics and render a focused failure block.
- Silent fallback to `ReferenceHomepageComposition` is preserved only for no-ID/non-shell contexts.

5. mount.tsx PnP legacy prerequisite diagnostics
- Adds explicit warning telemetry when PnP is in `legacy-admin-api` mode without token-provider prerequisites.

## Authoring / Config Gaps Closed

Implemented in ShellWebPart property pane for PnP webpart ID `9e2dd84a-a121-4fb3-a964-f43a94abf9fd`:

- `executionMode`
- `runnerBaseUrl`
- `runnerApiKey`
- `defaultTargetSiteUrl`
- `legacyAdminApiBaseUrl`
- deprecated compatibility fields:
  - `backendUrl`
  - `backendAudience`

Also updated `PnpOpsWebPart.manifest.json`:

- `hiddenFromToolbox: false` to support controlled placement and tenant diagnostics.
- manifest version bump `0.0.7.0 -> 0.0.8.0` because runtime/config/authoring behavior changed.

## Runner Guardrails Tightened

`pnpOpsValidation.ts` now enforces:

- absolute URL requirement for runner modes,
- `remote-runner` requires HTTPS,
- `local-runner` requires HTTPS by default,
- explicit loopback exception for local HTTP (`localhost`, `127.0.0.1`, `::1`) to preserve local development reality.

`PnpOps.tsx` now shows proactive runner-mode warning banners for malformed/insecure runner configuration before preflight/launch.

## Deliberate Non-Fixes

- Legacy admin API mode was not removed; it remains explicit, guarded, and deprecated for compatibility.
- No backend contract changes were introduced; this closure is frontend render/diagnostic/authoring hardening only.
- No attempt was made to claim SharePoint live-runtime certainty from static checks alone.

## Remaining Tenant Runtime Validation Needed

Still required in tenant-hosted runtime:

- confirm PnP webpart placement/discovery behavior after toolbox visibility change,
- validate ShellWebPart in-page diagnostics render as expected under real CDN, auth, and origin conditions,
- validate local/remote runner connectivity and auth under actual tenant page-origin constraints,
- verify legacy mode token acquisition behavior when `backendAudience` is configured via property pane.
