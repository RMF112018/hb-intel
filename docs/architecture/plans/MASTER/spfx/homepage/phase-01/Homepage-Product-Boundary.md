# Homepage Product Boundary

Authoritative boundary definition for `apps/hb-webparts` as the HB Central homepage product lane.

## What this package owns

### Page-canvas homepage webparts
All 10 HB Central homepage webparts. Each renders independently as a standard SPFx client-side webpart on the page canvas.

### Mount / dispatch seam
`src/mount.tsx` — the SPFx loader contract boundary. Maps webpart IDs to React components, resolves identity from SharePoint context, provides the `mount()`/`unmount()` global API consumed by the SPFx shell.

### Reference homepage composition
`src/homepage/ReferenceHomepageComposition.tsx` — development preview and visual integration reference. Renders all 10 webparts in demo mode. Not the production rendering path.

### Local homepage composition primitives
`src/homepage/shared/` — 13 React components specific to homepage zone composition (section shells, card variants, rail shells, cluster layouts). These are local to the homepage package and are not `@hbc/ui-kit` exports. Promotion to ui-kit requires 2+ consumers outside homepage.

### Config normalization and helper seams
`src/homepage/helpers/` — 12 helper modules for identity resolution, greeting generation, config normalization, authoring governance, and visibility filtering. Package-wide helpers serve all webparts; zone-specific helpers serve their zone's webparts.

### Zone configuration type contracts
`src/homepage/webparts/` — TypeScript configuration interfaces organized by homepage zone (top-band, utility, communications, operational awareness, discovery, authoring governance).

### Content model types
`src/homepage/models/` — Shared content and view-model types used across webparts.

### Webpart manifest files
Each webpart folder contains a `*.manifest.json` file declaring the SPFx component ID, alias, group, and preconfigured entries.

### Tests
`src/homepage/__tests__/` — 13 test files covering config normalization, webpart rendering, primitives, and helpers.

### Proof-case entry points
`src/mount-hero-proof-case.tsx` and `src/mount-priority-actions-rail-proof-case.tsx` — isolated entry points used during tenant validation of individual webparts. Not used in the cumulative production build.

## What this package does NOT own

| Responsibility | Owned By | Why Not Homepage |
|----------------|----------|------------------|
| Shell-extension surfaces (top ribbon, alert band, footer) | Future `apps/hb-shell-extension` (Lane B) | Different SPFx extension type, different page regions |
| Navigation / branding governance | SharePoint admin config (Lane C) | Not custom code |
| Reusable visual UI primitives | `@hbc/ui-kit` (via `/homepage` entry) | Package boundary rule R1 |
| SPFx shell webpart (loader) | `tools/spfx-shell/` | Build tooling, not product code |
| Build orchestration | `tools/build-spfx-package.ts` | Build tooling, not product code |
| Domain-app SPFx webparts | `apps/accounting`, `apps/estimating`, etc. | Different product lanes |
| Auth, data access, query hooks | `packages/auth`, `packages/data-access`, etc. | Platform layer packages |

## How the package relates to the three-lane architecture

```
Lane A — Homepage / Page-Canvas Product
  └── apps/hb-webparts  ← THIS PACKAGE
       ├── 10 production webparts (page-canvas content)
       ├── mount/dispatch seam (SPFx loader contract)
       ├── local composition primitives (homepage-specific)
       ├── config normalization and helpers
       └── reference composition (dev/preview only)

Lane B — Shell Extension Product (planned)
  └── apps/hb-shell-extension (not yet created)
       └── Application Customizer extensions (top/bottom placeholders)

Lane C — Navigation & Governance (planned)
  └── SharePoint admin configuration (no custom code packages)
```

## ReferenceHomepageComposition role

`ReferenceHomepageComposition` is **not** a production webpart. It is a **development and integration utility** that:

1. Serves as the fallback render in `mount.tsx` when no `webPartId` is provided (local dev, preview)
2. Demonstrates the intended zone structure with sample data for all 10 webparts
3. Provides a visual smoke test that all webpart components render without errors

It must not be deleted unless replaced with an equivalent dev-preview mechanism. It must not be deployed as a production webpart or treated as the homepage layout specification.

## Mount/dispatch seam ownership

The `mount.tsx` seam is a **package-level product boundary**, not incidental glue. It owns:

- Global API publication (`globalThis.__hbIntel_hbWebparts`)
- Webpart ID → React component dispatch (`WEBPART_RENDERERS` map)
- Identity resolution from SPFx context
- React root lifecycle (create, render, unmount)
- Fallback behavior when no webpart ID matches

Changes to `mount.tsx` affect all 10 webparts and the SPFx shell contract. It should be treated as a controlled seam with equivalent care to a package's public API.

## Boundary weak points (known)

These are acknowledged gaps for Prompt 02 to address:

1. **Helper ownership ambiguity** — Some helpers are package-wide (identity, greeting, normalization), others are zone-specific (topBandConfig, utilityConfig). Ownership should be made explicit.
2. **Shared primitives promotion threshold** — No formal tracking of which local primitives approach the 2-consumer promotion threshold.
3. **Legacy scaffold manifest** — `src/webparts/hbWebparts/` contains only the legacy `HbWebpartsWebPart.manifest.json` (excluded from builds). Should be documented as intentionally retained or removed.
4. **Authoring governance contract coverage** — The `authoringGovernance.ts` helper exists but its per-webpart adoption is uneven.
