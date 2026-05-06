# 04 — Target Card Tier and Layout Pattern Contract

## Objective

Define the product-grade card hierarchy and allowed layout patterns for Wave D implementation.

## Card Tier Contract

### Tier 1 — Command / Context Cards

Purpose:

- Establish the active surface’s operational purpose.
- Carry surface/project context, posture, source confidence, and last-updated state.
- Anchor the user’s scan path.

Allowed use:

- Exactly one per routed surface in normal ready state.
- Loading/error states may render only the Tier 1 card when no safe scaffold is appropriate.
- Must carry `data-pcc-active-surface-panel="<surface-id>"` when it is the active surface owner.

Default mapping:

- `tier="tier1"`
- `region="command"`
- `footprint="full"`
- `density="comfortable"`
- `headingLevel=2` unless shell semantics require another level.

Visual requirements:

- Strongest border/weight, but not decorative clutter.
- Contains `PccSurfaceContextHeader` unless a documented exception applies.
- Does not contain long operational tables.

### Tier 2 — Operational Cards

Purpose:

- Carry queues, blockers, primary workflow summaries, review panes, manager lanes, readiness maps, active statuses.

Allowed use:

- Multiple per surface.
- Should appear immediately after Tier 1 in responsive order.
- Should use `wide` or `standard` footprints depending on content complexity.

Default mapping:

- `tier="tier2"`
- `region="operational"`
- `footprint="wide"` for queues/lists/detail panels, `standard` for concise operational summaries.
- `density="comfortable"` for interactive/queue regions, `compact` for metric rows.
- `headingLevel=3` by default.

Visual requirements:

- Clear enough to read as work content.
- More substantial than reference cards.
- No disabled action without a reason/next step.

### Tier 3 — Reference Cards

Purpose:

- Carry supporting detail, source health, policy, lineage, logs, deferred seams, audit history, snapshots.

Allowed use:

- Multiple per surface.
- Should not visually compete with Tier 1 or primary Tier 2 cards.
- May be compact.

Default mapping:

- `tier="tier3"`
- `region="reference"`
- `footprint="standard"` or `compact`; `wide` only when content density requires it.
- `density="compact"` unless readability requires comfortable.
- `headingLevel=3` or `headingLevel=4` if nested below a Tier 2 section.

Visual requirements:

- Lower elevation/contrast than Tier 2.
- Useful but clearly secondary.
- Avoid dashed borders as a generic “full” marker unless doctrine explicitly supports it.

## Allowed Layout Patterns

### Pattern A — Full-Width Command Panel

- Tier 1, full-width.
- First card in the route.
- Carries surface context and key posture.

### Pattern B — Two-Column Operational Split

- Two Tier 2 cards: queue + detail, status + blockers, links + review queue, manager + request.
- Wide desktop: side-by-side when spans allow.
- Tablet/narrow: queue before detail.

### Pattern C — Three/Four Metric Summary Row

- Tier 2 or Tier 3 metric cards/chips inside one card, not four unrelated heavyweight cards.
- Use compact density and accessible labels.

### Pattern D — Queue + Detail

- Primary list/queue as Tier 2.
- Detail panel is nested in the same Tier 2 card when possible or a paired Tier 2 card if the detail is substantial.
- Avoid orphan detail cards below unrelated references.

### Pattern E — Compact Reference Grid

- Tier 3 cards in standard/compact footprints.
- Must not create a narrow unreadable column in tablet portrait.
- Reference cards should follow operational cards in DOM order.

### Pattern F — Blocked / Unavailable State Layout

- Tier 1 context remains visible.
- One Tier 2 or Tier 3 state card explains the reason and next step.
- Avoid a full route of unavailable cards.

## Implementation Markers

Add or verify these markers:

```text
data-pcc-card-tier="tier1|tier2|tier3"
data-pcc-card-region="command|operational|reference"
data-pcc-layout-pattern="command|operational-split|metric-row|queue-detail|reference-grid|blocked-state"
```

The local agent may adjust names if an existing repo convention exists, but the semantics must be stable and testable.

## Backward Compatibility

Existing `hierarchy`, `density`, and `footprint` props must remain compatible. Existing tests expecting `data-pcc-card-hierarchy` must continue to pass unless they are intentionally migrated with a documented change.
