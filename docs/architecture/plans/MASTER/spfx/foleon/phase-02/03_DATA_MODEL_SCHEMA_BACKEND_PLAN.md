# Data Model, Schema, Backend, and Provisioning Plan

## Summary

The two-lane reader model requires schema additions. This is not only a frontend change.

The required changes affect:

- frontend type unions;
- SharePoint list schema constants;
- Feature Framework XML;
- backend DTOs and mutation requests;
- backend content mapping and validation;
- Manager forms;
- public scalar-safe content projection;
- docs/reference schema snapshots;
- tests and package proof.

## Content Registry Field Additions

Add these fields to `HB_FoleonContentRegistry`.

| Field | InternalName | Type | Indexed | Public `$select` | Public `$filter` | Purpose |
|---|---|---:|---:|---:|---:|---|
| Reader Key | `ReaderKey` | Choice | Yes | Yes | Yes | `project-spotlight` / `company-pulse` lane resolution. |
| Cadence | `Cadence` | Choice | No | Yes | No | Monthly / Frequent / etc. |
| Homepage Slot | `HomepageSlot` | Choice | Yes | Yes | Optional | Human-readable reader slot. |
| Archive Group | `ArchiveGroup` | Text | Yes | Yes | Optional | `2026-05`, `2026-Q2`, etc. |
| Active Edition | `ActiveEdition` | Boolean | Yes | Yes | Yes | One active homepage item per reader lane. |
| Primary Audience | `PrimaryAudience` | Choice | No | Yes | No | Companywide / Operations / Field / Leadership. |
| Last Editorial Update | `LastEditorialUpdate` | DateTime | Yes | Yes | Optional | Especially important for Company Pulse recency. |

## Choice Values

### `ContentTypeKey`

Add:

```text
Project Spotlight
Company Pulse
```

Retain existing values for backward compatibility:

```text
Project Highlight
Newsletter
Company News
Market Update
Leadership
Other
```

### `ReaderKey`

```text
project-spotlight
company-pulse
```

### `Cadence`

```text
Monthly
Weekly
Frequent
Ad Hoc
```

### `HomepageSlot`

```text
Project Spotlight Reader
Company Pulse Reader
```

### `PrimaryAudience`

```text
Companywide
Operations
Field
Leadership
Marketing
Safety
IT
```

## Placement Schema Updates

Add placement choices:

```text
Project Spotlight Active
Company Pulse Active
```

The current placement keys are card/layout concepts. The target reader modules require lane-specific placement keys.

## Frontend Types

Update `foleon-content.types.ts`:

```ts
export type FoleonContentType =
  | 'Project Spotlight'
  | 'Company Pulse'
  | 'Project Highlight'
  | 'Newsletter'
  | 'Company News'
  | 'Market Update'
  | 'Leadership'
  | 'Other';

export type FoleonReaderKey = 'project-spotlight' | 'company-pulse';
export type FoleonCadence = 'Monthly' | 'Weekly' | 'Frequent' | 'Ad Hoc';
export type FoleonHomepageSlot = 'Project Spotlight Reader' | 'Company Pulse Reader';
export type FoleonPrimaryAudience =
  | 'Companywide'
  | 'Operations'
  | 'Field'
  | 'Leadership'
  | 'Marketing'
  | 'Safety'
  | 'IT';
```

Extend `FoleonContentRecord` with optional fields:

```ts
readonly readerKey?: FoleonReaderKey;
readonly cadence?: FoleonCadence;
readonly homepageSlot?: FoleonHomepageSlot;
readonly archiveGroup?: string;
readonly activeEdition?: boolean;
readonly primaryAudience?: FoleonPrimaryAudience;
readonly lastEditorialUpdate?: string;
```

## Public Scalar-Safe Projection

Extend the explicit scalar-safe projection in `FoleonContentService.ts` only with safe scalar fields:

```text
ReaderKey
Cadence
HomepageSlot
ArchiveGroup
ActiveEdition
PrimaryAudience
LastEditorialUpdate
```

Do not reintroduce:

```text
MarketingOwner
AudienceGroups
```

Do not add `$expand` for public homepage routes.

## Filter-Safe Fields

If public routes filter on these fields, mark and provision them as indexed/filter-safe:

```text
ReaderKey
ActiveEdition
ContentTypeKey
IsVisible
PublishStatus
IsHomepageEligible
```

`ContentTypeKey` is currently recommended-index only. For production two-lane readers, it should become indexed/filter-safe if used in REST filters.

## Backend DTOs

Update `backend/functions/src/services/foleon-types.ts`:

- `FoleonContentSummaryDto`
- `FoleonContentDetailDto`
- `FoleonContentMutationRequest`

Add:

```ts
readonly readerKey?: 'project-spotlight' | 'company-pulse';
readonly cadence?: 'Monthly' | 'Weekly' | 'Frequent' | 'Ad Hoc';
readonly homepageSlot?: 'Project Spotlight Reader' | 'Company Pulse Reader';
readonly archiveGroup?: string;
readonly activeEdition?: boolean;
readonly primaryAudience?: string;
readonly lastEditorialUpdate?: string;
```

## Backend Service Mapping

Update backend `toContentDetail`, `contentToMutation`, `contentFields`, `validateContentMutation`, and sync/upsert behavior.

Expected backend write mappings:

| DTO | SharePoint Field |
|---|---|
| `readerKey` | `ReaderKey` |
| `cadence` | `Cadence` |
| `homepageSlot` | `HomepageSlot` |
| `archiveGroup` | `ArchiveGroup` |
| `activeEdition` | `ActiveEdition` |
| `primaryAudience` | `PrimaryAudience` |
| `lastEditorialUpdate` | `LastEditorialUpdate` |

## Backend Validation Rules

Add validation rules:

### Shared

- Published + visible + homepage eligible records must pass the existing reader gate fields.
- `ReaderKey` must align with `ContentTypeKey`:
  - `project-spotlight` → `Project Spotlight`
  - `company-pulse` → `Company Pulse`
- `HomepageSlot` must align with `ReaderKey`.

### Project Spotlight

- `Cadence = Monthly`
- `ArchiveGroup` should follow `YYYY-MM`
- Only one `ActiveEdition = true` should exist for `readerKey = project-spotlight`.

### Company Pulse

- `Cadence = Frequent` or `Weekly`
- `ArchiveGroup` should follow `YYYY-Q#` or another approved period convention.
- `LastEditorialUpdate` should be populated when published and active.
- Only one `ActiveEdition = true` should exist for `readerKey = company-pulse`.

## Provisioning / Tenant Migration

This is a schema expansion on already-provisioned lists. Do not recreate lists unless a tenant-specific failure requires it.

Recommended path:

1. Update schema constants and Feature Framework XML.
2. Add a read-only schema validation.
3. Add a controlled tenant field-upgrade script/runbook.
4. Add missing fields and choice values in place.
5. Add indexes after field creation.
6. Validate actual tenant schema.
7. Deploy updated package.

## Versioning

This change should bump from `1.0.17.0` to `1.0.18.0` during final package proof.
