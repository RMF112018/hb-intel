# 03 — Target Information Architecture

## Principle

Start with the user outcome, then operational readiness, then diagnostics.

The current UI reverses that hierarchy. The rescue plan restores this order:

1. **What am I managing?**
2. **What is live / staged / blocked / empty?**
3. **What action should I take?**
4. **What system condition affects that action?**
5. **What proof can I provide to IT/admins if escalation is needed?**

## App-Level Architecture

```text
Foleon Manager
├─ Page Header
│  ├─ App identity
│  ├─ Short purpose
│  ├─ High-level status chips
│  └─ Primary actions
├─ Global Status Banner
│  └─ Only when action is required
├─ Tabs
│  ├─ Homepage Foleon Content [default]
│  └─ Config
└─ Diagnostics Drawer/Accordion
   └─ Redacted proof, copyable only when needed
```

## Header

### Required Header Content

- Eyebrow: `Marketing Operations`
- Title: `Foleon Manager`
- Subtitle: `Manage homepage Foleon content, placements, and publishing readiness.`
- Status chips:
  - Content lanes
  - API connection
  - Registry
  - Last sync
- Primary actions:
  - `Sync content`
  - `Open Foleon`
  - `View diagnostics`

### Header Rules

- No raw backend URLs.
- No raw API resources.
- No raw list GUIDs.
- No raw token errors.
- No giant proof grids.
- Do not show repeated sync failure copy in the header.
- Keep layout compact; avoid large empty whitespace.

## Global Status Banner

Only render if action is required.

Priority order:

1. Error: required dependency broken and user cannot proceed.
2. Warning: limited mode; review is possible but write/sync/publish is blocked.
3. Info: non-critical operational guidance.

### API Consent Required Banner

Title:

> API approval required

Body:

> SharePoint needs approval to let this app call the HB Intel backend. Content can be reviewed, but publishing and sync are unavailable until `HB SharePoint Creator / access_as_user` is approved in SharePoint Admin Center.

Actions:

- Primary: `Review admin action`
- Secondary: `View diagnostics`

## Tabs

### Default Tab

`Homepage Foleon Content`

### Secondary Tab

`Config`

### Tab Rules

- Tabs must be real accessible tabs or semantically equivalent buttons with controlled panels.
- Selected tab must be visually and programmatically clear.
- Do not use Config as the default unless explicitly deep-linked.

## Homepage Foleon Content Tab

```text
Homepage Foleon Content
├─ Lane Summary
│  ├─ Project Spotlight
│  ├─ Company Pulse
│  └─ Leadership Message
├─ Selected Lane Workspace
│  ├─ Current live/staged item
│  ├─ Publish readiness checklist
│  ├─ Placement status
│  └─ Quick actions
├─ Content Library
│  ├─ Search
│  ├─ Sort
│  └─ Homepage-relevant content first
└─ Editor / Placement Drawer
   └─ Opened by action
```

## Config Tab

```text
Config
├─ System Health Summary
│  ├─ API approval
│  ├─ Backend connection
│  ├─ Registry
│  ├─ SharePoint lists
│  └─ Publish/sync readiness
├─ Required Admin Actions
│  └─ Ranked blockers with exact steps
├─ Configuration Groups
│  ├─ Registry
│  ├─ SharePoint Lists
│  ├─ Backend/API
│  ├─ Origin and preview policy
│  └─ Package governance
└─ Diagnostics
   ├─ Collapsed by default
   ├─ Redacted
   └─ Copyable proof
```

## Diagnostics Placement

Diagnostics are not removed. They are demoted.

Approved surfaces:

- `View diagnostics` drawer.
- `Diagnostics` accordion in Config.
- Copy-proof panel with redacted JSON.
- Admin-only section if role gating exists.

Do not show diagnostics as the default app body.
