# 03 — Failure Diagnosis

## Executive Diagnosis

The current UI is failing because it is being redesigned incrementally around the wrong mental model.

The intended product is a **news/feed manager**. The implemented product is a sequence of developer/admin surfaces:

- command shell,
- summary strip,
- next action band,
- nav tabs,
- content buckets,
- lane board,
- preview placeholder,
- admin config.

Each of those surfaces may be individually defensible, but together they create a jumbled and incoherent app.

## What the Hosted Screenshots Prove

The screenshots show:

1. Too many horizontal bands before the real workspace begins.
2. A dense top command area that reads like a debug toolbar.
3. Primary nav that separates things that should be part of one task flow.
4. The default Content Operations screen is mostly empty bucket groups.
5. Lane Board is a detached board with no connection to the content queue.
6. Preview is an unproductive placeholder surface.
7. Admin/Config is still too close to the primary path.
8. Large unused space remains visually dominant.
9. The app gives the user no immediate operational “thing to do” beyond reading status messages.

## Root Causes

### Root Cause 1 — Wrong Primary IA

`Content Operations / Lane Board / Preview / Admin` is not the IA of a feed management product. It is an implementation map.

### Root Cause 2 — Too Many Surfaces

The current page tries to show:

- global commands,
- status chips,
- KPI strip,
- recommended action,
- warning banner,
- primary nav,
- workspace content.

This creates a “stacked dashboard” instead of an application.

### Root Cause 3 — Placement Is Detached From Content

A content manager should be able to pick content and place/schedule it without switching mental contexts. Current `Lane Board` separates placement from the queue.

### Root Cause 4 — Empty State Is Treated as Absence, Not Workflow

A no-content state should become setup guidance. Instead, the current UI shows empty buckets and zero metrics.

### Root Cause 5 — Visual Hierarchy Relies on Borders and Panels

The CSS still encodes `.panel` as a universal section wrapper. This prevents the app from feeling like a product surface.

### Root Cause 6 — Top Actions Are Not Prioritized

Daily users need:

- Sync/check source content.
- Review queue.
- Place/schedule selected item.
- Preview result.

They do not need seven separate top-level buttons visible at all times.

## Remediation Principle

Stop iterating on the current shell. Replace it with a proven editorial desk structure:

**Header + Feed Desk + Inspector + Schedule + Preview + Admin**

