# UI Kit Reference — Doctrine & Entry Points

## Governing Doctrine

UI decisions in HB Intel are governed by a layered doctrine stack. Rules are classified as **BINDING** (mandatory) or **DIRECTIONAL** (strong guidance, justified deviation acceptable).

### Doctrine hierarchy

```
Layer 1 — Runtime-Specific Governing Standards (top-level authority)
  ├── SPFx Governing Standard        (all SPFx surfaces)
  │     └── SPFx Homepage Overlay    (homepage-specific rules and freedoms)
  └── PWA Governing Standard         (all PWA surfaces)

Layer 2 — Cross-Runtime Shared Obligations
  └── Accessibility, token discipline, package boundaries, import discipline

Layer 3 — Component and Pattern Reference (implementation detail)
  └── Component API docs, composition guides, field readability, visual language
      (accurate for usage — do not override Layer 1 doctrine)
```

### Governing documents

| Document | Scope | Classification |
|----------|-------|----------------|
| [SPFx Governing Standard](./doctrine/UI-Doctrine-SPFx-Governing-Standard.md) | All SharePoint-hosted surfaces | Layer 1 — primary SPFx authority |
| [SPFx Homepage Overlay](./doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md) | HB Central homepage webparts only | Layer 1 — homepage-specific overlay |
| [PWA Governing Standard](./doctrine/UI-Doctrine-PWA-Governing-Standard.md) | All PWA surfaces | Layer 1 — primary PWA authority |

### Governance model

- Shared design language and component system remain common across all surfaces
- **PWA doctrine** governs immersive owned-application surfaces
- **SPFx doctrine** governs SharePoint-hosted and host-aware surfaces
- **SPFx Homepage Overlay** adds homepage-specific binding and directional rules on top of the SPFx standard
- Layer 3 docs (component references, composition guides) remain accurate for component API and usage, but do not override Layer 1 doctrine

### Supersession

The Layer 1 governing standards supersede any older UI-kit wording that assumed a single universal doctrine applied identically to all runtime surfaces. Specifically:

- Component-level reference docs (HbcChart, HbcInput, etc.) remain accurate for API and usage details
- Docs such as `UI-Kit-Visual-Language-Guide.md`, `UI-Kit-Usage-and-Composition-Guide.md`, and `UI-Kit-Field-Readability-Standards.md` are Layer 3 implementation reference — they inform but do not override the runtime-specific governing standards
- When a Layer 3 doc conflicts with a Layer 1 governing standard, the Layer 1 standard governs

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
