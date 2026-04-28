# 06 — Information Architecture

## Proposed IA

```text
Foleon Manager
├── Command Header
│   ├── Purpose statement
│   ├── Last sync / sync state
│   ├── System readiness summary
│   ├── Primary task group: Sync from Foleon
│   ├── Primary task group: Review new content
│   ├── Primary task group: Manage placements
│   └── Secondary: Open Foleon / Admin diagnostics
├── Primary Navigation
│   ├── Content Operations
│   ├── Lane Board
│   ├── Preview
│   └── Admin / Config
├── Content Operations Workspace
│   ├── Content Inbox
│   │   ├── New since last sync
│   │   ├── Unassigned
│   │   ├── Needs review
│   │   ├── Blocked
│   │   ├── Staged
│   │   └── Live / Published
│   ├── Selected Content Detail
│   └── Quick Placement Action
├── Lane Control Board
│   ├── Project Spotlight
│   ├── Company Pulse
│   └── Leadership Message
├── Placement Workflow Panel
│   ├── Select content
│   ├── Review readiness
│   ├── Choose lane
│   ├── Confirm display window
│   ├── Validate
│   ├── Preview
│   └── Activate
├── Preview Panel
│   ├── Employee-facing reader preview
│   ├── Foleon source open
│   └── External-open fallback
└── Admin / Config
    ├── OAuth readiness
    ├── Graph/list readiness
    ├── Registry source
    ├── API audience/token state
    ├── Diagnostics
    ├── Package/runtime proof
    └── Redacted proof export
```

## Default Workspace Layout

```text
[Command Header: Foleon Manager | last sync | readiness | Sync | Review New | Manage Placements]

[Status strip: 3 new | 2 unassigned | 1 blocked | Project Spotlight needs staged content]

[Content Inbox 40%] [Lane Control Board 60%]
[Selected Content Detail / Placement Drawer when active]
```

## Why This IA Works

- Content availability is primary.
- Lane placement is visible without making users understand SharePoint list structure.
- Diagnostics are recoverable but subordinate.
- Preview is a formal step before activation.
- The app becomes a content operations console instead of an admin grid.
