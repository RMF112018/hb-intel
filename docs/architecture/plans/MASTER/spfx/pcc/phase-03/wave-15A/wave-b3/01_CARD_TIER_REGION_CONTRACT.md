# 01 — Card Tier / Region / Heading Contract

## Objective

Add a durable primitive contract to `PccDashboardCard` so every card declares its visual tier, semantic role, and heading level.

## Final Type Contract

Update `PccDashboardCard.tsx` to export the following types:

```ts
export type PccCardTier = 'tier1' | 'tier2' | 'tier3' | 'state';

export type PccCardRegion =
  | 'command'
  | 'operational'
  | 'reference'
  | 'state'
  | 'deferred'
  | 'detail'
  | 'rail';
```

Extend `PccDashboardCardProps`:

```ts
export interface PccDashboardCardProps {
  footprint?: PccCardFootprint;
  hierarchy?: 'primary' | 'standard' | 'supporting';
  tier?: PccCardTier;
  region?: PccCardRegion;
  density?: 'comfortable' | 'compact';
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  headingLevel?: 2 | 3 | 4;
  dataActiveSurfacePanel?: string;
}
```

## Backward-Compatible Resolution Rules

Implement these internal helpers:

```ts
function resolveCardTier(
  explicitTier: PccCardTier | undefined,
  hierarchy: 'primary' | 'standard' | 'supporting',
): PccCardTier {
  if (explicitTier) return explicitTier;
  if (hierarchy === 'primary') return 'tier1';
  if (hierarchy === 'supporting') return 'tier3';
  return 'tier2';
}

function resolveCardRegion(
  explicitRegion: PccCardRegion | undefined,
  tier: PccCardTier,
): PccCardRegion {
  if (explicitRegion) return explicitRegion;
  if (tier === 'tier1') return 'command';
  if (tier === 'state') return 'state';
  if (tier === 'tier3') return 'reference';
  return 'operational';
}

function resolveHeadingLevel(
  explicitHeadingLevel: 2 | 3 | 4 | undefined,
  tier: PccCardTier,
): 2 | 3 | 4 {
  if (explicitHeadingLevel) return explicitHeadingLevel;
  if (tier === 'tier1') return 2;
  return 3;
}
```

## Data Marker Contract

Every rendered card must include:

```tsx
data-pcc-card=""
data-pcc-footprint={footprint}
data-pcc-card-hierarchy={hierarchy}
data-pcc-card-tier={resolvedTier}
data-pcc-card-region={resolvedRegion}
data-pcc-card-density={density}
data-pcc-mode={mode}
data-pcc-column-span={columnSpan}
data-pcc-row-span={rowSpan}
data-pcc-measured-height={measuredHeight}
data-pcc-active-surface-panel={dataActiveSurfacePanel}
```

Do not remove existing markers.

## Heading Contract

If `title` exists:

- generate a stable React id using `useId`
- render heading tag based on `headingLevel`
- set card `aria-labelledby` to that heading id
- do not set `aria-label` when `aria-labelledby` is present

If `title` does not exist:

- use `ariaLabel` if provided
- otherwise leave unlabeled only if the card is purely decorative, which should not occur for PCC dashboard cards

Recommended implementation:

```tsx
const headingId = useId();
const resolvedTier = resolveCardTier(tier, hierarchy);
const resolvedRegion = resolveCardRegion(region, resolvedTier);
const resolvedHeadingLevel = resolveHeadingLevel(headingLevel, resolvedTier);
const HeadingTag = `h${resolvedHeadingLevel}` as keyof JSX.IntrinsicElements;

<article
  aria-labelledby={title ? headingId : undefined}
  aria-label={!title ? ariaLabel : undefined}
  aria-describedby={ariaDescribedBy}
>
  {title ? <HeadingTag id={headingId} className={styles.title}>{title}</HeadingTag> : null}
</article>
```

## Legacy `hierarchy` Behavior

`hierarchy` remains because many existing callers already use it.

Migration rules:

- Existing `hierarchy='primary'` remains valid.
- New implementation should prefer explicit `tier`.
- Explicit `tier` always wins over hierarchy.
- Do not remove `hierarchy` in Prompt 02.
- Do not rename `data-pcc-card-hierarchy`.

## Active Surface Panel Rule

Only the route command card may carry `dataActiveSurfacePanel`.

Required route command card props:

```tsx
<PccDashboardCard
  footprint="full" // or hero for Project Home
  tier="tier1"
  region="command"
  headingLevel={2}
  dataActiveSurfacePanel="<surface-id>"
>
```

## State and Deferred Rules

Any card dominated by `PccPreviewState` should use:

```tsx
tier="state"
region="state"
```

Any future seam / no-authority / not-yet-implemented area should use:

```tsx
tier="tier3"
region="deferred"
```

## Prohibited Implementations

Do not:

- infer all Tier 1 cards from `footprint='full'`
- infer all Tier 3 cards from `footprint='compact'`
- remove legacy data attributes
- make `hierarchy` and `tier` conflict silently
- leave route command cards at default `h3`
- use `aria-label` in place of visible-title `aria-labelledby`
