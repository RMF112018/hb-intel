# UI Kit Reference — Doctrine & Entry Points

## Governing Doctrine

UI decisions in HB Intel are governed by two runtime-specific doctrine standards:

- **[SPFx Governing Standard](./doctrine/UI-Doctrine-SPFx-Governing-Standard.md)** — Primary governing doctrine for SharePoint-hosted surfaces (homepage webparts, communication-site compositions, shell-adjacent extensions)
- **[PWA Governing Standard](./doctrine/UI-Doctrine-PWA-Governing-Standard.md)** — Primary governing doctrine for immersive PWA surfaces (field tools, dashboards, executive views)

### Governance model

- Shared design language and component system remain common across all surfaces
- **PWA doctrine** governs immersive owned-application surfaces
- **SPFx doctrine** governs SharePoint-hosted and host-aware surfaces
- Existing UI-kit component reference docs remain valuable as implementation detail and design evidence, but are not the final governing authority for runtime-specific decisions

### Supersession

These two governing standards supersede any older UI-kit wording that assumed a single universal doctrine applied identically to all runtime surfaces. Existing component-level reference docs (HbcChart, HbcInput, etc.) remain accurate for component API and usage, but do not override the runtime-specific governing standards above.

## Entry Points

See **[entry-points.md](./entry-points.md)** for the authoritative reference on all 5 `@hbc/ui-kit` entry points.

Quick summary:

| Entry Point | Use For |
|-------------|---------|
| `@hbc/ui-kit` | PWA, dev-harness, non-constrained bundles |
| `@hbc/ui-kit/homepage` | HB Central homepage SPFx webparts |
| `@hbc/ui-kit/app-shell` | SPFx domain apps needing shell chrome |
| `@hbc/ui-kit/theme` | Token-only imports |
| `@hbc/ui-kit/icons` | Icon-only imports |

## Related

- [SharePoint Homepage & Shell Boundaries](../sharepoint-homepage-shell-boundaries.md) — Three-lane model and boundary rules
- [Package Relationship Map — Rule R2](../../architecture/blueprint/package-relationship-map.md) — Entry-point governance rule
