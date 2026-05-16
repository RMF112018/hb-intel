# 05 — Target Module State Matrices

## Purpose

This file defines exact state-handling behavior for the two rendered modules. Implementation must follow these matrices rather than inventing new state posture.

---

# 1. Adobe Sign Action Queue — Single Card State Matrix

## Card Identity

- Eyebrow: `Adobe Sign`
- Header title region: in-card view selector
  - `Action Queue` (default selected)
  - `Completed` (deselected until selected by user)

## Header-toggle visibility gating

Show the header view selector only when queue state is data-capable:

- `partial`
- `available-empty`
- `available-items`

Hide the selector for:

- `loading`
- `authorization-required`
- `configuration-required`
- `principal-unresolved`
- `source-unavailable`
- `backend-unavailable`

## Metrics When Applicable

Show only in `available` and `partial` states:

1. Pending agreements
2. Signature actions
3. Review actions

## List Behavior When Applicable

- Top **5** items maximum in collapsed card view.
- Preserve per-item:
  - agreement name;
  - required action label;
  - sender label when available;
  - expiration label when available.
- If pagination indicates more items:
  - show `View all in Adobe Sign`.

For completed view rows, preserve only:

- agreement name;
- sender label when available;
- date label:
  - `Completed ...` when `completedAtUtc` exists;
  - `Updated ...` when only `modifiedAtUtc` exists;
- `Open in Adobe Sign` only when row-level `sourceOpenUrl` exists.

Completed rows must not render pending required-action semantics.

---

## 1.1 Loading

### Header badge

`Loading`

### Body

- Polished compact loading placeholders or skeleton rows.
- No connect CTA.
- No unavailable message.
- No metrics placeholder dashes.

### Exit condition

Resolved read-model source status.

---

## 1.2 Authorization Required

### Header badge

`Connect required`

### Body copy

`Connect Adobe Sign to load agreements that need your review, signature, approval, or other action.`

### Primary CTA

`Connect Adobe Sign`

### Explicit exclusions

- No standalone connection card.
- No standalone queue-state card.
- No fake metrics.

---

## 1.3 Configuration Required

### Header badge

`Configuration required`

### Body copy

`Adobe Sign must be configured before your action queue can load.`

### CTA

None.

### Explicit exclusions

- No misleading user-connect CTA.
- No page-level warning.

---

## 1.4 Principal / Account Unresolved

### Header badge

`Account needs attention`

### Body copy

`Your HB account could not be matched to an Adobe Sign user for this queue.`

### CTA

None.

### Optional secondary cue

`Contact an administrator if this persists.`

---

## 1.5 Source Unavailable

### Header badge

`Temporarily unavailable`

### Body copy

`Adobe Sign is temporarily unavailable. Your queue will resume once the source is reachable.`

### CTA

None unless current repo truth already exposes a truthful, non-destructive manual retry action. Do not invent one.

---

## 1.6 Backend Unavailable

### Header badge

`Temporarily unavailable`

### Body copy

`The My Dashboard service is not responding right now. Try again shortly.`

### CTA

None unless current repo truth already exposes a truthful, non-destructive manual retry action. Do not invent one.

---

## 1.7 Partial Data

### Header badge

`Partial data`

### Body

- Compact inline caution:
  `Some queue details may be incomplete. Showing the latest available Adobe Sign results.`
- Metrics strip visible.
- Top 5 available items visible.
- Handoff to Adobe Sign remains visible where applicable.

---

## 1.8 Available + Zero Items

### Header badge

`Ready`

### Body copy

`No Adobe Sign agreements currently need your action.`

### Metrics

May remain visible only if they are truthful zero-value metrics and presented compactly. Prefer metrics hidden when they add no decision value.

### Handoff CTA

Optional `Open Adobe Sign` only if the source handoff remains useful and already supported by current model/seam. Do not invent a URL.

---

## 1.9 Available + Pending Items

### Header badge

`Ready`

### Body

- Metrics strip visible.
- Up to 5 action items visible.
- Each item prioritizes agreement name and required action.
- Show sender and expiration when available.

### Handoff

- `Open in Adobe Sign`
- `View all in Adobe Sign` if pagination indicates more items.

---

## 1.10 Completed View — Loading

### Panel state marker

`loading`

### Body

- Render completed loading posture while first completed fetch is unresolved.
- Keep pending state intact and immediately restorable when user toggles back.

## 1.11 Completed View — Available Empty

### Panel state marker

`available-empty`

### Body copy

`No completed Adobe Sign agreements were found in the last 30 days.`

## 1.12 Completed View — Available Items

### Panel state marker

`available-items`

### Body

- Metric label: `Completed in last 30 days`
- Up to 5 completed rows.

## 1.13 Completed View — Partial

### Panel state marker

`partial`

### Body copy

`Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.`

### Body

- Render available completed rows/metric when present.

## 1.14 Completed View — Degraded

### Panel state markers

- `source-unavailable`
- `backend-unavailable`
- `authorization-required`
- `configuration-required`
- `principal-unresolved`

### Body copy

`Recently completed Adobe Sign agreements are temporarily unavailable.`

---

# 2. My Projects — Single Card State Matrix

## Card Identity

- Eyebrow: `My Work`
- Title: `My Projects`
- Support copy:
  `Open the projects you are assigned to in SharePoint or Procore.`

## Compact Stats Strip

Display only when usable rows exist or the data is partial but still meaningfully populated.

Stats:

1. Assigned Projects
2. Dual Launch Ready
3. SharePoint Ready
4. Procore Ready

When no usable rows exist:

- hide the strip;
- do not show four zero-value tiles.

---

## 2.1 Loading

### Body

- Show support copy.
- Show compact loading rows/skeleton placeholders where project launches will appear.
- No zero metrics.
- No empty-state claim.

---

## 2.2 Available + Zero Assigned Projects

### Body copy

`No assigned projects were found for your current project-role assignments.`

### Metrics

Hidden.

### Launch list region

Do not render a large empty launch region. Render only a compact empty state block.

---

## 2.3 Populated

### Body

- Compact stats strip.
- Top **5** project rows.
- Preserve:
  - source badge;
  - project number;
  - project name;
  - project stage when available;
  - role chips with overflow;
  - SharePoint launch action;
  - Procore launch action.

### Disclosure

If more than 5 rows:

- collapsed: `View all My Projects`
- expanded: `Show fewer`

---

## 2.4 Partial Source / Partially Verified Launch Destinations

### Inline alert copy

`Some launch destinations could not be fully verified. Available project links are shown below.`

### Body

- Keep usable rows visible.
- Keep stats strip visible if populated.
- Do not collapse into a failure/empty surface.

---

## 2.5 Principal Unresolved

### Body copy

`We could not confirm your project assignment identity for this view.`

### Metrics

Hidden unless current repo truth provides meaningful populated rows despite the status; default posture is hidden.

### Launch rows

Do not display an empty launch-list shell solely to show no rows.

---

## 2.6 Source Unavailable

### Body copy

`Project launch sources are temporarily unavailable. Try again shortly.`

### Metrics

Hidden when no usable rows exist.

### Launch rows

If none exist, do not render empty list scaffolding.

---

## 2.7 Backend Unavailable

### Body copy

`Project links are temporarily unavailable while the My Dashboard service is unreachable.`

### Metrics

Hidden when no usable rows exist.

### Launch rows

No oversized empty region.
