# 06 — Explicit Wireframes

## Default Feed Desk — No Content / OAuth Blocked

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Foleon Feed Manager                                      [Sync Foleon] [⋯]   │
│ Place Foleon content into HB Central feeds and schedule what employees see.   │
│                                                                              │
│ System: Sync blocked — Foleon OAuth not configured. [Open Admin]              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ Setup required                                                               │
│ Foleon content cannot sync until backend OAuth setup is completed.            │
│                                                                              │
│ Next step: Ask HB Intel Admin to finish Foleon OAuth settings. [Open Admin]   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬─────────────────────────────────────┬────────────────┐
│ Feed Slots           │ Editorial Queue                      │ Inspector      │
│                      │                                     │                │
│ Project Spotlight    │ No content yet                       │ Select content │
│ Empty                │ Finish setup, then sync Foleon.      │ to manage      │
│                      │                                     │ placement.     │
│ Company Pulse        │                                     │                │
│ Empty                │                                     │                │
│                      │                                     │                │
│ Leadership Message   │                                     │                │
│ Empty                │                                     │                │
└──────────────────────┴─────────────────────────────────────┴────────────────┘
```

## Default Feed Desk — With Content

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Foleon Feed Manager                              [Sync Foleon] [Open Foleon] │
│ Last sync 9:42 AM · 18 source items · 3 live · 4 need attention · 2 scheduled │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ Recommended next action: 4 items need placement review. [Review items]        │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬─────────────────────────────────────┬────────────────┐
│ Feed Slots           │ Editorial Queue                      │ Inspector      │
│                      │ [Search] [All][Needs action][Ready] │ Selected item  │
│ Project Spotlight    │                                     │ details        │
│ Live: SCR Residence  │ Status | Title | Feed | Window | CTA│                │
│ Next: Not scheduled  │ ─────────────────────────────────── │ Readiness      │
│                      │ Blocked | April Pulse | Pulse | —   │ Placement      │
│ Company Pulse        │ Ready   | Project Story | Spotlight │ Schedule       │
│ Live: March Pulse    │ Live    | Safety Highlight | Pulse  │ Preview        │
│ Next: April Pulse    │                                     │ Actions        │
│                      │                                     │                │
│ Leadership Message   │                                     │                │
│ Empty                │                                     │                │
└──────────────────────┴─────────────────────────────────────┴────────────────┘
```

## Schedule Workspace

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Schedule                                                                     │
│ Manage active, upcoming, and expired HB Central feed placements.              │
└──────────────────────────────────────────────────────────────────────────────┘

[Upcoming] [Active] [Expired] [Blocked]

Date/Window           Feed                Content                 Status
Apr 01 - Apr 30       Company Pulse       April Company Pulse     Scheduled
Apr 01 - Apr 30       Project Spotlight   SCR Residence           Ready
No window             Leadership Message  Leadership Update       Needs window
```

## Preview Workspace

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Preview                                                                      │
│ Validate what employees will see before activating content.                   │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬───────────────────────────────────────────────────────┐
│ Preview Controls     │ Employee-facing preview                               │
│ Feed: Company Pulse  │                                                       │
│ Content: April Pulse │ If governed preview route is unavailable:             │
│ [Open Foleon]        │ “Preview is not configured yet.”                      │
│ [Open Admin]         │ Show owner, reason, next action.                      │
└──────────────────────┴───────────────────────────────────────────────────────┘
```

## Admin Workspace

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Admin                                                                        │
│ Configure and troubleshoot Foleon sync, Graph lists, and package/runtime.     │
└──────────────────────────────────────────────────────────────────────────────┘

Readiness
[OAuth] [Graph Lists] [Registry] [Package]

Required actions
1. Finish backend Foleon OAuth sync.
2. Verify sync route authorization.

Diagnostics
[Show redacted proof]
```

