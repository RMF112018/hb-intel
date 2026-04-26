# Prompt 04 Closure - Homepage Content Workflow and Validation

## Summary
Prompt 04 completed the lane-specific homepage content workflow pass for Project Spotlight, Company Pulse, and Leadership Message without redesigning the Prompt 03 Manager shell or adding backend routes. The Manager now exposes supported workflow fields, shows content validation in plain language, preserves separate read/write readiness, and keeps write actions disabled when `writePathReady=false`.

## Implemented
- Added supported display window fields (`displayFrom`, `displayThrough`) to the frontend content mutation flow.
- Added frontend workflow validation for reader lane, homepage slot, published/embed URL policy, inline embed requirements, display date ordering, active-edition overlaps, visibility, homepage eligibility, and lane-specific marketing guidance.
- Added conservative production URL opening: `Open Foleon` renders only when a production URL exists and passes the configured origin/preview policy.
- Added backend enforcement for origin allowlist, preview URL blocking, inline reader embed requirements, live homepage lane/slot requirements, display window ordering, and overlapping active editions.
- Preserved protected readiness behavior: readable/live content can render while write, publish, placement, and sync actions remain blocked until their readiness states are proven.
- Bumped Foleon SPFx package/version authorities from `1.0.26.0` to `1.0.27.0`.

## Tests Added or Updated
- Frontend workflow helper tests cover active-edition overlap, preview URL blocking, origin allowlist enforcement, inline embed requirement, display date validation, and placement alignment messages.
- Manager page tests cover live/readable lane rendering while write actions remain disabled under `writePathReady=false`.
- Backend service tests cover inline embed enforcement, origin allowlist enforcement, and active-edition overlap blocking.

## Unsupported or Deferred Fields
- `archiveGroup`, `cadence`, `primaryAudience`, `openMode`, `allowEmbed`, `displayFrom`, and `displayThrough` are supported through current DTO/list mapping and are surfaced without creating a new data model.
- Preview-specific open actions remain deferred because the current frontend list/detail contract does not expose a distinct preview URL end-to-end in the Manager flow. Preview URLs are still blocked from production promotion by frontend policy checks and backend validation.
- No new backend routes were added; existing content, placement, validation, publish, suppress, and sync routes were reused.

## Validation
- `pnpm --filter @hbc/spfx-hb-intel-foleon lint` passed with existing warnings.
- `pnpm --filter @hbc/spfx-hb-intel-foleon check-types` passed.
- `pnpm --filter @hbc/spfx-hb-intel-foleon test` passed: 28 files, 290 tests.
- `pnpm --filter @hbc/spfx-hb-intel-foleon build` passed.
- `pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate` passed: 498 checks.
- `pnpm --filter @hbc/functions check-types` passed.
- `pnpm --filter @hbc/functions test` passed: 134 files, 2242 passed, 3 skipped.
- `pnpm --filter @hbc/spfx-hb-intel-foleon package:proof` failed because the existing generated `dist/sppkg/hb-intel-foleon.sppkg` artifact is stale at `1.0.23.0`.
- `pnpm run build` in `tools/spfx-shell` failed under Node 22 before bundling, matching the SPFx toolchain engine guard.

## Environment Limitation
The local machine is on Node 22. SPFx 1.18 gulp packaging still requires Node `>=18.17.1 <19.0.0`, so final gulp build/package proof must be run under Node 18 before tenant deployment.

## Manual Tenant Validation Needed
- Confirm Manager loads with registry-backed read readiness in SharePoint.
- Confirm `writePathReady=false` blocks save/publish/placement/sync actions until backend safe config and route authorization are proven.
- Confirm active edition conflicts and URL policy failures are returned by the backend in tenant context.
- Confirm deployed package/version truth is `1.0.27.0`.

## Commit Message
`SPFx Foleon 1.0.27.0: complete homepage content workflows`
