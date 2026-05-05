# 04 — Implementation Requirements

## Objective

Define exact remediation requirements for the local code agent.

## General Rules

- Start with local repo-truth inspection.
- Preserve current architecture unless it conflicts with doctrine.
- Prefer shared primitives over one-off styling.
- Keep surface content redesign out of Wave B except where needed to validate shell/nav/host behavior.
- Do not add backend/API, Graph, PnP, SharePoint REST, auth, Procore, Document Crunch, Adobe Sign, write routes, approvals execution, notifications, or provisioning scope.
- Do not claim final 56/56 from Wave B alone.
- Do not re-read files still in current context unless exact wording, line references, or changed repo state must be verified.

## Source Areas Likely to Change

Confirm locally before changing:

```text
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/state/usePccShellState.ts
apps/project-control-center/src/preview/projectPlaceholder.ts
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccNavigationRail.tsx
apps/project-control-center/src/shell/PccNavigationRail.module.css
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.tsx
apps/project-control-center/src/shell/PccProjectIntelligenceHeader.module.css
apps/project-control-center/src/shell/PccCommandSearch.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/PccBentoGrid.module.css
apps/project-control-center/src/tests/**
```

Potential new source primitives:

```text
apps/project-control-center/src/shell/PccProjectContextBand.tsx
apps/project-control-center/src/shell/PccProjectContextBand.module.css
apps/project-control-center/src/shell/PccNavigationModel.ts
apps/project-control-center/src/shell/PccShellStatus.tsx
apps/project-control-center/src/shell/PccShellStatus.module.css
```

Do not create these if a better existing repo primitive exists.

## Shell Requirements

- Reduce shell visual dominance.
- Keep PCC identity clear but compact.
- Move diagnostics/wave/fixture/no-live-data details out of the primary hierarchy.
- Preserve product-grade preview/source-confidence indicator.
- Ensure top command/header area is compact.
- Add stable Wave B data markers without unnecessarily breaking existing markers.

## Project Context Requirements

- Introduce or strengthen persistent project identity.
- Include project number, project name, status/phase, surface state, and source confidence where data exists.
- If project number or phase is unavailable, use a transparent fixture-backed placeholder and log the gap.
- Avoid overloading shell with full Project Home detail.

## Navigation Requirements

- Convert flat module list into operational groups.
- Add state/risk cues only from current data; otherwise use neutral preview-safe cues.
- Refine active, hover, selected, and focus-visible states.
- Ensure keyboard navigation works across grouped nav.
- Avoid high-saturation blocks that overpower content.
- Preserve all eight current surface routes.

## Host-Fit Requirements

- Validate within SharePoint chrome assumptions.
- Account for published and edit mode.
- Avoid fixed heights that break in tenant host.
- Avoid double scroll and horizontal overflow.
- Ensure content region has usable space at common widths.

## Search / Command Requirements

- Either define operational scope or reduce/remove prominence.
- Do not leave a prominent search input that appears non-functional or unclear.
- If retained, provide accessible disabled/read-only reason and next step.

## Accessibility Requirements

- Validate focus-visible states.
- Validate keyboard traversal.
- Validate semantic nav/group structure.
- Validate contrast for active and focus states.
- Ensure status indicators are not color-only.

## Documentation Requirements

- Update or create prompt closeout docs under the Wave 15A blueprint path.
- Update this package’s artifact templates with actual results during closeout.
- Include exact files changed, tests run, screenshots captured, residual risks, and Wave C handoff.
