# Prompt 03 — State, Deferred, Reference, and Operational Card Reclassification

## Objective

Migrate all non-command PCC cards to explicit card classifications so no card in current PCC route surfaces relies on default operational fallback.

This prompt focuses on:

- Project Home non-command cards.
- Team & Access lanes and restricted states.
- Documents supporting cards.
- Approvals lanes and seams.
- External Systems cards.
- Settings and Site Health supporting cards.

Project Readiness embedded subregions are handled in Prompt 04, but if a card is clearly in scope and safe to classify here, do so without duplicating work.

## Context

After Prompt 01 and Prompt 02, the primitive can expose explicit classification source markers and route command cards are locked.

Now the agent must eliminate default classification from all current route cards and ensure state/deferred/reference content does not appear operational.

## Required Discovery

Run:

```bash
rg "<PccDashboardCard" apps/project-control-center/src/surfaces
rg "PccPreviewState" apps/project-control-center/src/surfaces
rg "not-yet-implemented-operation|unavailable-fixture|missing-config|unauthorized-persona|Deferred|deferred|HBI|Lineage|Audit|Policy" apps/project-control-center/src/surfaces
```

Use the results to find every relevant card.

Do not re-read files still in current context unless exact edit context is required.

## Required Classification Rules

### Operational cards

Use:

```tsx
tier="tier2"
region="operational"
```

For:

- queues;
- active worklists;
- priority actions;
- approval queues;
- review queues;
- access request lanes;
- document lanes with current posture;
- site health checks;
- blockers/exceptions if not route command.

### Detail cards

Use:

```tsx
tier="tier2"
region="detail"
```

For:

- dense inspection panels;
- mapping status if it is used as a current inspection workbench;
- lifecycle timeline/detail;
- registry detail if it supports active inspection.

### Reference cards

Use:

```tsx
tier="tier3"
region="reference"
```

For:

- policy;
- HBI boundary;
- lineage;
- audit history;
- source confidence;
- source health where display-only;
- team snapshot;
- historical activity;
- supporting context.

### Deferred cards

Use:

```tsx
tier="tier3"
region="deferred"
```

For:

- future seams;
- not-yet-implemented operation;
- launch surfaces that are visibility-only;
- disabled external system launch posture;
- placeholder reviews.

### State cards

Use:

```tsx
tier="state"
region="state"
```

For:

- unavailable;
- missing config;
- restricted;
- loading;
- error;
- empty dominant state cards.

## Specific Required Changes

### Project Home

Review and classify every Project Home card beyond the already-correct command and Priority Actions cards.

Expected targets:

- Missing Configurations: `state/state`.
- Site Health Summary: `tier2/operational` unless display-only reference.
- Document Control Center: `tier2/operational`.
- Project Readiness: `tier2/operational` or `tier2/detail`.
- Approvals & Checkpoints: `tier2/operational`.
- External Platforms: `tier3/reference` or `tier3/deferred`.
- Team Snapshot: `tier3/reference` or `tier3/rail`.
- Recent Activity: `tier3/reference` or `tier2/detail`.
- Unified Lifecycle cards: `tier2/detail` or `tier3/reference` depending on card role.
- Ask HBI: `tier2/detail`; idle internals can remain stateful.
- Procore snapshot: `tier3/reference` unless critical warnings make it state/operational.

### Team & Access

- Restricted access-manager actions card in `PccTeamAccessLaneShell`: `state/state`.
- Team Viewer Lane: `tier2/operational`.
- Permission Request Lane: `tier2/operational`.
- Access Manager Lane: `tier2/operational` for manager controls; `state/state` for unavailable/restricted panels.

### Documents

- Header already handled.
- Project Record and My Project Files lanes: `tier2/operational`.
- External Systems lane: `tier3/deferred`.
- Permissions card: `tier3/reference` unless active.
- Reviews card: `tier2/operational` if it shows pending review work; otherwise `tier3/reference` or `state`.

### Approvals

In `PccApprovalsSurface.tsx`:

- Queue: `tier2/operational`.
- My Approvals: `tier2/operational`.
- Registry: `tier2/detail` if active inspection, otherwise `tier3/reference`.
- Escalation: `tier2/operational`.
- Admin Verification: `tier2/operational`.
- Policy: `tier3/reference`.
- Module Integration: `tier3/reference`.
- Decision History Seam: `tier3/deferred`.
- Lineage Seam: `tier3/deferred`.
- HBI Boundary: `tier3/reference`.
- Any degraded dominant state card: `state/state`.

### External Systems

- Launch Pad summary: `tier2/operational` or `tier2/detail`.
- Project Launch Links: `tier2/operational` if current link review; `tier3/deferred` only if purely inert/placeholder.
- Custom Link Review Queue: `tier2/operational`.
- Procore Configuration/Status: `tier3/reference` or `state/state`.
- Registry: `tier3/reference`.
- Mapping Status: `tier2/detail` if current mapping inspection; otherwise `tier3/reference`.
- Source Health: `tier3/reference` or `state/state` if degraded.
- Audit History: `tier3/reference`.
- HBI Lineage: `tier3/reference`.
- Add/Edit drawer remains portal-mounted and outside the bento grid.

### Control Center Settings

Verify no changes needed beyond tests:

- Header: `tier1/command`.
- Scope: `tier2/detail`.
- Missing setup: `state/state`.

### Site Health

- Checks: `tier2/operational`.
- Drift Indicators: `tier2/detail` or `tier2/operational`.
- Repair Requests: `state/state` if placeholder, otherwise `tier2/operational`.
- Procore Sync/Repair: `tier3/reference`, `state/state`, or `tier3/deferred` depending on current actual content.

## Required Tests

Extend the cross-surface contract tests so every card in these surfaces passes:

```ts
expect(card).toHaveAttribute('data-pcc-card-tier-source', 'explicit');
expect(card).toHaveAttribute('data-pcc-card-region-source', 'explicit');
```

Add targeted tests for:

- Team restricted card is state/state.
- Approvals policy and HBI boundary are reference.
- Approvals decision-history and lineage seams are deferred.
- External Systems audit/HBI/source cards are reference/deferred as classified.
- Documents External Systems lane is deferred.
- Project Home Missing Configurations remains state/state.

## Non-Goals

- Do not change data model.
- Do not add new behavior.
- Do not implement deferred features.
- Do not activate disabled controls.
- Do not add live external links.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test -- PccCardTierContract
pnpm --filter @hbc/project-control-center test -- PccSurfaceCommandCardContract
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check apps/project-control-center/src/surfaces apps/project-control-center/src/tests
git diff --check
```

## Deliverables

- Explicit non-command card classification across the route surfaces listed above.
- Tests that fail on default tier/region fallback.
- Validation output.

## Closeout Response Required From Agent

Return:

```text
Prompt 03 completed.

Cards reclassified by area:
- Project Home: <summary>
- Team & Access: <summary>
- Documents: <summary>
- Approvals: <summary>
- External Systems: <summary>
- Settings: <summary>
- Site Health: <summary>

Validation:
- <command>: <result>

Notes:
- <any intentional deviation or risk>
```
