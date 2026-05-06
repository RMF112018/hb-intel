# 01 — Target Card Contract

## Objective

Define the target card contract for all current PCC card elements.

The implementation must make card classification explicit, testable, visually meaningful, and stable across future surface changes.

## Canonical Card Inputs

Every `PccDashboardCard` usage in PCC route surfaces and embedded PCC subregions must explicitly provide:

```tsx
tier="tier1" | "tier2" | "tier3" | "state"
region="command" | "operational" | "reference" | "state" | "deferred" | "detail" | "rail"
```

Where the card is a route-level command card, it must also provide:

```tsx
headingLevel={2}
dataActiveSurfacePanel="<surface-id>"
```

Where the card is not route-defining, it should generally rely on default heading level or set `headingLevel={3}` / `headingLevel={4}` only if needed for semantic hierarchy.

## Legacy `hierarchy`

`hierarchy` may remain as backward compatibility but must not be the canonical classification model.

Target posture:

- `hierarchy` may remain where visual backward compatibility is needed.
- `tier` and `region` must be explicit on all current PCC card elements.
- Tests must be able to distinguish explicit tier / region from resolved fallback tier / region.

## Required Primitive Instrumentation

Update `PccDashboardCard` so the DOM exposes classification source markers.

Recommended data markers:

```tsx
data-pcc-card-tier-source="explicit" | "hierarchy" | "default"
data-pcc-card-region-source="explicit" | "resolved"
data-pcc-heading-level="2" | "3" | "4"
```

Implementation notes:

- Compute `tierSource` before resolving the tier.
- Compute `regionSource` before resolving the region.
- Preserve current public API.
- Do not remove or change existing data markers unless tests are updated intentionally.
- Do not create user-visible copy from these markers.

Recommended logic:

```ts
const tierSource =
  tier !== undefined ? 'explicit' : hierarchy !== 'standard' ? 'hierarchy' : 'default';

const regionSource = region !== undefined ? 'explicit' : 'resolved';
```

After remediation, route surface tests should require `data-pcc-card-tier-source="explicit"` and `data-pcc-card-region-source="explicit"` for all card elements under the current PCC route set.

## Tier Semantics

### Tier 1

Use for:

- the single route-defining ready-state command card per active surface;
- dominant route summary card;
- route-level command/intelligence band.

Rules:

- Exactly one active surface panel marker per route.
- Ready route command cards must be Tier 1 command.
- Loading/error route state cards may use `tier="state"` if they are not intended to read as a normal ready command.

### Tier 2

Use for:

- operational queues;
- action worklists;
- priority lanes;
- active blockers;
- operational health checks;
- actionable read-only previews;
- workbench panels.

Rules:

- Tier 2 should be the dominant body content after the route command card.
- Do not use Tier 2 for policy, HBI boundaries, lineage, or future/deferred seams.

### Tier 3

Use for:

- reference context;
- policy summaries;
- lineage support;
- audit history;
- source-health explanation;
- supporting evidence;
- HBI boundary and no-authority descriptions;
- non-primary context cards.

Rules:

- Tier 3 cards should not visually compete with Tier 1/Tier 2.
- Tier 3 must remain readable, not hidden or collapsed.

### State

Use for:

- loading;
- error;
- empty;
- unavailable;
- restricted;
- missing configuration;
- not-yet-implemented operation;
- blocked setup.

Rules:

- State cards must not look like broken blank content.
- State cards should use `PccPreviewState` or equivalent source-backed state UI.

## Region Semantics

### Command

Use for the route-defining command card.

### Operational

Use for active work content and decision/action support.

### Reference

Use for policy, source info, non-active lineage, audit history, HBI boundary, and supporting context.

### State

Use for explicit state cards and degraded/unavailable conditions.

### Deferred

Use for seam, future capability, placeholder operation, or read-only launch surfaces that are not currently active work.

### Detail

Use for deep inspection, dense records, analysis panels, and embedded workbench details.

### Rail

Use for compact side context, filters, helper rails, and supporting alert stacks.

## Footprint Semantics

Keep footprint layout-only.

- `hero`: dominant route summary.
- `full`: full row panel.
- `wide`: major operational card.
- `standard`: normal card.
- `compact`: KPI/status.
- `tall`: timeline/log/list.
- `rail`: narrow supporting rail.
- `detail`: dense or inspection content.

Do not treat `footprint` as a substitute for `tier` or `region`.

## Visual Hierarchy Requirements

Update `PccDashboardCard.module.css` to make the tier/region distinctions materially visible while preserving tokens and host-safety.

Recommended changes:

- Tier 1:
  - stronger command background treatment;
  - left or top accent rail;
  - stronger shadow;
  - larger heading;
  - more deliberate spacing.
- Tier 2:
  - clear operational card shape;
  - moderate border/shadow;
  - no command-grade accent dominance.
- Tier 3:
  - calmer surface;
  - lighter shadow or no shadow;
  - smaller title;
  - reference posture visible but not disabled.
- State:
  - dashed or distinct border;
  - state background;
  - clear state label/tone.
- Deferred:
  - dashed or patterned subtle treatment;
  - muted but legible;
  - no operational affordance dominance.
- Detail:
  - content-density support;
  - allow strong internal rhythm.
- Rail:
  - compact support treatment.

Do not use hardcoded brand colors if an existing token can be used.

## Accessibility Requirements

- Titled cards must continue to use visible heading + `aria-labelledby`.
- Route command cards should use `headingLevel={2}`.
- Most child cards should use `h3`.
- Internal subsections should use `h4` or non-heading labels as appropriate.
- Disabled affordances must remain non-executing and reason-backed.
- State cards with errors must preserve `role="alert"` through `PccPreviewState`.
- Loading states must preserve `aria-busy`.

## Closeout Definition

The card contract is closed only when:

- primitive instrumentation exists;
- all current route card elements are explicit;
- automated tests enforce explicit classification;
- visual hierarchy is materially stronger;
- closeout documentation records validation and hosted-evidence needs.
