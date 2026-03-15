<!-- Tier 1 — Living Reference Document -->

# Completion Confirmation and Optional Project Hub Handoff

**Document Class:** Living Reference (Diátaxis: Reference)
**Traceability:** W0-G4-T05 · `docs/architecture/plans/MVP/G4/W0-G4-T05-Completion-Confirmation-and-Optional-Project-Hub-Handoff.md`

---

## Overview

When a project setup request reaches the `Completed` state, the `RequestDetailPage` displays a `CompletionConfirmationCard` that provides:

1. A success badge and heading confirming the project is ready.
2. A completion timestamp (from `IProvisioningStatus.completedAt`).
3. A provisioned site summary: project name, department, type, site URL, team access count.
4. An optional "Open Project Hub" button that opens the provisioned SharePoint site in a new browser tab.
5. A "Stay in Estimating" button that dismisses the handoff section for the current session.
6. A complexity-gated provisioning checklist summary (standard tier and above).
7. A handoff status badge (hidden in Wave 0 — no `HandoffApi.create()` call).

---

## Completion Confirmation Layout

```
┌─────────────────────────────────────────────────┐
│ [✓ Provisioning Complete]  (HbcStatusBadge)     │
│                                                 │
│ {projectName} is ready        (heading2)        │
│ Completed on {date} at {time}                   │
│                                                 │
│ Project:     {projectName}                      │
│ Department:  {departmentLabel}                  │
│ Type:        {projectType}                      │
│ Site URL:    https://...sharepoint.com/...       │
│ Team Access: N access group(s) configured       │
│                                                 │
│ ┌─ Standard+ ──────────────────────────────┐    │
│ │ ProvisioningChecklist (summary mode)     │    │
│ └──────────────────────────────────────────┘    │
│                                                 │
│ Your project workspace — a curated hub ...      │
│                                                 │
│ [ Open Project Hub ]  [ Stay in Estimating ]    │
│                                                 │
│ [Handoff Status Badge — hidden in Wave 0]       │
└─────────────────────────────────────────────────┘
```

---

## URL Validation Rules

The project hub URL is resolved from `provisioningStatus.siteUrl` (preferred) or `request.siteUrl` (fallback).

A URL is considered valid when:
- It starts with `https://`
- It contains `.sharepoint.com`

When the URL is invalid or missing:
- The "Open Project Hub" button is replaced with a warning banner.
- The site URL summary line is hidden.

---

## Navigation Behavior

- **"Open Project Hub"**: Opens the provisioned site in a new browser tab via `window.open(url, '_blank', 'noopener,noreferrer')`. Never performs an in-app redirect.
- **"Stay in Estimating"**: Hides the handoff section (description + buttons) for the current session. The completion summary remains visible. Dismissal is not persisted — it resets on remount or navigation.
- **No auto-redirect or countdown timer** is used.

---

## Handoff Assembly

The component uses `usePrepareHandoff` from `@hbc/workflow-handoff` with `SETUP_TO_PROJECT_HUB_HANDOFF_CONFIG` from `@hbc/provisioning`.

**Sender identity** is constructed from `useCurrentSession()`:
- `userId`: `session.user.email` or `session.providerIdentityRef`
- `displayName`: `session.user.displayName`
- `role`: `'Requester'`

Assembly is enabled only when `request.state === 'Completed'` and the URL is valid.

In Wave 0, `HandoffApi.create()` is not called automatically, so the assembled package remains in component state. The `HbcHandoffStatusBadge` shows nothing (`status: null`).

---

## Complexity Gating

| Element | Essential | Standard | Expert |
|---------|-----------|----------|--------|
| Success badge + heading | Visible | Visible | Visible |
| Completion timestamp | Visible | Visible | Visible |
| Site summary fields | Visible | Visible | Visible |
| Provisioning checklist summary | Hidden | Visible | Visible |
| Open Project Hub / Stay buttons | Visible | Visible | Visible |
| Handoff status badge | Hidden | Label only | Label + timestamp |

---

## Project Hub Welcome Card

**Status:** Deferred (spec risk R3).

`IActiveProject` does not have a `provisionedAt` field, so the "recently provisioned" detection cannot work. A scaffold comment in `apps/project-hub/src/pages/DashboardPage.tsx` documents where the welcome card should be inserted once the model is extended.

---

## Boundary with Other Tasks

| Task | Boundary |
|------|----------|
| T01–T04 | Upstream — provide the completed request state and provisioning status |
| T07 | Responsive layout, failure/retry modes for the completion card |
| T08 | Automated testing for the completion card |
| G5 | PWA equivalent of the completion experience |
| Wave 1 | Interactive handoff via `HbcHandoffComposer`; `HandoffApi.create()` persistence |
