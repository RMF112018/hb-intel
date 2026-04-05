# SharePoint Homepage & Shell Boundaries

Authoritative reference for the three-lane SharePoint customization model, homepage vs shell-extension responsibilities, and the supported customization posture for HB Central.

## Three-Lane Architecture

HB Intel's SharePoint presence is organized into three lanes. Each lane has a distinct owner, a distinct package, and a distinct set of constraints.

### Lane A — Homepage / Page-Canvas Product

**Package:** `apps/hb-webparts` (`@hbc/spfx-hb-webparts`)
**Status:** Active — 10 webparts scaffolded and packaged
**UI entry point:** `@hbc/ui-kit/homepage`

Owns all content that appears on the HB Central homepage page canvas. This includes the 10 signature webparts defined in the [SharePoint Homepage Design Brief](../architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md):

1. Personalized Welcome Header
2. HB Hero Banner
3. Priority Actions Rail
4. Company Pulse
5. Project / Portfolio Spotlight
6. Safety & Field Excellence
7. Leadership Message
8. People & Culture
9. Smart Search / Wayfinding
10. Tool Launcher / Work Hub

Homepage webparts render as standard SPFx client-side webparts on the page canvas. They are composed from `@hbc/ui-kit/homepage` primitives and follow the [SPFx Governing Standard](ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md).

### Lane B — Shell Extension Product (Planned)

**Package:** `apps/hb-shell-extension` (not yet created)
**Status:** Planned — Phase 4 of the [Tenant Shell Implementation Blueprint](../architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md)

Will own supported shell-adjacent rendering through SPFx Application Customizer extensions:

- Top placeholder ribbon
- Alert / notification band
- Bottom placeholder footer / support rail
- Optional contextual page utilities

Shell-extension surfaces operate in SharePoint's supported placeholder regions, not inside page-canvas webpart zones.

### Lane C — Navigation & Governance

**Status:** Planned — Phases 5–6 of the Tenant Shell Implementation Blueprint

Covers navigation governance, branding alignment, and content authoring governance using supported SharePoint home-site, hub, and global-nav strategies. Does not involve custom code packages.

## Supported Customization Posture

### What HB Intel IS allowed to do in SharePoint

1. **Page-canvas webparts** — standard SPFx client-side webparts on the homepage and other modern pages
2. **Placeholder extensions** — SPFx Application Customizers rendering in supported top/bottom placeholder regions
3. **Theming and branding** — SharePoint home-site configuration, hub-site branding, and site design governance
4. **Navigation governance** — SharePoint global nav and hub nav configuration
5. **Content authoring** — governed content patterns through webpart property panes and editorial workflows

### What HB Intel is NOT allowed to do

1. **Shell DOM/CSS takeover** — do not replace or suppress Microsoft's modern shell through unsupported DOM manipulation or CSS overrides
2. **Suite bar replacement** — do not create custom suite bar, app bar, or top-level navigation that replaces SharePoint's native chrome
3. **Fragile shell hacks** — do not depend on undocumented SharePoint DOM structure, internal CSS class names, or unsupported injection points
4. **Host assumption violations** — do not assume control over page chrome, title regions, or layout behavior that SharePoint owns

### Governing principle

> Own the page canvas. Extend the supported placeholder shell regions. Align with home site, global nav, and hub branding. Avoid fragile shell hacks as a baseline architecture.
>
> — [Tenant Shell Implementation Blueprint §2.2](../architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md)

## Boundary Rules

1. **Homepage webparts must not contain shell-extension concerns.** Navigation bars, alert bands, and footer rails belong to Lane B, not Lane A.
2. **Shell-extension surfaces must not duplicate homepage composition.** Editorial content, launcher grids, and spotlight cards belong to Lane A.
3. **Both lanes share the same design language** (semantic tokens, typography, accessibility, component quality) but use different UI entry points and follow different composition strategies.
4. **Cross-lane dependencies are prohibited.** Homepage webparts must not import from or depend on the shell-extension package, and vice versa.

## UI Kit Entry Points by Lane

| Lane | Entry Point | Purpose |
|------|-------------|---------|
| Homepage (Lane A) | `@hbc/ui-kit/homepage` | Governed homepage-safe primitives + contract constants |
| Shell Extension (Lane B) | `@hbc/ui-kit/app-shell` | Shell chrome components (planned) |
| Both | `@hbc/ui-kit/theme` | Token-only imports |
| Both | `@hbc/ui-kit/icons` | Icon-only imports |

## Related Documents

- [SharePoint Homepage Design Brief](../architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md) — Vision and requirements for the 10 signature homepage webparts
- [Tenant Shell Implementation Blueprint](../architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md) — 8-phase implementation plan for the three-lane model
- [UI Kit Entry Points](ui-kit/entry-points.md) — Authoritative entry-point reference
- [SPFx Governing Standard](ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md) — Runtime-specific doctrine for SPFx surfaces
- [ADR-0067](../architecture/adr/ADR-0067-spfx-boundary-and-hosting-integration.md) — SPFx boundary and hosting integration decision

## Intentionally Deferred

The following are explicitly out of scope for the current repo state and belong to later phases:

- Shell-extension package implementation (Lane B) — Phase 4
- Navigation governance automation (Lane C) — Phases 5–6
- Full homepage authoring governance — Phase 6
- Packaging and performance hardening — Phase 7
- Accessibility audit and QA — Phase 8
