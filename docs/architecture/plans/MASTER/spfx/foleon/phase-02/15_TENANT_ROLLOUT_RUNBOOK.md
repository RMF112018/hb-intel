# Tenant Rollout Runbook — Two-Lane Foleon Readers

## Pre-Rollout

1. Confirm current package is stable at `1.0.17.0`.
2. Confirm scalar-safe content registry fix is deployed.
3. Export tenant Foleon list schemas.
4. Back up list data.
5. Confirm no unrelated Safety/backend deployment is mixed into this rollout.

## Schema Migration

On `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`, add missing fields to `HB_FoleonContentRegistry`:

```text
ReaderKey
Cadence
HomepageSlot
ArchiveGroup
ActiveEdition
PrimaryAudience
LastEditorialUpdate
```

Add choice values to `ContentTypeKey`:

```text
Project Spotlight
Company Pulse
```

Add choice values to `PlacementKey`:

```text
Project Spotlight Active
Company Pulse Active
```

Add/verify indexes:

```text
ReaderKey
ActiveEdition
HomepageSlot
ArchiveGroup
LastEditorialUpdate
ContentTypeKey
```

## Package Deployment

1. Build `hb-intel-foleon.sppkg`.
2. Upload to App Catalog.
3. Install/update on HBCentral.
4. Update existing webpart property pane `expectedPackageVersion` to `1.0.18.0`.

## Page Setup

Add two homepage modules:

```text
HB Intel Project Spotlight Reader
HB Intel Company Pulse Reader
```

Recommended homepage band:

```text
Project Spotlight Reader: 60–65%
Company Pulse Reader: 35–40%
```

## Content Setup

### Project Spotlight

Create/update one content registry item:

```text
ReaderKey = project-spotlight
ContentTypeKey = Project Spotlight
HomepageSlot = Project Spotlight Reader
Cadence = Monthly
ArchiveGroup = YYYY-MM
ActiveEdition = true
PublishStatus = Published
IsVisible = true
IsHomepageEligible = true
AllowEmbed = true
RequiresExternalOpen = false
```

Create/update one placement:

```text
PlacementKey = Project Spotlight Active
IsActive = true
ContentIdCache = <FoleonDocId>
```

### Company Pulse

Create/update one content registry item:

```text
ReaderKey = company-pulse
ContentTypeKey = Company Pulse
HomepageSlot = Company Pulse Reader
Cadence = Frequent
ArchiveGroup = YYYY-Q#
ActiveEdition = true
LastEditorialUpdate = <current timestamp>
PublishStatus = Published
IsVisible = true
IsHomepageEligible = true
AllowEmbed = true
RequiresExternalOpen = false
```

Create/update one placement:

```text
PlacementKey = Company Pulse Active
IsActive = true
ContentIdCache = <FoleonDocId>
```

## Runtime Proof

Run:

```js
JSON.stringify(window.__hbIntel_foleonRuntimeBindingProof, null, 2)
```

Expected:

```json
{
  "packageVersion": "1.0.18.0",
  "canInitialize": true,
  "issueCodes": [],
  "governance": {
    "packageVersionMatchesExpected": true
  }
}
```

## Validation

- Project Spotlight preview appears when no active project spotlight exists.
- Company Pulse preview appears when no active company pulse exists.
- Published active records replace previews.
- Reader gates block invalid records.
- Mobile loads collapsed cards first.
- Manager can edit new fields.
- No public query 400 occurs.

## Rollback

1. Remove new webparts from page or restore previous page version.
2. Reinstall previous `.sppkg`.
3. Set expected package version back to prior deployed version if needed.
4. Do not delete new list fields unless separately approved.
