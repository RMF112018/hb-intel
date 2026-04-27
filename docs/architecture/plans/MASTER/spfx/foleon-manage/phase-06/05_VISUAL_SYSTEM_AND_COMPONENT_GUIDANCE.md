# 05 — Visual System and Component Guidance

## Design Posture

The Manager should feel like a governed SharePoint-native admin/marketing surface, not a debug dashboard.

Use:

- compact headers;
- fewer heavy bordered containers;
- clear section hierarchy;
- semantic status chips;
- lane cards;
- grouped admin health cards;
- collapsed diagnostics;
- focused action rows.

Avoid:

- raw all-caps technical keys;
- giant tables above the fold;
- equal visual weight for every diagnostic row;
- excessive white-card stacking;
- disabled actions with no reason;
- raw failure text in the primary UI.

## Component Inventory

### `ManagerHeader`

Purpose:

- app identity;
- current operating mode;
- high-level health;
- primary actions.

Content:

- `Marketing Operations`
- `Foleon Manager`
- subtitle
- status chips
- action group

### `GlobalStatusBanner`

Purpose:

- show only action-required states.

Variants:

- warning: consent required, degraded write/sync mode;
- error: no usable read access;
- info: preview-only or setup guidance.

### `StatusChip`

Plain-language statuses:

- Ready
- Needs approval
- Blocked
- Needs setup
- Unavailable
- Warning
- Preview
- Live
- Empty

### `LaneCard`

Purpose:

- summarize one homepage lane.

Fields:

- lane name;
- state chip;
- active/staged title;
- display window;
- placement status;
- publish readiness;
- primary next action;
- blocker reason when needed.

### `SelectedLaneWorkspace`

Purpose:

- show details and next steps for the selected lane.

Sections:

- current live/staged content;
- placement status;
- publish readiness checklist;
- quick actions.

### `ContentLibraryPanel`

Purpose:

- searchable/sortable content list.
- Secondary to lane workflow.

### `AdminHealthSummary`

Purpose:

- summarize system health without raw proof.

Groups:

- API approval;
- backend connection;
- registry;
- SharePoint lists;
- publishing/sync readiness.

### `RequiredAdminActions`

Purpose:

- ranked blockers with remediation steps.

### `ConfigurationGroup`

Purpose:

- human-readable config sections.

Groups:

- Registry;
- SharePoint Lists;
- Backend/API;
- Origin and preview policy;
- Package governance.

### `DiagnosticsDisclosure`

Purpose:

- redacted proof behind progressive disclosure.

Rules:

- collapsed by default;
- copyable;
- sanitized;
- no raw secret/token display.

## Tables

Tables are permitted only for secondary or diagnostic content.

Requirements:

- do not place long tables above the fold;
- support wrapping in SharePoint width constraints;
- avoid horizontal overflow;
- use friendly column labels;
- collapse technical details on narrow widths.

## Buttons and Actions

Recommended primary actions:

- Review lane
- Edit content
- Validate
- Publish
- Open preview
- Retry API approval check
- Sync content
- Copy diagnostic proof

Button hierarchy:

- one primary action per section;
- secondary actions should be visually quieter;
- destructive/suppress actions must be clearly separated.

## Disabled Actions

Disabled actions must explain why.

Examples:

- `Publishing is unavailable because API approval is still required.`
- `Sync is unavailable because backend authorization is blocked.`
- `Publish is unavailable until a production Foleon URL is configured.`
- `Placement cannot be updated until write access is available.`

Implementation options:

- visible helper text near the button;
- tooltip using `aria-describedby`;
- inline warning row in the readiness checklist.

## Spacing and Layout

- Keep the header compact.
- Keep lane cards visible above the fold at common desktop SharePoint widths.
- Use responsive grid:
  - desktop: 3 lane cards across where width allows;
  - medium: 2 + 1 wrapping;
  - narrow: single-column stack.
- Avoid nested bordered cards inside bordered cards.
- Let sections breathe without creating dead whitespace.
