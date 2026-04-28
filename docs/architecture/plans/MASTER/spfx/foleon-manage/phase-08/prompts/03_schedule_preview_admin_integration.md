# Prompt 03 — Schedule, Preview, and Admin Integration

## Objective

Build secondary workspaces without polluting the default Feed Desk.

## Workspaces

1. Schedule
2. Preview
3. Admin

## Schedule Requirements

Create `ScheduleWorkspace.tsx` and `scheduleViewModel.ts`.

Group placements/content by:

- Active now
- Upcoming
- Missing display window
- Expired
- Blocked

Use list/table first. Do not build a calendar unless already trivial.

## Preview Requirements

Create `PreviewWorkspace.tsx` and `previewViewModel.ts`.

Preview must:

- let user select feed/channel and content if data exists,
- use governed safe-origin rules,
- show blocked state if route/iframe preview is not ready,
- provide Open Foleon and Open Admin actions where appropriate,
- not invent reader output.

## Admin Requirements

Create `AdminWorkspace.tsx` wrapping current `FoleonConfigTab` initially.

Admin must preserve:

- readiness groups,
- required admin actions,
- diagnostics toggle,
- redacted proof,
- sync history,
- no-secret behavior.

## Guardrails

- Admin stays out of Feed Desk.
- Preview is honest if not fully implemented.
- No ungoverned iframe.
- No backend route changes unless strictly required.

## Tests

- Schedule workspace renders groups.
- Preview workspace renders blocked/ready state honestly.
- Admin workspace still renders current diagnostics.
- Redacted proof tests remain green.

## Commit Message

`SPFx Foleon Manager: add schedule preview and admin workspaces`

