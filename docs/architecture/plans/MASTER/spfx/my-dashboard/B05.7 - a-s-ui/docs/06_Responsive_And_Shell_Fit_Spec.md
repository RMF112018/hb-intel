# 06 — Responsive and Shell-Fit Specification

## Objective

Make the Adobe Sign card **application-responsive**, not merely shell-responsive. The shell already exposes container modes and span overrides. This spec defines how the Adobe module itself must adapt inside those modes.

## Existing Shell Modes

The current My Dashboard shell recognizes:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

## Locked Span Posture

Do not change the current home-surface span overrides during this effort unless Prompt 06 proves the target cannot be reached without changing them and the agent stops for review.

## New Adobe Card Layout Marker

The Adobe card must expose:

```text
data-adobe-sign-layout-mode="{mode}"
```

using the current My Work responsive mode available from the bento context or the card shell.

This marker supports:

- targeted CSS;
- hosted evidence;
- DOM-based test assertions.

## Wide Modes

### Modes

- `largeLaptop`
- `desktop`
- `ultrawide`

### Required behavior

- Card title/status row may stay horizontally compact.
- View switch remains below the header.
- Freshness rail renders inline.
- Summary rail may use a horizontal metric layout.
- Activity rows may use:
  - title/metadata block on the left;
  - explicit Open action on the right.
- No card stretch to sibling height.

## Mid Modes

### Modes

- `standardLaptop`
- `smallLaptop`

### Required behavior

- Card remains companion module if span widths remain viable.
- View switch must retain full readability.
- Status chip may wrap beneath title if required.
- Summary rail may wrap or stack.
- Activity rows must not compress into unreadable one-line clumps.
- Open action remains visible and reachable.

## Tablet Landscape

### Mode

- `tabletLandscape`

### Required behavior

- Adobe card receives full row width under the locked span policy.
- View switch can remain inline but must remain tappable.
- Summary rail can use 2-column/3-column internal layout only if it remains readable.
- Rows should prefer title line + metadata/action line posture.

## Tablet Portrait

### Mode

- `tabletPortrait`

### Required behavior

- Single-column hosted card posture.
- Status chip may stack below title if necessary.
- View switch becomes full-width or nearly full-width.
- Metrics stack.
- Each activity row becomes vertically composed:
  - title;
  - metadata;
  - Open action.
- No action link may disappear into text overflow.

## Phone

### Mode

- `phone`

### Required behavior

- Card uses a disciplined compact single-column layout.
- Header has:
  - eyebrow;
  - title;
  - status chip either same line only if stable, otherwise below title.
- View switch uses full-width segmented treatment.
- Freshness rail wraps cleanly.
- Summary metrics stack.
- Rows are fully vertical.
- Open action remains visible and tap-safe.
- Long titles wrap to a controlled multi-line posture rather than truncating primary meaning too aggressively.

## Short-Height / Constrained Browser

Because the card can appear in a SharePoint-hosted page with limited usable height:

- no empty state should create large dead volume;
- no panel should vertically center content in a way that wastes first-screen space;
- do not add large illustrations that reduce operational scan efficiency;
- use compact authored state panels.

## Specific Reflow Rules

### Header

- Eyebrow is always first.
- Title is always primary.
- Status chip never precedes the title.
- If title + chip do not fit, chip moves beneath title, not before it.

### View switch

- Minimum target height: 36px per tab.
- On phone/tablet portrait, controls may fill available width.
- Active state remains visually decisive.

### Status/freshness rail

- Status chip and freshness label may occupy separate rows in compact modes.
- Freshness can wrap; do not ellipsize to unreadable fragments.

### Summary metrics

- Wide: compact rail.
- Mid: wrap allowed.
- Portrait/phone: stack.

### Activity rows

- Wide: title/metadata block + Open action can sit horizontally.
- Mid: title and metadata wrap; action remains visible.
- Portrait/phone: action moves below metadata or remains in a clearly separated trailing column only if width proves sufficient.

### Preview context

- Must not be squeezed against row content.
- Renders as its own subdued line beneath the list.

## Testable Markers

Prompt 06 should preserve or add DOM attributes that make responsive evidence easier:

```text
data-adobe-sign-layout-mode
data-adobe-sign-view-switch
data-adobe-sign-status-chip
data-adobe-sign-activity-row
data-adobe-sign-preview-context
```

## Non-Goals

Do not:

- modify My Projects card;
- alter top-level row choreography;
- change span overrides silently;
- introduce complex drawers or modal surfaces.
