# Span Override and Dashboard Choreography Contract

## Objective

Introduce dashboard-specific span overrides and intentional card choreography while preserving the existing global footprint system.

## Span Override API

### Type

```ts
export type PccCardSpanOverrides = Partial<Record<PccResponsiveMode, number>>;
```

### Prop

Add to `PccDashboardCardProps`:

```ts
spanOverrides?: PccCardSpanOverrides;
```

### Resolution

```text
baseSpan = resolveFootprintColumnSpan(mode, footprint)
overrideSpan = spanOverrides?.[mode]

if overrideSpan exists:
  resolved = clamp(overrideSpan, 1, activeGridColumns)
  source = "override"
else:
  resolved = baseSpan
  source = "footprint"
```

### Required markers

```text
data-pcc-column-span="<resolved>"
data-pcc-span-source="footprint|override"
data-pcc-span-override-mode="<mode>" when override is used
```

### Min inline-size rule

Keep existing footprint-driven min inline-size behavior for MVP. Do not introduce a second min-size override unless tests prove it is required.

## Project Home Span Matrix

| Card ID | Title | 12-col | 10-col | Notes |
|---|---|---:|---:|---|
| `priority-actions` | Priority Actions | 5 | 4 | operational priority |
| `site-health-summary` | Site Health Summary | 3 | 3 | compact health posture |
| `document-control-center` | Document Control Center | 4 | 3 | source posture / gateway |
| `project-readiness` | Project Readiness | 4 | 4 | readiness workflow items |
| `approvals-checkpoints` | Approvals & Checkpoints | 4 | 3 | approval queue |
| `missing-configurations` | Missing Configurations | 4 | 3 | state card |
| `external-platforms` | External Platforms | 4 | 3 | reference/gateway |
| `team-snapshot` | Team Snapshot | 3 | 3 | people rail |
| `recent-activity` | Recent Activity | 5 | 4 | reference/history |

## Dashboard Composition Metadata

Create:

```text
apps/project-control-center/src/layout/pccDashboardComposition.ts
```

Recommended types:

```ts
export type PccDashboardCardVisualWeight = 'short' | 'medium' | 'tall';

export interface PccDashboardCardComposition {
  readonly cardId: string;
  readonly dashboardId: PccPrimaryTabId;
  readonly order: number;
  readonly footprint: PccCardFootprint;
  readonly spanOverrides?: PccCardSpanOverrides;
  readonly hierarchy: 'primary' | 'standard' | 'supporting';
  readonly density: 'comfortable' | 'compact';
  readonly visualWeight: PccDashboardCardVisualWeight;
  readonly firstFold: boolean;
  readonly relatedModuleIds?: readonly PccModuleId[];
}
```

## Choreography Rules

1. Operational cards first.
2. Analytics cards near related operational cards, not isolated unless no related placement exists.
3. Tall/detail/reference cards below the first operational fold unless they are mission-critical.
4. Avoid pairing very tall cards with very short cards where it creates obvious voids.
5. Materially reduce visual dead space; do not attempt masonry behavior.
6. Preserve direct-child bento invariant.

## Acceptance

- Project Home first row on 12-column modes uses `5 + 3 + 4`.
- Project Home first row on 10-column mode uses `4 + 3 + 3`.
- No first-row stranded horizontal gap is caused by incompatible spans.
- Vertical whitespace is materially reduced through choreography.
- No `grid-auto-flow: dense`.
