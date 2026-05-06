# Prompt 02 — Route Command Card Lockdown

## Objective

Migrate every route-defining PCC command card to explicit Tier 1 command semantics and ensure every active route has exactly one active-panel carrier.

## Context

The shared primitive now emits explicit/fallback classification markers. The route surfaces must stop relying on legacy `hierarchy` or default resolution for their command cards.

## Files To Inspect

Use targeted reads and `rg`. Do not re-read files still in current context unless exact edit context is required.

```bash
rg "<PccDashboardCard" apps/project-control-center/src/surfaces apps/project-control-center/src/shell
rg "dataActiveSurfacePanel" apps/project-control-center/src
```

Primary files expected:

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsSurface.tsx
apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx
apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx
apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx
apps/project-control-center/src/tests/
```

## Required Route Command Classification

Apply this exact target posture unless current repo truth makes a narrow adjustment necessary.

| Surface ID | Command Card | Required Props |
|---|---|---|
| `project-home` | Project Intelligence Header | `footprint="hero"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="project-home"` |
| `team-and-access` | Team & Access Center | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="team-and-access"` |
| `documents` | HB Document Control Center | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="documents"` |
| `project-readiness` | Project readiness ready hero | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="project-readiness"` |
| `approvals` | Approvals home | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="approvals"` |
| `external-systems` | Launch Pad ready header | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="external-systems"` |
| `control-center-settings` | Control Center Settings | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="control-center-settings"` |
| `site-health` | Site Health overview | `footprint="full"`, `tier="tier1"`, `region="command"`, `headingLevel={2}`, `dataActiveSurfacePanel="site-health"` |

## Required Loading/Error Route Card Classification

Where loading or error replaces the route command card and carries the active-panel marker, classify as:

```tsx
footprint="full"
tier="state"
region="state"
headingLevel={2}
dataActiveSurfacePanel="<surface-id>"
```

This likely applies to:

- Project Readiness loading/error cards.
- Approvals loading/error cards.
- External Systems loading/error cards.

## Required Tests

Create or update a route-level test file:

```text
apps/project-control-center/src/tests/PccSurfaceCommandCardContract.test.tsx
```

Test each route:

1. Renders exactly one `[data-pcc-active-surface-panel]`.
2. The marker value equals the route surface id.
3. The marker carrier is associated with a `[data-pcc-card]`.
4. Ready route card has:
   - `data-pcc-card-tier="tier1"`;
   - `data-pcc-card-region="command"`;
   - `data-pcc-card-tier-source="explicit"`;
   - `data-pcc-card-region-source="explicit"`;
   - `data-pcc-heading-level="2"`.
5. Loading/error route replacement cards, if tested directly, have:
   - `data-pcc-card-tier="state"`;
   - `data-pcc-card-region="state"`;
   - explicit source markers.

Recommended harness:

- Render each route directly inside `PccBentoGrid forceMode="desktop"` where possible.
- For `PccSurfaceRouter`, pass `activeSurfaceId`.
- For fixture paths, prefer no readModelClient where that renders deterministic content.
- If a route requires async read-model resolution, use existing fixture client and `findByText` or stable marker waits.

## Important Constraints

- Do not change route IDs.
- Do not add new active panel markers.
- Do not move active panel markers outside cards.
- Do not wrap route cards in extra DOM under the bento grid.
- Do not remove the existing Project Home 10-card fixture and 16-card read-model path expectations unless repo truth has changed.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccSurfaceCommandCardContract
pnpm --filter @hbc/project-control-center test -- PccProjectHome
pnpm exec prettier --check apps/project-control-center/src/surfaces apps/project-control-center/src/tests
git diff --check
```

## Deliverables

- Updated route command cards.
- Updated loading/error route replacement cards.
- Route command card contract tests.
- Validation output.

## Closeout Response Required From Agent

Return:

```text
Prompt 02 completed.

Route command cards locked:
- project-home: <component>
- team-and-access: <component>
- documents: <component>
- project-readiness: <component>
- approvals: <component>
- external-systems: <component>
- control-center-settings: <component>
- site-health: <component>

Validation:
- <command>: <result>

Notes:
- <any intentional deviation or risk>
```
