# 03 — Target Flagship Card Anatomy and UX Specification

## Target Module Identity

```text
Eyebrow: Adobe Sign
Title: Agreement Activity
Views: Action Queue | Completed
Role: Compact operational companion
```

## Target Visual Anatomy

```text
┌──────────────────────────────────────────────────────────────┐
│ ADOBE SIGN                                  [STATUS CHIP]     │
│ Agreement Activity                                           │
│                                                              │
│ [ Action Queue ] [ Completed ]                               │
│ Last refreshed May 16, 2026, 8:42 AM UTC                     │
│ ──────────────────────────────────────────────────────────── │
│ View summary / state lead                                     │
│                                                              │
│ View-specific metrics or authored state panel                │
│                                                              │
│ Activity list, when populated                                │
│  • Title                                                     │
│    Metadata                                     [ Open ↗ ]   │
│  • Title                                                     │
│    Metadata                                     [ Open ↗ ]   │
│                                                              │
│ Optional preview-limit context                               │
└──────────────────────────────────────────────────────────────┘
```

## Core Design Principles

### 1. Compact authority

The card should feel visually important without consuming unnecessary vertical volume.

### 2. Status confidence

The user should immediately know:

- whether the source is ready;
- whether the panel is partial or degraded;
- when the data was last refreshed.

### 3. Strong scan path

The eye should move:

1. Adobe Sign
2. Agreement Activity
3. active view
4. status/freshness
5. summary
6. rows or state panel
7. explicit row action

### 4. No ambiguous click targets

Rows are readable objects, not unclear hover buttons. Actions are explicit.

### 5. View switching is intentional

The user consciously switches between:

- work awaiting action;
- work recently completed.

The control must feel like a real application state switch, not a text styling trick.

## Action Queue View

### Ready + empty

The card should render:

- status chip: `Ready`;
- freshness label when available;
- authored empty-state panel:
  - title: `No Adobe Sign agreements need your action.`
  - supporting line: `Your queue is clear based on the latest available Adobe Sign read.`
- no metric rail;
- no rows;
- no CTA.

### Ready + populated

The card should render:

- status chip: `Ready`;
- freshness label;
- queue summary rail:
  - pending agreements;
  - signature actions;
  - review actions;
- Adobe activity list rows:
  - agreement title;
  - required action;
  - sender if present;
  - expiration if present;
  - explicit Open action if URL exists.
- preview-limit context if visible rows < total queue count.

### Partial

The card should render:

- status chip: `Partial data`;
- freshness label when available;
- caution state message:
  - `Some queue details may be incomplete. Showing the latest available Adobe Sign results.`
- same metric/list treatment as populated, using available data;
- preview-limit context when applicable.

### Authorization required

The card should render:

- status chip: `Connect required`;
- state panel with:
  - title: `Connect Adobe Sign to load your action queue.`
  - body: `Agreements needing your review, signature, approval, or other action will appear here after authorization.`
- Connect CTA:
  - `Connect Adobe Sign`
- connecting and failure sub-states preserved.

### Configuration required

Render:

- status chip: `Configuration required`;
- state panel:
  - title: `Adobe Sign setup is required.`
  - body: `This dashboard cannot load agreement activity until Adobe Sign configuration is completed.`

### Principal unresolved

Render:

- status chip: `Account needs attention`;
- state panel:
  - title: `Adobe Sign account matching needs attention.`
  - body: `Your HB account could not be matched to an Adobe Sign user for this activity panel.`
  - supporting line: `Contact an administrator if this persists.`

### Source/backend unavailable

Render:

- status chip: `Temporarily unavailable`;
- state panel with source-appropriate copy;
- no fake retry unless the owning runtime path already provides one. This package adds retry only to Completed's card-owned lazy fetch.

## Completed View

### Initial activation/loading

On first activation:

- status chip: `Loading history`;
- state panel with skeleton or authored loading body;
- `role="status"` around loading text;
- no metrics or rows until data arrives.

### Ready + populated

Render:

- status chip: `Ready`;
- freshness label;
- summary rail:
  - `{count} completed in the last 30 days`
- activity list rows:
  - agreement title;
  - date and/or sender metadata;
  - explicit Open action if URL exists.
- preview context:
  - `Showing latest {displayed} of {total} completed agreements.`
  - only when displayed < total.

### Ready + empty

Render:

- status chip: `Ready`;
- freshness label when available;
- authored empty panel:
  - title: `No completed agreements were found in the last 30 days.`
  - body: `Recent completion history will appear here when Adobe Sign reports completed agreements.`

### Partial

Render:

- status chip: `Partial data`;
- caution panel:
  - `Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.`
- completed summary + rows where available.

### Authorization/configuration/principal/source/backend unavailable

Render state-specific authored panels using the copy deck.  
Because Completed is a card-owned lazy request, degraded fetch states include:

- visible status;
- explanatory message;
- `Retry` control.

## Row Anatomy

### Queue row

```text
[Agreement title]
Required action · From Sender · Expires Date        [ Open ↗ ]
```

### Completed row

```text
[Agreement title]
Completed Date · From Sender                         [ Open ↗ ]
```

If no date:

```text
[Agreement title]
From Sender                                           [ Open ↗ ]
```

If no date and no sender:

```text
[Agreement title]
Completion metadata not reported.                    [ Open ↗ ]
```

## Visual Density

### Desired posture

- compact enough to avoid low-value whitespace;
- spacious enough to avoid text-clump fatigue;
- stronger separation between:
  - header/status rail;
  - summary rail;
  - state/list body.

## Negative Space Rule

Whitespace must be:

- authored;
- supporting hierarchy;
- not inherited accidental row height.

The empty Action Queue card is **not** allowed to visually resemble a mostly-empty column-sized placeholder.
