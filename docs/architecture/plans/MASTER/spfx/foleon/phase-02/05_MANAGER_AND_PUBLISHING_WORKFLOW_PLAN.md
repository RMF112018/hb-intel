# Manager and Publishing Workflow Plan

## Objective

Update the Manager route so admins can govern Project Spotlight and Company Pulse without editing SharePoint lists directly.

## Current Gap

The current Manager form supports:

- title;
- doc ID;
- status;
- open mode;
- URLs;
- region/sector;
- summary;
- visible;
- homepage eligible;
- embed;
- external open.

It does not support:

- reader lane;
- cadence;
- homepage slot;
- active edition;
- archive group;
- primary audience;
- last editorial update;
- one-active-record validation.

## Required Manager Model Changes

Extend frontend management types:

```ts
FoleonManagedContent
FoleonContentMutation
```

Add:

```ts
readerKey?: FoleonReaderKey;
cadence?: FoleonCadence;
homepageSlot?: FoleonHomepageSlot;
archiveGroup?: string;
activeEdition?: boolean;
primaryAudience?: FoleonPrimaryAudience;
lastEditorialUpdate?: string;
```

## Editor Fields

Add governed fields to `ManageContentEditorPanel`:

| Field | UI |
|---|---|
| Reader Key | select |
| Content Type | select |
| Homepage Slot | select |
| Cadence | select |
| Archive Group | text |
| Active Edition | checkbox |
| Primary Audience | select |
| Last Editorial Update | datetime/date input |

The Manager should guide valid combinations rather than allowing arbitrary lane drift.

## Recommended Lane Presets

Add optional buttons or static presets:

```text
Configure as Project Spotlight
Configure as Company Pulse
```

These can set:

### Project Spotlight Preset

```json
{
  "readerKey": "project-spotlight",
  "contentTypeKey": "Project Spotlight",
  "homepageSlot": "Project Spotlight Reader",
  "cadence": "Monthly",
  "activeEdition": true,
  "isHomepageEligible": true,
  "openMode": "Inline Reader",
  "allowEmbed": true,
  "requiresExternalOpen": false
}
```

### Company Pulse Preset

```json
{
  "readerKey": "company-pulse",
  "contentTypeKey": "Company Pulse",
  "homepageSlot": "Company Pulse Reader",
  "cadence": "Frequent",
  "activeEdition": true,
  "isHomepageEligible": true,
  "openMode": "Inline Reader",
  "allowEmbed": true,
  "requiresExternalOpen": false
}
```

If preset buttons are added, they must be real actions that update the draft form only. They must not publish or write until Save.

## Active Edition Governance

Manager should warn when:

- more than one active Project Spotlight exists;
- more than one active Company Pulse exists;
- a record is active but not published/visible/homepage eligible;
- a placement points to a non-public-ready record;
- reader key and content type do not align;
- Company Pulse lacks `LastEditorialUpdate`.

## Placement Manager

Update placement types and forms to support:

```text
Project Spotlight Active
Company Pulse Active
```

Add validation that active placements align with content:

| PlacementKey | Required content |
|---|---|
| Project Spotlight Active | `ReaderKey = project-spotlight`, `ContentTypeKey = Project Spotlight` |
| Company Pulse Active | `ReaderKey = company-pulse`, `ContentTypeKey = Company Pulse` |

## Manager Dashboard Metrics

Add metrics:

- Project Spotlight active record count.
- Company Pulse active record count.
- Public-ready Project Spotlight.
- Public-ready Company Pulse.
- Invalid/blocked lane records.
- Archive count by reader lane.

## Publishing Workflows

### Project Spotlight Monthly Workflow

```text
1. Marketing syncs or creates next Foleon Doc.
2. Set ReaderKey = project-spotlight.
3. Set ContentTypeKey = Project Spotlight.
4. Set Cadence = Monthly.
5. Set ArchiveGroup = YYYY-MM.
6. Set ActiveEdition = true.
7. Set old Project Spotlight ActiveEdition = false.
8. Create/update Project Spotlight Active placement.
9. Publish and validate.
```

### Company Pulse Frequent Workflow

```text
1. Marketing updates live Company Pulse Doc in Foleon.
2. Registry record remains same.
3. LastEditorialUpdate is updated.
4. ActiveEdition remains true.
5. Periodically archive by changing ArchiveGroup and creating/copying next live Doc if needed.
```

## Backend Required Support

Backend must expose these fields through:

- list content;
- get content;
- create content;
- update content;
- publish content;
- suppress content;
- validation result;
- placement validation.

Do not implement Manager-only frontend fields without backend support. That would create silent data loss.
