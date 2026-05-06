# 03 — Visual Hierarchy and Token Specification

## Objective

Make Tier 1, Tier 2, Tier 3, state, deferred, detail, and rail cards visibly different without introducing brittle one-off styling.

## CSS Selector Contract

All visual variants must be driven by primitive-level data attributes:

```css
.card[data-pcc-card-tier='tier1'] {}
.card[data-pcc-card-tier='tier2'] {}
.card[data-pcc-card-tier='tier3'] {}
.card[data-pcc-card-tier='state'] {}

.card[data-pcc-card-region='command'] {}
.card[data-pcc-card-region='operational'] {}
.card[data-pcc-card-region='reference'] {}
.card[data-pcc-card-region='state'] {}
.card[data-pcc-card-region='deferred'] {}
.card[data-pcc-card-region='detail'] {}
.card[data-pcc-card-region='rail'] {}
```

## Required Visual Outcomes

### Tier 1 — Command

Purpose: route-defining command/context card.

Required treatment:

- most prominent surface on route
- stronger material than default cards
- visible accent cue
- larger title
- clear command-region rhythm
- source/status metadata subordinate, not dominant
- cannot look like a normal wide/full card

Required CSS direction:

```css
.card[data-pcc-card-tier='tier1'] {
  border-color: color-mix(in srgb, var(--pcc-color-rail-accent) 52%, var(--pcc-color-border));
  box-shadow: 0 16px 32px rgba(16, 24, 40, 0.12);
}

.card[data-pcc-card-region='command'] {
  background:
    linear-gradient(135deg, rgba(242, 140, 40, 0.08), transparent 38%),
    var(--pcc-color-card);
}

.card[data-pcc-card-tier='tier1'] .title {
  font-size: clamp(18px, 1.4vw, 22px);
  line-height: 1.2;
  font-weight: 700;
}
```

### Tier 2 — Operational

Purpose: active queues, blockers, health checks, workbench panels.

Required treatment:

- clear active-work visual weight
- stronger than reference cards
- not as visually heavy as Tier 1
- supports dense rows without feeling like a static list

Required CSS direction:

```css
.card[data-pcc-card-tier='tier2'] {
  border-color: color-mix(in srgb, var(--pcc-color-border) 72%, var(--pcc-color-rail-accent));
}

.card[data-pcc-card-region='operational'] .body {
  gap: var(--pcc-space-md);
}
```

### Tier 3 — Reference

Purpose: registries, policy, lineage, audit history, source metadata.

Required treatment:

- lower emphasis
- clear but subordinate
- does not compete with operational work queues

Required CSS direction:

```css
.card[data-pcc-card-tier='tier3'] {
  box-shadow: none;
  background: color-mix(in srgb, var(--pcc-color-card) 94%, var(--pcc-color-canvas));
}

.card[data-pcc-card-region='reference'] .title {
  font-size: 14px;
}
```

### State

Purpose: unavailable, loading, error, empty, restricted, missing configuration.

Required treatment:

- visibly a state posture
- not confused with active content
- clear reason and next step

Required CSS direction:

```css
.card[data-pcc-card-tier='state'],
.card[data-pcc-card-region='state'] {
  border-style: dashed;
  background: color-mix(in srgb, var(--pcc-color-canvas) 72%, var(--pcc-color-card));
}
```

### Deferred

Purpose: future seam, no-authority boundary, not-yet-implemented operation.

Required treatment:

- honest but not broken
- lower than operational cards
- may use dashed/tinted border
- never Tier 1

Required CSS direction:

```css
.card[data-pcc-card-region='deferred'] {
  border-style: dashed;
  opacity: 0.94;
}
```

### Detail

Purpose: deep inspection or workbench/detail panel.

Required treatment:

- content-density capable
- clear subsection rhythm
- may be full/wide depending route

Required CSS direction:

```css
.card[data-pcc-card-region='detail'] .content {
  gap: var(--pcc-space-md);
}
```

### Rail

Purpose: persistent context, lens, filter, people/reference rail.

Required treatment:

- compact, scannable, subordinate
- should not look like a normal operational card

Required CSS direction:

```css
.card[data-pcc-card-region='rail'] {
  background: color-mix(in srgb, var(--pcc-color-card) 88%, var(--pcc-color-canvas));
}
```

## Remove This Existing Rule

Remove the current `full` footprint dashed styling:

```css
.card[data-pcc-footprint='full'] {
  border-style: dashed;
}
```

Reason: layout span is not state posture. A full-width operational card should not look unavailable.

## Preserve These Current Strengths

- tokenized colors and spacing
- row-span recovery behavior
- card body intrinsic sizing
- existing data markers
- compact density behavior

## Prohibited Visual Outcomes

- all cards look like white panels with thin borders
- all full-width cards look dashed
- all primary cards differ only by border color
- supporting cards are only opacity-adjusted
- state/deferred cards visually compete with command cards
- cards use hard-coded colors where theme tokens exist
