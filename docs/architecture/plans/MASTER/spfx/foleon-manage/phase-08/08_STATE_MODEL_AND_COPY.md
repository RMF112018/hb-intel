# 08 — State Model and Copy

## Global System State

### OAuth / Sync Blocked

Title:
> Foleon sync is blocked

Body:
> The Manager can display existing records, but it cannot import new Foleon content until backend OAuth setup is complete.

Primary CTA:
> Open Admin

Secondary:
> Open Foleon

### Graph/List Not Configured

Title:
> SharePoint list connection is incomplete

Body:
> HB Central list bindings must be configured before content and placement records can load.

Primary CTA:
> Open Admin

### No Content Yet

Title:
> No Foleon content has been synced yet

Body:
> Finish setup, then sync Foleon Docs to populate the editorial queue.

Primary CTA:
> Sync Foleon

### Content Available, Nothing Placed

Title:
> Content is available but no feed slots are active

Body:
> Assign content to Project Spotlight, Company Pulse, or Leadership Message to start publishing through HB Central.

Primary CTA:
> Review unassigned content

### Content Live

Title:
> HB Central feeds are active

Body:
> Review upcoming display windows and validate staged content before activation.

Primary CTA:
> Review schedule

## Queue Item States

- Needs attention
- Unassigned
- Ready
- Scheduled
- Live
- Expired
- Archived
- Blocked

## Blocked State Copy Pattern

Every blocked item must answer:

1. What is wrong?
2. Who can fix it?
3. What is the next action?
4. Is this a Foleon source problem, HB Central placement problem, or backend/admin problem?

## Header Copy

Title:
> Foleon Feed Manager

Subtitle:
> Place Foleon-produced content into HB Central feeds, schedule display windows, and validate what employees will see.

Primary button logic:

- If sync blocked: `Open Admin`
- If no content and sync ready: `Sync Foleon`
- If content needs attention: `Review queue`
- If content stable: `Open schedule`

Do not show all actions at once.

## Nav Copy

- Feed Desk
- Schedule
- Preview
- Admin

## Feed Slot Labels

- Project Spotlight
- Company Pulse
- Leadership Message

Avoid developer labels:

- Reader key
- Homepage slot
- Placement key
- Archive group
- Cadence

These can remain in Admin/Advanced Details, not primary UI.

