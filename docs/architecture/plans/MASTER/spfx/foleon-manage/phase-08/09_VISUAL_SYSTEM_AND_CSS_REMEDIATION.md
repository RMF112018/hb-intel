# 09 — Visual System and CSS Remediation

## Objective

Eliminate the current jumbled, horizontal-band, card-heavy UI. Build a product workspace with clear zones.

## CSS Hard Rules

1. `.panel` must not be used as a top-level section primitive.
2. Command/header/navigation/status sections must not compose `.panel`.
3. The app must not show a big tinted/green tray or card behind content.
4. Root canvas must be neutral.
5. Use cards only for actual child objects.
6. Use table/list/row patterns for the queue.
7. Use a persistent inspector panel on wide layouts.
8. Avoid full-width empty horizontal bands.

## Required CSS Restructure

Split `manageShell.module.css` into smaller modules or at minimum into named sections:

- `feedManagerShell.module.css`
- `feedDesk.module.css`
- `editorialQueue.module.css`
- `feedSlots.module.css`
- `feedInspector.module.css`
- `scheduleWorkspace.module.css`
- `previewWorkspace.module.css`
- `adminWorkspace.module.css`

If keeping one module temporarily, group it clearly and delete unused legacy blocks.

## Required Layout

Desktop/wide:

```css
.feedDeskGrid {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(520px, 1fr) minmax(340px, 420px);
  gap: var(--space-...);
  align-items: start;
}
```

Column 1: Feed Slots / filters  
Column 2: Editorial Queue  
Column 3: Inspector

If there is no selected item, inspector shows a helpful state, not empty whitespace.

Tablet:

- Slots become horizontal summary cards.
- Queue remains primary.
- Inspector becomes drawer/slide-over.

Phone:

- Header compresses.
- Feed slots become accordion/summary.
- Queue is full-width.
- Inspector is full-screen drawer.

## Header Remediation

Current header has too many visible buttons. Replace with:

- Left: title/subtitle.
- Middle or below: compact readiness/status pills.
- Right: one primary button + one utility menu.

Example:

```text
Foleon Feed Manager                     [Review queue] [⋯]
Place Foleon-produced content into HB Central feeds.
OAuth blocked · Last sync: none · 0 live · 0 scheduled
```

## Queue Remediation

Use a list/table, not stacked bucket blocks.

Desktop row columns:

- Status
- Title
- Feed
- Display window
- Readiness
- Action

Rows should be clickable and keyboard accessible.

## Feed Slot Remediation

Slot cards must be compact and subordinate to the queue.

Each slot:

- Label
- Live now
- Next scheduled
- Status
- One action

## Inspector Remediation

The inspector is where complexity lives. It can contain detail fields and workflow controls, but it must be clear and task-oriented.

Inspector sections:

1. Selected content
2. Readiness
3. Placement
4. Schedule
5. Preview
6. Publish / Activate

## Admin Remediation

Admin may remain data-dense, but must be behind the Admin workspace. It should not be part of the first-screen editorial experience.

