# ADR-0012: @hbc/models Comprehensive Per-Domain File Structure

**Status:** Accepted
**Date:** 2026-03-03
**Deciders:** HB Intel Architecture Team

## Context

The `@hbc/models` package originally contained 13 domain folders, each with a single `index.ts` file holding all interfaces, enums, and constants inline. As the platform grew, this monolithic-per-domain approach created several issues:

1. **Discoverability** — Developers had to scan large files to find specific types.
2. **JSDoc coverage** — Inline definitions lacked field-level documentation.
3. **Missing types** — No FormData interfaces, no domain-specific enums (except leads), no type aliases or constants for most domains.
4. **Inconsistent structure** — leads/ had an enum and FormData; other domains had neither.

PH2-Shared-Packages-Plan.md §2.1 offered three options:
- **Option A:** Keep single-file-per-domain (minimal change)
- **Option B:** Split only interfaces and enums
- **Option C:** Comprehensive per-domain file structure (6 files per domain)

## Decision

We chose **Option C: Comprehensive per-domain file structure**.

Each domain now has a consistent 6-file structure:
- `I[Domain].ts` — Main interface(s) with full JSDoc
- `I[Domain]FormData.ts` — Form input interfaces
- `[Domain]Enums.ts` — Domain enums and type unions
- `types.ts` — Domain-specific type aliases
- `constants.ts` — Labels, defaults, thresholds
- `index.ts` — Pure barrel re-export with `.js` extensions

## Consequences

### Positive
- **Consistent structure** across all 13 domains
- **Full JSDoc** on every exported type and field
- **New enums** for all domains (EstimatingStatus, ScheduleActivityStatus, BuyoutStatus, etc.)
- **FormData interfaces** for all domains (form-oriented subset of main interfaces)
- **Type aliases** for IDs and search criteria
- **Constants** for labels, thresholds, and defaults
- **Zero breaking changes** — all 62+ existing imports resolve identically through re-export chains

### Negative
- **More files** — 14 files expanded to ~79 (65 new content files + 14 rewritten barrels)
- **Build time** — marginally increased due to more modules (negligible in practice)

### Risks
- Future type name collisions between domains must be caught at build time (e.g., `ProjectCode` was initially duplicated between project/ and provisioning/)

## Backward Compatibility

The re-export chain preserves full backward compatibility:
```
import { ILead } from '@hbc/models'
  → src/index.ts (export * from './leads/index.js')
    → src/leads/index.ts (export { type ILead } from './ILead.js')
      → src/leads/ILead.ts
```

Runtime values (`SAGA_STEPS`, `TOTAL_SAGA_STEPS`, `LeadStage`) use `export` (not `export type`) in barrel files to preserve runtime accessibility.

## References

- PH2-Shared-Packages-Plan.md §2.1 (Option C)
- Blueprint §1a (shared packages architecture)
- Foundation Plan Phase 2.1
