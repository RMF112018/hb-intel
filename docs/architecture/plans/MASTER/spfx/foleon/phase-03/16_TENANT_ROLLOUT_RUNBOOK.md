# Tenant Rollout Runbook — Three-Lane Foleon Homepage

## Preconditions

- HBCentral Foleon schema/choice values are provisioned for all three lanes.
- Shared package extraction is committed and validated.
- Standalone Foleon Leadership route is available if required.
- Homepage package is rebuilt with the three-lane cutover.
- Homepage package/version governance is `1.1.78.0`.
- Embedded Foleon expected package version is `1.0.23.0`.

## Schema choice verification

Before deploying the homepage cutover, verify HBCentral choices include:

```text
ReaderKey:
project-spotlight
company-pulse
leadership-message

PlacementKey:
Project Spotlight Active
Company Pulse Active
Leadership Message Active

PageContext:
Project Spotlight
Company Pulse
Leadership Message
```

Do not recreate lists, delete fields, or update content/placement rows as part of this verification.

## Tenant property updates

Existing homepage webpart instances need:

```text
foleonContentRegistryListId
foleonPlacementsListId
foleonEventsListId
foleonAcceptedOrigins
foleonAllowPreview
foleonExpectedManifestId
foleonExpectedPackageVersion = 1.0.23.0
foleonApiBaseUrl
foleonApiResource
homepage package/version governance = 1.1.78.0
```

## Content setup

### Leadership Message

Create or update one content registry item:

```text
ReaderKey = leadership-message
ContentTypeKey = Leadership
HomepageSlot = Leadership Message Reader
Cadence = Ad Hoc
ActiveEdition = true
PublishStatus = Published
IsVisible = true
IsHomepageEligible = true
AllowEmbed = true
RequiresExternalOpen = false
```

Create or update one placement:

```text
PlacementKey = Leadership Message Active
IsActive = true
ContentIdCache = <FoleonDocId>
```

## Validation

- Project Spotlight lane renders in the former Project Portfolio Spotlight location.
- Company Pulse lane renders in the former Newsroom / Company Pulse location.
- Leadership Message lane renders in the former Message from Leadership location.
- Three lanes render at same time.
- All three lanes show preview state when no active record exists.
- Live content replaces preview when valid active records/placements exist.
- No legacy modules render in the replaced zones.
- Runtime proof is healthy and has no package-version mismatch.
- No horizontal overflow at desktop, tablet, phone, short-height, and narrowest-stable breakpoints.
- No `window.__hbIntel_foleon` dependency appears in homepage embedded lanes.
- Preview/live/blocked states behave correctly.
- No preview production telemetry.

Record package and validation evidence in
[`17_FINAL_CLOSURE_EVIDENCE.md`](./17_FINAL_CLOSURE_EVIDENCE.md), then attach hosted screenshots and DOM readouts to the breakpoint evidence appendix.
