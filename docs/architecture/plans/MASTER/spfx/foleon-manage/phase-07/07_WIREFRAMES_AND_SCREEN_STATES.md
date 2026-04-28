# 07 — Wireframes and Screen States

## 1. Default Ready State

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Foleon Manager                                                       │
│ Place Foleon content into HB Central reader lanes.                   │
│ Last sync: 9:14 AM | System ready                                    │
│ [Sync from Foleon] [Review new content] [Manage placements] [Admin]  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────── Content Inbox ────────────┐ ┌──────── Lane Control Board ────────┐
│ Filters: New Unassigned Blocked Live  │ │ Project Spotlight                   │
│ Search: [title, doc id, market]       │ │ Live: Orchid Tower April Feature     │
│                                       │ │ Staged: None                         │
│ • New: Midtown Office Update          │ │ Status: Needs staged content         │
│ • Unassigned: Leadership Q2 Message   │ │ [Preview lane] [Place content]       │
│ • Ready: Field Safety Feature         │ │                                      │
└───────────────────────────────────────┘ │ Company Pulse                       │
                                          │ Live: April Pulse                    │
                                          │ Staged: May Pulse draft              │
                                          │ Status: Ready                        │
                                          └──────────────────────────────────────┘
```

## 2. New Content Available State

```text
[Alert strip] 4 new Foleon items found since last sync.
[Review new content] opens inbox filtered to New.

Inbox row:
Thumbnail | Title | Source date | Recommended lane | Readiness | Action
Image     | New Project Spotlight Draft | Today | Project Spotlight | Ready | Place
```

## 3. Lane Selected State

```text
Lane Board > Company Pulse

┌───────────────────────────────┐
│ Company Pulse                  │
│ Live now: April Company Pulse  │
│ Staged next: May Company Pulse │
│ Display window: May 1 - May 31 │
│ Readiness: Ready               │
│ Next action: Preview and activate│
│ [Preview employee view] [Activate staged] [Edit timing]              │
└───────────────────────────────┘
```

## 4. Placement Workflow State

```text
Place Content
Step 1: Selected content
  Midtown Office Update

Step 2: Readiness
  ✅ Published Foleon URL available
  ✅ Embed URL approved
  ⚠ Needs display window

Step 3: Choose lane
  ( ) Project Spotlight
  (•) Company Pulse
  ( ) Leadership Message

Step 4: Timing
  Display from [date/time] through [date/time]

Step 5: Preview
  [Open preview panel]

[Cancel] [Save as staged] [Validate & activate]
```

## 5. OAuth Missing State

```text
Foleon Manager — Setup needed

Graph/list reads: Ready
Foleon OAuth sync: Not configured
Placement writes: Disabled until admin completes setup

You can still review the homepage lane model and the manager workflow.

[Open Admin setup] [Copy setup summary] [Back to HB Central]

Lane preview cards remain visible with sample/skeleton content:
Project Spotlight | Company Pulse | Leadership Message
```

## 6. Empty Content State

```text
No Foleon content has been synced yet.

What happens next:
1. Confirm Foleon OAuth setup.
2. Sync from Foleon.
3. Review new content in this inbox.
4. Place content into HB Central lanes.

[Sync from Foleon] [Open Admin setup] [Open Foleon]
```

## 7. Admin Diagnostics State

```text
Admin / Config

Readiness Overview
[OAuth] [Graph lists] [Registry] [API audience] [Package/runtime]

Required Actions
1. Approve API access for HB SharePoint Creator / access_as_user.
2. Confirm Foleon OAuth settings exist in Function App configuration.
3. Confirm list IDs match HBCentral list bindings.

Diagnostics
[Show redacted proof]
[Copy redacted proof]
[View sync history]
```

## 8. Tablet / Narrow Layout

```text
Header compresses to two lines.
Primary actions collapse into [Actions].
Tabs become segmented control.

[Inbox]
[Selected content detail]
[Lane board]
[Placement workflow drawer]
[Preview opens full-screen modal]
[Admin diagnostics below primary workflow]
```
