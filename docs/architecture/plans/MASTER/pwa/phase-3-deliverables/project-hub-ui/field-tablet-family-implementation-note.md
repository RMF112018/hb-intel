# Field Tablet Family — Implementation Note

| Property | Value |
|----------|-------|
| **Created** | 2026-03-27 |
| **Scope** | Wireframe spec 07 → `field-tablet` layout family |
| **Package** | `@hbc/features-project-hub` v0.2.26 |

---

## What Was Implemented as Real Family Behavior

The field-tablet family is a **touch-first, reduced-cognitive-load Project Hub surface** that provides:

1. **FieldFocusRail** (left) — Work area navigation derived from module categories (site-wide, foundation, structural, MEP, exterior). Each area shows open/urgent item counts. Touch-first: 48px minimum row heights, generous tap spacing.
2. **FieldActionStack** (right/center) — Action cards grouped by category (Inspection, Observation, Punch/QC/Safety, Next Move). Each card shows severity strip, area label, owner, due/aging state, and module-open CTA. Filters by selected area. Touch-first card sizing.
3. **FieldQuickActionBar** (bottom, always visible) — Persistent toolbar with 6 actions: Capture, Markup, Issue, Checklist, Review, Open Full Surface. Touch-safe 44px minimum targets.
4. **FieldSyncStatusBar** (footer) — Sync state indicator with pending/failed upload counts and last-sync timestamp.
5. **Split-pane layout** — CSS grid with focus rail (240px) + action stack (1fr) on tablets (≥1024px); stacked single-column on smaller viewports.
6. **Touch density forced** — All components use `HBC_DENSITY_TOKENS.touch` values (48px min targets, 16px tap spacing, 7:1 contrast eligible).

## What Remains Future Deeper Field Scope

The following capabilities are **honest placeholders** — the underlying runtime does not exist in repo truth:

| Capability | Spec Requirement | Current State |
|-----------|-----------------|---------------|
| **Plan sheet / drawing overlay** | R2: sheet/location indicator, linked pins/overlays, zoom/pan | Placeholder — area rail uses module categories, not spatial data |
| **Photo capture** | R4: "Capture" action | Button renders but is disabled ("Coming soon") |
| **Drawing markup** | R4: "Markup" action | Button renders but is disabled ("Coming soon") |
| **Offline sync runtime** | R5: pending/failed uploads, retry | Mock data returns `synced` state; no real offline queue |
| **Location-native pin selection** | R2: selecting a pin updates action stack | Area selection uses list navigation, not spatial pins |
| **Weather/shift context** | R1: optional weather or shift | Not implemented — no weather data source |

These placeholders are intentional transparency. The field-tablet family provides genuine value today as a touch-optimized, area-organized, action-first view of existing module posture and work data. The deeper field-native capabilities require spatial data models, capture/upload runtime, and offline-sync infrastructure that are separate implementation efforts.

## Role and Device Resolution

The layout-family resolver (already built) handles field-tablet selection:

- `field-engineer` + any device → `field-tablet` (default)
- `superintendent` + `field-tablet` device → `field-tablet` (device-forced)
- `superintendent` + `desktop` → `project-operating` (default, field-tablet allowed as override)
- Any role not allowed `field-tablet` → falls back to their default family

## SPFx Companion Behavior

The SPFx dashboard is **not modified** for the field-tablet family. SPFx always renders the project-operating surface. Rationale:

1. SPFx runs inside SharePoint which provides its own chrome — the field-tablet split-pane layout would conflict with the SharePoint webpart container.
2. Field tablet users are more likely to access the PWA directly on their tablet than use SharePoint.
3. The SPFx module lane and escalation-to-PWA paths remain the governed companion model.

## Follow-On Work

1. **Spatial data model** — location/area/zone records with spatial coordinates for plan-sheet integration
2. **Capture/upload runtime** — photo evidence capture with offline queue and retry
3. **Offline sync infrastructure** — intent log, conflict resolution, sync state hooks
4. **Device posture detection** — `useDevicePosture()` hook to distinguish field-tablet from regular tablet (orientation, pointer type, screen size heuristics)
5. **matchMedia listener** — replace `window.innerWidth` check with reactive resize observer
