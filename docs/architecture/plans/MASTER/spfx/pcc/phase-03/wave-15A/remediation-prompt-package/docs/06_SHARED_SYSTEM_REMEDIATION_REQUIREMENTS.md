# 06 — Shared System Remediation Requirements

## Purpose

Define shared PCC system requirements that must be remediated before broad surface work.

## Shell / Host Fit

Required outcomes:

- Shell supports operational content instead of dominating it.
- Header/chrome density is appropriate for SharePoint-hosted full-page app behavior.
- PCC does not look like an isolated native app forced into SharePoint.
- Tenant and local harness differences are documented.

Likely source areas:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/**/*.module.css
```

## Navigation / IA

Required outcomes:

- Navigation communicates surface purpose and status.
- Users can identify priority surfaces and workflow state.
- Active route state is obvious.
- Navigation remains usable in constrained SharePoint widths.

## Project Context / Surface Header

Required outcomes:

- Active project identity is visible and consistent.
- Project number/name/status/source confidence/last updated are handled consistently where relevant.
- Surface headers state the operational purpose and primary action/status.
- Headers are not oversized or decorative.

## Grid / Bento / Card System

Required outcomes:

- Primary operational content cannot collapse into unusable spans.
- Card hierarchy reflects priority.
- Cards have consistent header, metadata, body, action, and state patterns.
- Card density is professional and readable.

Likely source areas:

```text
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/useBentoRowSpan.ts
```

## State Model / Product Language

Required outcomes:

- Preview/read-only/degraded/no-data/locked/disabled states are product language, not developer explanations.
- Each unavailable or disabled state explains why and what the user can do next.
- No surface is dominated by generic unavailable content.
- Preview-safe content appears wherever live data is unavailable.

Likely source areas:

```text
apps/project-control-center/src/ui/PccPreviewState.tsx
apps/project-control-center/src/api/pccReadModelStateMapping.ts
apps/project-control-center/src/surfaces/**/sourceStateMessaging.ts
```

## Accessibility / Keyboard

Required outcomes:

- Keyboard navigation reaches all actionable elements in logical order.
- Focus states are visible.
- Disabled controls have accessible explanation.
- Landmarks/headings support scan and navigation.
- Any final 56/56 claim includes accessibility evidence.
