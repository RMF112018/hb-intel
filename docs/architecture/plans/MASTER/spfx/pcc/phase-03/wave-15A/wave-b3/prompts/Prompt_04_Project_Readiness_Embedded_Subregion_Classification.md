# Prompt 04 — Project Readiness Embedded Subregion Classification

## Objective

Complete explicit card tier/region remediation for Project Readiness and all embedded readiness subregions, including lifecycle readiness, permit/inspection, responsibility matrix, constraints log, buyout log, and Procore/source-confidence cards.

## Context

Project Readiness is the densest current PCC surface. It hosts multiple wave outputs and embedded subregions. This prompt isolates it to avoid superficial classification and token waste.

The route command card should already be handled by Prompt 02. Prompt 03 may have classified some Project Readiness cards. This prompt must verify and complete the entire Project Readiness card tree.

## Files To Inspect

Use targeted search first.

```bash
rg "<PccDashboardCard" apps/project-control-center/src/surfaces/projectReadiness apps/project-control-center/src/surfaces/responsibilityMatrix apps/project-control-center/src/surfaces/constraintsLog apps/project-control-center/src/surfaces/buyoutLog
rg "data-pcc-readiness-region|data-pcc-readiness-section|data-pcc-responsibility|data-pcc-constraints|data-pcc-buyout" apps/project-control-center/src/surfaces
```

Expected files include:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessUnifiedLifecycleSection.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessProcoreSourceConfidenceCard.tsx
apps/project-control-center/src/surfaces/responsibilityMatrix/PccResponsibilityMatrixRegions.tsx
apps/project-control-center/src/surfaces/responsibilityMatrix/PccResponsibilityMatrixIntegrationCard.tsx
apps/project-control-center/src/surfaces/constraintsLog/PccConstraintsLogRegions.tsx
apps/project-control-center/src/surfaces/buyoutLog/PccBuyoutLogRegions.tsx
```

Do not re-read files still in current context unless exact edit context is required.

## Required Classification

### Project Readiness framework cards

Apply:

| Card | Target |
|---|---|
| Ready Hero | `tier1/command`, `headingLevel={2}`, active panel `project-readiness`. |
| Loading/Error Hero | `state/state`, `headingLevel={2}`, active panel `project-readiness`. |
| Lifecycle Gate Map | `tier2/detail` or `tier2/operational`. |
| Blockers and Exceptions | `tier2/operational`; remove legacy primary/Tier 1 unless product strategy explicitly makes this the route command. |
| Domain Posture | `tier2/detail`. |
| Ownership and Accountability | `tier2/operational`. |
| Eligible for Priority Actions | `tier2/operational`. |
| Evidence and Source-Health Posture | `tier2/detail` or `tier3/reference`, based on actual content density. |
| Downstream Modules | `tier3/reference`. |

### Lifecycle readiness cards

Apply:

| Card Pattern | Target |
|---|---|
| Lifecycle Timeline | `tier2/detail`. |
| Project Memory | `tier3/reference` or `tier2/detail` if dense inspection. |
| Project Lens | `tier3/rail` or `tier3/reference`. |
| Related Records | `tier3/reference`. |
| Any restricted/withheld lifecycle card | `state/state` or `tier3/deferred`, depending on actual state. |

### Permit & Inspection Control Center regions

Apply:

| Card Pattern | Target |
|---|---|
| Permit/Inspection command or summary | If route-like subcommand: `tier2/detail`; not Tier 1 because Project Readiness owns the route command. |
| Active permit/inspection queues | `tier2/operational`. |
| AHJ launcher-only or visibility-only cards | `tier3/deferred` or `tier3/reference`. |
| Evidence/read-only source cards | `tier3/reference`. |
| unavailable/stale state cards | `state/state`. |

### Responsibility Matrix regions

Apply:

| Card Pattern | Target |
|---|---|
| Matrix operational/assignment panel | `tier2/detail` or `tier2/operational`. |
| Integration/source mapping card | `tier3/reference` unless actively operational. |
| Placeholder/import/deferred cards | `tier3/deferred`. |
| Missing data/restricted cards | `state/state`. |

### Constraints Log regions

Apply:

| Card Pattern | Target |
|---|---|
| Active constraints/risks | `tier2/operational`. |
| Risk exposure analysis | `tier2/detail`. |
| Source/reference cards | `tier3/reference`. |
| Deferred scheduling/lookahead seams | `tier3/deferred`. |
| Missing data/restricted cards | `state/state`. |

### Buyout Log regions

Apply:

| Card Pattern | Target |
|---|---|
| Buyout exception/workbench cards | `tier2/operational`. |
| Buyout detail / package inspection | `tier2/detail`. |
| Procore/Sage/PCC boundary cards | `tier3/reference`. |
| Deferred writeback or future integration seam | `tier3/deferred`. |
| Missing source/setup cards | `state/state`. |

### Procore source confidence

Apply:

- `tier3/reference` for display-only source confidence.
- `state/state` for degraded/missing configuration if it is primarily a state warning.
- Do not classify as operational unless it contains active worklist behavior.

## Required Tests

Extend `PccCardTierContract.test.tsx` or create a Project Readiness-specific test file:

```text
apps/project-control-center/src/tests/PccProjectReadinessCardContract.test.tsx
```

Required assertions:

1. Project Readiness route has exactly one active panel marker.
2. Project Readiness active panel card is Tier 1 command in ready fixture path.
3. Every card in the Project Readiness fixture path has explicit tier/region source markers.
4. No Project Readiness card has `data-pcc-card-tier-source="default"`.
5. No Project Readiness card has `data-pcc-card-region-source="resolved"`.
6. Blockers card is not Tier 1 unless documented and intentional.
7. Deferred/seam cards are `region="deferred"`.
8. Reference/source-boundary cards are `region="reference"`.
9. Embedded subregion cards remain direct children of the bento grid when rendered through the Project Readiness surface.

## Non-Goals

- Do not split Project Readiness into new routes.
- Do not add new tabs.
- Do not change read-model fetch logic except if required to pass type checks due to prop changes.
- Do not implement deferred workflows.
- Do not activate disabled affordances.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccProjectReadiness
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check \
  apps/project-control-center/src/surfaces/projectReadiness \
  apps/project-control-center/src/surfaces/responsibilityMatrix \
  apps/project-control-center/src/surfaces/constraintsLog \
  apps/project-control-center/src/surfaces/buyoutLog \
  apps/project-control-center/src/tests
git diff --check
```

## Deliverables

- Explicit tier/region classification for every Project Readiness and embedded subregion card.
- Tests enforcing that Project Readiness has no default card classification.
- Validation output.

## Closeout Response Required From Agent

Return:

```text
Prompt 04 completed.

Project Readiness classification summary:
- Framework cards: <summary>
- Lifecycle readiness cards: <summary>
- Permit / Inspection cards: <summary>
- Responsibility Matrix cards: <summary>
- Constraints Log cards: <summary>
- Buyout Log cards: <summary>
- Procore/source-confidence cards: <summary>

Validation:
- <command>: <result>

Notes:
- <any intentional deviation or risk>
```
