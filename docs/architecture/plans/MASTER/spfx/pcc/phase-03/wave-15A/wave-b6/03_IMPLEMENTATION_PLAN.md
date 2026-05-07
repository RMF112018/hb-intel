# Implementation Plan — Project Home Flagship Remediation

## Objective

Implement a controlled, test-backed Project Home remediation that improves the homepage toward the PCC 100-point scorecard target without destabilizing shell primitives, SPFx packaging, read-model seams, or direct-child bento invariants.

## Current-state problem

Project Home is structurally stable but reads too much like a long dashboard inventory.

Confirmed current state:

- read-model path renders 16 cards;
- Priority Actions is second but very tall on mobile;
- Procore snapshot appears above Tier 2 operational cards despite being `tier3/deferred`;
- Ask HBI is last despite being a major differentiator;
- Unified Lifecycle content is late and fragmented;
- Project Home has 27 content-review findings;
- Project Intelligence metric labels have Project Home-specific axe contrast findings;
- screenshot evidence lacks real below-fold Project Home scroll capture.

## Target-state model

### First fold

The first fold should communicate:

```text
Project Command Summary
Today's Operating Priorities
Core-control posture preview
HBI/source boundary cue
```

### Mid-page

The mid-page should contain:

```text
Approvals & Checkpoints
Project Readiness
Document Control Center
Site Health / Setup Health
Lifecycle Continuity
Ask HBI compact/detailed panel
```

### Lower page

The lower page should contain:

```text
Procore/source details
External Platforms
Team Snapshot
Recent Activity
Project Memory / Project Lens / Related Records details
```

## Implementation sequence

### Phase 1 — Guarded baseline audit

Purpose:

- prove local repo matches this package's assumptions;
- classify exact current Project Home order, card count, heights, test coverage, and evidence gaps;
- produce a local workplan before changing code.

Expected output:

- no product changes;
- local markdown note or closeout response summarizing exact repo-truth;
- list of proposed files to change.

### Phase 2 — Command hero / first-fold hierarchy

Purpose:

- rename/refine Project Intelligence into a flagship command summary;
- add operating posture signals;
- preserve active panel marker;
- fix immediate contrast issue where possible;
- add tests for title, tier, region, active marker, command summary copy.

Likely files:

```text
PccProjectIntelligenceCard.tsx
PccProjectHome.module.css
PccProjectHome.test.tsx
```

Implementation notes:

- Keep `footprint="hero"`, `tier="tier1"`, `region="command"`, `hierarchy="primary"`.
- Keep `dataActiveSurfacePanel="project-home"`.
- Add command summary facts without turning the card into a dense report.
- Avoid pulling data from new backend endpoints.

### Phase 3 — Priority Actions compression

Purpose:

- keep Priority Actions second;
- compress it for homepage use;
- materially reduce mobile height;
- preserve no-execution posture.

Likely files:

```text
PccPriorityActionsCard.tsx
PccPriorityActionsRail.tsx
PccPriorityActionsRail.module.css
priorityActionsRailAdapter.ts
priorityActionsRailViewModel.ts
PccProjectHome.test.tsx
```

Implementation notes:

- Render top 5–7 by default.
- Show category counts/remaining count.
- Keep disabled/inert action affordance as span or clearly non-executing element.
- Full rail may be available via local preview-only expansion if tested.
- Do not add anchors, buttons with workflow execution, or external launches.

### Phase 4 — Core-control module cluster and card order

Purpose:

- reorder cards so Tier 2 operational cards precede deferred/reference cards;
- demote Procore snapshot and non-blocking Missing Configurations;
- keep fixture-only and read-model path conceptually aligned.

Likely files:

```text
PccProjectHome.tsx
PccProjectHomeReadModelContent.tsx
PccMissingConfigurationsCard.tsx
PccProjectHomeProcoreSnapshotCard.tsx
PccProjectHome.test.tsx
PccCardTierContract.test.tsx
```

Target changes:

- Approvals, Readiness, and Document Control move into the immediate core-control cluster.
- Procore snapshot moves below the core cluster unless blocking.
- Missing Configurations becomes exception-forward: high only when blocking; otherwise compact/demoted.

### Phase 5 — Lifecycle, HBI, and source-intelligence promotion

Purpose:

- make lifecycle continuity and HBI visible earlier;
- keep heavy detail lower/progressive;
- clarify source confidence and HBI boundaries.

Likely files:

```text
PccProjectHomeUnifiedLifecycleSection.tsx
PccProjectHomeAskHbiSection.tsx
PccProjectHomeReadModelContent.tsx
PccProjectHome.test.tsx
```

Implementation options:

1. Add compact summary cards and keep existing detail cards lower.
2. Convert the existing four lifecycle cards into one compact summary plus optional detail cards lower.
3. Retain four detail cards but add a smaller higher "Lifecycle Continuity" summary.

Preferred:

- Avoid increasing total card count.
- If adding a new summary, consolidate or demote an existing detail card.
- Keep Ask HBI idle-on-mount.

### Phase 6 — Content, source, and HBI authority copy

Purpose:

- reduce content needs-review exposure;
- improve construction-operations language;
- make state copy specific: condition, impact, owner, next step;
- make HBI advisory boundaries clear.

Likely files:

```text
Project Home card components
PccPriorityActionsRail.tsx
PccProjectHomeAskHbiSection.tsx
unified lifecycle preview components only if copy is owned there
PccProjectHome.test.tsx
```

Copy rules:

- Use construction execution language: submittals, RFIs, permits, inspections, buyout, constraints, readiness, document control, approvals.
- Avoid vague dashboard language like "items", "stuff", "view", "manage" without context.
- Disabled/inert copy must tell the user why it is disabled and where the source action belongs.
- HBI copy must say grounded/advisory/read-only/no decision authority.

### Phase 7 — Accessibility and responsive cleanup

Purpose:

- resolve Project Home color-contrast findings;
- resolve PCC-owned touch issues, especially Ask HBI phone targets;
- verify no horizontal overflow or direct-child regression.

Likely files:

```text
PccProjectHome.module.css
PccPriorityActionsRail.module.css
PccProjectHomeAskHbiSection.tsx or child components
tests
```

### Phase 8 — Evidence closeout

Purpose:

- rerun targeted local tests;
- rerun Playwright evidence if environment is available;
- create before/after report.

Expected evidence improvements:

- Project Home axe violations from 4 to 0.
- Priority Actions phone height materially reduced.
- Project Home total phone height materially reduced or first-scan density materially improved.
- Content needs-review count materially reduced.
- Screenshot evidence includes real below-fold segments.
- No false-affordance regression.
- No active-surface marker regression.

## Required test updates

Update or add tests for:

- Project Home card order in fixture-only path.
- Project Home card order in read-model-driven path.
- active panel marker remains exactly one and on command summary card.
- Priority Actions compact rail default max visible count.
- Priority Actions overflow/remaining summary.
- no anchors/buttons introduced in Priority Actions rail.
- Ask HBI remains idle-on-mount and no auto-fetch.
- HBI boundary copy present.
- Project Home contrast-sensitive labels use accessible class/contract.
- direct-child bento invariant remains.
- fixture-only and read-model paths both pass.

## Validation strategy

Use local vitest for contract enforcement and Playwright for hosted evidence. Do not treat screenshots or Playwright as final scoring authority.
