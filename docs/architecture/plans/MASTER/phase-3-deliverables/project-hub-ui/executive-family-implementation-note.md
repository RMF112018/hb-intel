# Executive Family — Implementation Note

| Property | Value |
|----------|-------|
| **Created** | 2026-03-27 |
| **Scope** | Wireframe spec 05 → `executive` layout family |
| **Package** | `@hbc/features-project-hub` v0.2.25 |

---

## What Is Intentionally PWA-Deeper

The executive cockpit is a **PWA-primary** surface. The following capabilities require full PWA depth:

- **Watchlist panel** — cross-project signal aggregation requires portfolio-level data access not available in single-project SPFx context.
- **Risk/exposure canvas** — multi-zone analytics (cost, schedule, quality/safety, cross-driver correlation) with intervention CTAs.
- **Intervention rail** — leadership actions (assign, escalate, request review, create follow-up) that may generate work items or escalation routes.
- **Trend/timeline zone** — historical trend comparison and threshold-crossing analysis.

## What Is Companion-Safe in SPFx

The SPFx dashboard renders the **project-operating** family for all roles, including executives who access the SPFx surface. The SPFx companion surface intentionally does NOT render the executive cockpit because:

1. **Single-project scope**: SPFx runs in a single SharePoint project site. The watchlist is inherently cross-project.
2. **Lane doctrine**: The SPFx dashboard lane is governed for canvas + module launchers + escalation hub. Executive analytics are deeper than companion-safe.
3. **Escalation path**: Executives on SPFx who need the cockpit use the existing "Cross-project navigation" escalation scenario to launch the PWA.

## Architecture Decisions

- **Same route structure**: Executive family renders at `/project-hub/$projectId` inside the same `WorkspacePageShell layout="dashboard"` — no new routes.
- **Shared activity strip**: The `ActivityStrip` component is reused from the project-operating family. Mock data is shared.
- **Resolver already configured**: `resolveProjectHubLayoutFamily()` maps `portfolio-executive` and `leadership` roles to `executive` family by default.
- **Mock data hooks**: `useWatchlistSummary`, `useRiskExposureSummary`, and `useInterventionQueue` return deterministic mock data. Real integration requires health-pulse cross-project aggregation and work-queue/escalation pipeline.

## Remaining Gaps for Field-Tablet Family

1. **No location/area data model**: The field-tablet family needs a location-first paradigm with area/sheet pane — no spatial data model exists yet.
2. **No sync-state primitives**: Field-tablet requires prominent sync/upload status — no sync-state hook exists.
3. **No quick-action-bar component**: The always-visible bottom action bar with field capture actions (Capture, Markup, Issue, Checklist) has no equivalent in the current component set.
4. **Touch-density enforcement**: The field-tablet family should force touch density by default — the resolver supports this via `devicePosture: 'field-tablet'` but no device detection hook exists for distinguishing field-tablet from regular tablet.
