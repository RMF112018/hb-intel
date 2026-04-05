# Phase 01-01 Completion Note — Homepage Boundary and Inventory

## Status

**Complete.** Homepage product boundary defined, package inventory documented, README rewritten from scaffold to product-lane documentation.

---

## What was clarified

### Product boundary
`apps/hb-webparts` is now explicitly documented as Lane A (Homepage / Page-Canvas Product) with clear ownership of 10 webparts, the mount/dispatch seam, local composition primitives, config normalization helpers, zone contracts, and the reference composition.

### What it does NOT own
Shell-extension surfaces, navigation governance, reusable UI primitives (`@hbc/ui-kit`), SPFx shell/build tooling, domain-app webparts, and platform-layer packages are explicitly listed as out of scope.

### Mount/dispatch seam
`src/mount.tsx` is documented as a controlled product boundary (not incidental glue) with explicit ownership of global API publication, webpart ID dispatch, identity resolution, React lifecycle, and fallback behavior.

### Reference composition role
`ReferenceHomepageComposition` is documented as a development/integration utility — not a production webpart, not the homepage layout specification, not disposable.

### Package inventory
Complete folder-to-responsibility mapping for all ~70 source files across entry seams, shared primitives, helpers (package-wide vs zone-specific), zone contracts, content models, 10 webpart folders, 13 test files, and configuration files.

## Files created

| File | Purpose |
|------|---------|
| `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Product-Boundary.md` | Authoritative boundary definition: owns, does not own, three-lane relationship, ReferenceComposition role, mount seam ownership, known weak points |
| `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Package-Inventory.md` | Complete package inventory with folder-to-responsibility mapping, file counts, test coverage |
| `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Phase-01-01-Completion-Note.md` | This completion note |

## Files updated

| File | Change |
|------|--------|
| `apps/hb-webparts/README.md` | Rewritten from scaffold language ("Prompt-03 scaffold app", "Scaffolding Rules") to product-lane documentation with architecture context, webpart table, package structure, mount seam description, import policy, packaging model, and related doc links |

## Boundary weak points identified for Prompt 02

1. **Helper ownership ambiguity** — Package-wide vs zone-specific helpers need explicit ownership classification
2. **Shared primitives promotion tracking** — No formal mechanism to track which local primitives approach the 2-consumer promotion threshold for `@hbc/ui-kit`
3. **Legacy scaffold manifest** — `src/webparts/hbWebparts/` should be documented as intentionally retained or removed
4. **Authoring governance adoption** — The governance helper exists but per-webpart adoption is uneven

## What remains for Prompt 02

- Rationalize shared homepage seams, contracts, and helper ownership
- Classify package-wide vs zone-specific helpers explicitly
- Stabilize authoring governance adoption across all 10 webparts
- Address the legacy scaffold manifest disposition
