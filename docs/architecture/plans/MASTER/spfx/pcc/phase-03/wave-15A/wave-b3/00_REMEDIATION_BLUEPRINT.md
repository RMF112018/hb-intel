# 00 — Remediation Blueprint

## Objective

Create a shared PCC primitive and composition system that makes visual hierarchy, surface role, state posture, and accessibility explicit rather than inferred through ad-hoc card sizing.

The remediation must make every PCC surface read as an operational command center rather than a generic card catalog.

## Problem Statement

The current PCC bento/card system has credible mechanics:

- container-aware grid measurement
- responsive modes
- row-span collapse resistance
- direct-child card pattern
- read-only/degraded state support

However, the primitive does not yet encode the product hierarchy needed for PCC:

- `footprint` describes layout span, not importance
- `hierarchy` is too vague and weakly styled
- `full` footprint is treated visually with dashed border even when it is simply a layout span
- route command cards and reference/deferred cards can share similar visual weight
- card headings are fixed rather than semantic by context
- surfaces rely on local interpretation instead of a shared contract

## End State

PCC cards become governed by three independent axes:

### 1. Footprint — layout size

Controls grid span and minimum inline size.

Allowed values:

```ts
'hero' | 'wide' | 'standard' | 'compact' | 'tall' | 'full' | 'rail' | 'detail'
```

### 2. Tier — visual/operational priority

Controls visual hierarchy.

Allowed values:

```ts
'tier1' | 'tier2' | 'tier3' | 'state'
```

### 3. Region — content role

Controls semantic and product meaning.

Allowed values:

```ts
'command' | 'operational' | 'reference' | 'state' | 'deferred' | 'detail' | 'rail'
```

## Governing Principles

1. **Footprint is not importance.**
   - A full-width card can be a Tier 3 reference card.
   - A compact card can be operational if it carries an active KPI.

2. **Every route has exactly one ready-state command card.**
   - It must be `tier='tier1'`.
   - It must be `region='command'`.
   - It must carry the route's `data-pcc-active-surface-panel`.

3. **Operational cards outrank reference cards.**
   - Queues, blockers, reviews, health checks, and active decision surfaces are Tier 2.
   - Registries, source lineage, audit history, policy, HBI boundaries, and Procore seams are usually Tier 3.

4. **State/deferred cards must be honest and subordinate.**
   - They must not be styled like active work queues.
   - They need reason and next-step language when unavailable.

5. **Card semantics must match visual hierarchy.**
   - Route command cards use `h2`.
   - Normal cards use `h3`.
   - Nested body sections use `h4`.

6. **No surface may regress to equal-card weight.**
   - Tests must fail when a route has zero or multiple Tier 1 command cards.
   - Tests must fail when any card is missing tier/region markers.

## Required Source Areas

Primary implementation:

```text
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/layout/PccDashboardCard.module.css
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/layout/PccBentoGrid.tsx
apps/project-control-center/src/layout/useBentoRowSpan.ts
apps/project-control-center/src/layout/*.test.tsx
```

Surface migration:

```text
apps/project-control-center/src/surfaces/projectHome/**
apps/project-control-center/src/surfaces/teamAccess/**
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/surfaces/projectReadiness/**
apps/project-control-center/src/surfaces/responsibilityMatrix/**
apps/project-control-center/src/surfaces/constraintsLog/**
apps/project-control-center/src/surfaces/buyoutLog/**
apps/project-control-center/src/surfaces/approvals/**
apps/project-control-center/src/surfaces/externalSystems/**
apps/project-control-center/src/surfaces/controlCenterSettings/**
apps/project-control-center/src/surfaces/siteHealth/**
apps/project-control-center/src/shell/**
apps/project-control-center/src/tests/**
```

## Required Closeout Standard

A closeout is valid only when it includes:

- changed file list
- test command output
- lockfile hash confirmation
- surface card inventory after implementation
- direct-child bento invariant evidence
- screenshot evidence matrix or explicit hosted-evidence follow-up gate
- residual risk statement
