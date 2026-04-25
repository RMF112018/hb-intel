# 05 — Frontend UX and Design Standard

## Design doctrine target

The Foleon Connector must meet the standards in:

- `docs/reference/spfx-surfaces/**`
- `docs/reference/spfx-surfaces/benchmark/**`
- `docs/reference/ui-kit/doctrine/`
- `UI-Doctrine-SPFx-Governing-Standard.md`
- `UI-Doctrine-SPFx-Homepage-Overlay.md` where the connector is hosted or exposed on homepage-adjacent surfaces

## Product posture

The connector should feel like a serious editorial operations console, not a SharePoint list wrapper.

Visual tone:

- premium;
- controlled;
- editorial;
- operationally trustworthy;
- not playful like recognition/kudos;
- not generic Fluent card-grid;
- not raw admin table unless inside a governed panel/table component.

## Information architecture

```text
Foleon Connector
├── Dashboard
│   ├── Sync health
│   ├── Content readiness
│   ├── Placement health
│   └── Recent changes
├── Content
│   ├── Search / filters
│   ├── Content list
│   ├── Detail/edit panel
│   └── Validation checklist
├── Placements
│   ├── Active placements board
│   ├── Placement editor
│   └── Homepage preview strip
├── Sync
│   ├── Sync status
│   ├── Run history
│   ├── Failed items
│   └── Replay actions
└── Settings / Diagnostics
    ├── Accepted origins
    ├── SharePoint contract validation
    ├── Runtime config proof
    └── Provisioning status
```

## Primary screens

### Dashboard

Purpose: answer “is Foleon content healthy enough to display?” within 5 seconds.

Required modules:

- Sync status card
- Published content count
- Draft/warning/blocked count
- Homepage placement health
- Recent sync runs
- Top validation issues

### Content Registry

Purpose: browse, search, create, edit, validate, and publish Foleon content records.

Layout:

- left/primary: content results table/cards with filters;
- right/slide-over: detail/editor panel;
- validation rail inside detail panel;
- top action band for Add, Sync, Validate Selected.

### Placement Manager

Purpose: manage what appears in the display app Highlights route.

Layout:

- placement lanes: Hero, Primary Card, Secondary Card, Carousel, Archive Rail;
- content picker overlay;
- preview card rendering matching display app card contract;
- conflicts/warnings inline.

### Sync Status

Purpose: operator view over backend sync jobs.

Layout:

- latest run summary;
- run history table;
- failed items details;
- replay/repair actions role-gated.

### Settings / Diagnostics

Purpose: admin-only proof and operational controls.

Layout:

- environment/config summary with redacted secrets;
- list GUIDs and validation status;
- accepted origins;
- provision/validate actions;
- runtime proof guidance.

## Required state model

Every major surface must define:

- loading state;
- empty state;
- partially configured state;
- error state;
- blocked-by-role state;
- save success state;
- dirty/unsaved changes state;
- conflict/stale eTag state;
- validation warning state;
- validation blocking state.

## Interaction patterns

Use:

- panels/drawers for content edit detail;
- modal confirmation for publish/suppress/destructive actions;
- anchored popovers for filters and compact help;
- tooltips for compact status icons;
- no browser `confirm()` prompts;
- no hover-only critical controls.

## Premium stack requirements

Use deliberately where relevant:

- `motion/react` for panel transitions, validation status reveal, action feedback;
- `lucide-react` for status, sync, publish, warning, reader, placement icons;
- `@floating-ui/react` for content picker/search suggestions/filter menus;
- `@radix-ui/react-tooltip` for compact validation cues;
- `@radix-ui/react-separator` for rhythm;
- `@radix-ui/react-scroll-area` for long panels and run history;
- `class-variance-authority` for card/table/status variants;
- `clsx` for class composition.

Do not install these symbolically; use them materially.

## Breakpoint specification

The connector must be application-level container-aware.

| Mode | Practical width | Behavior |
|---|---:|---|
| Wide desktop | 1400+ | Dashboard grid + right-side context panel; content table + detail side panel |
| Standard desktop | 1180–1400 | Two-column content/edit layout; compact metrics |
| Tablet landscape | 980–1180 | Filters collapse; detail panel overlays rather than side-by-side if stressed |
| Tablet portrait | 720–950 | Single-column; detail opens full-height drawer |
| Phone portrait | 375–430 | Minimal dashboard; content cards; full-screen editor stepper |
| Short-height | any narrow height | Compact top band; sticky actions; no hidden primary action |

Narrowest stable nested mode: **375px practical content width**.

## Accessibility requirements

- WCAG 2.1 AA contrast minimum.
- Keyboard reachable primary flows.
- Visible focus indicators.
- No hover-only meaning.
- Dialog/panel focus management.
- `prefers-reduced-motion` support.
- Touch-safe controls in compact mode.
- Proper form labels and error messages.

## Non-compliant outcomes

Reject any implementation that:

- looks like raw SharePoint list views;
- relies on users understanding SharePoint internal fields;
- uses generic thin-border card grids as the dominant language;
- lacks validation and blocked-state handling;
- hides key controls at tablet/phone widths;
- uses default Fluent visual style as the premium answer;
- saves invalid records that the display app cannot render.
