# 06 — Homepage Foleon Content Tab Spec

## Purpose

The `Homepage Foleon Content` tab lets marketing users manage the content used by the three homepage Foleon reader lanes:

- Project Spotlight
- Company Pulse
- Leadership Message

## Required Sections

### 1. Lane Status Overview

A three-card summary:

```text
Project Spotlight | Live / Preview / Blocked / Empty | Active edition | Display window
Company Pulse     | Live / Preview / Blocked / Empty | Active edition | Display window
Leadership Message| Live / Preview / Blocked / Empty | Active edition | Display window
```

Each card should show:

- lane key;
- active content title;
- active Foleon document/publication ID;
- display dates;
- validation status;
- publish status;
- embed eligibility;
- last sync source;
- next required action.

### 2. Lane Cards

Each lane card should include:

- current active edition;
- staged draft / preview content;
- last published date;
- cadence;
- archive group;
- target audience;
- preview/live/blocked state;
- `Edit`, `Validate`, `Publish`, `Archive`, `Open Preview` actions.

### 3. Content Registry Table

Filterable table:

- lane;
- title;
- Foleon doc ID;
- content type;
- publish status;
- homepage eligible;
- active edition;
- display from;
- display through;
- sync source;
- validation status.

Default filters:

- show active/staged records first;
- group by reader lane;
- exclude archived unless toggled.

### 4. Create/Edit Content Drawer

Fields:

- Title
- Foleon URL
- Foleon Doc ID
- Reader Lane
- Content Type
- Homepage Slot
- Active Edition
- Placement Key
- Placement Alignment
- Published / visible / homepage eligible status
- Display From / Through
- Archive Group
- Cadence
- Primary Audience
- Summary / preview copy
- Embed eligibility
- Open mode
- Tags
- Related project fields
- Admin notes

Validation should run on save and before publish.

### 5. Placement Alignment Panel

Controls:

- placement key;
- active/inactive;
- content lookup / content ID cache;
- display dates;
- sort rank;
- layout variant;
- audience groups.

Rules:

- Each lane can have only one active primary placement at a time.
- Staged future placements are allowed only with future display dates.
- Expired placements should not block current lane if a valid active placement exists.

### 6. Publish Readiness Checklist

Checklist items:

- production viewer URL or approved preview mode;
- accepted origin match;
- published URL present;
- embed URL present or external-open mode selected;
- `AllowEmbed` true unless external-open required;
- publish status valid;
- visibility true;
- homepage eligible true;
- active edition uniqueness by lane;
- display window current or future;
- placement exists;
- backend validation passed;
- package/manifest governance valid.

## Lane Mapping

Recommended canonical keys:

| Lane | ReaderKey | HomepageSlot | PlacementKey |
|---|---|---|---|
| Project Spotlight | `project-spotlight` | `Project Spotlight Reader` | `Project Spotlight Active` |
| Company Pulse | `company-pulse` | `Company Pulse Reader` | `Company Pulse Active` |
| Leadership Message | `leadership-message` | `Leadership Message Reader` | `Leadership Message Active` |

## Workflow Rules

- Marketing users can save draft records with incomplete validation.
- Publishing requires validation status not blocked.
- Active edition should be unique per lane for current display window.
- Preview fallback must be labeled as preview/sample content.
- Preview URL should never be promoted to production unless admin review mode is active and explicitly shown.

## Acceptance Criteria

- User can identify current active record for each lane within 5 seconds.
- User can tell whether homepage will render live, preview, blocked, or empty.
- User can publish without touching raw SharePoint lists.
- User can archive old editions without deleting records.
