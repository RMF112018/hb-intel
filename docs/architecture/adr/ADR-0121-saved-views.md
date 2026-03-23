# ADR-0121: Saved Views Shared Primitive Architecture

**Status:** Accepted
**Date:** 2026-03-23
**Package:** `@hbc/saved-views`
**Governing Plan:** `docs/architecture/plans/shared-features/SF26-Saved-Views.md`

## Context

Phase 3 modules need persistent workspace-state views — filters, sorts, groups, column visibility — with scope-based ownership, schema compatibility checking, and reconciliation when schemas drift. SF26 defines `@hbc/saved-views` as the Tier-1 shared persistence runtime.

## Decision

### Locked Decisions (L-01 through L-06)

- **L-01:** Lifecycle runtime, persistence, and scope enforcement owned by primitive
- **L-02:** Scope model: personal/team/role/system with auth-delegated permissions
- **L-03:** Schema compatibility: compatible/degraded-compatible/incompatible with user explanations
- **L-04:** SharePoint MVP persistence; Azure migration seam
- **L-05:** Integration contracts: ISavedViewContext handoff to export-runtime (SF24) and bulk-actions (SF27)
- **L-06:** TanStack Table canonical mapper; complexity-based default view resolution

### Architecture

- Reusable UI (SavedViewPicker, SavedViewChip, SaveViewDialog, ScopeBadge, DefaultToggle, CompatibilityBanner) in `@hbc/ui-kit`
- Module adapters implement `ISavedViewStateMapper<TState>` — serialize/deserialize/currentSchemaVersion/currentSchema
- 29 tests at 100%/97%/100% coverage

## Related

- [SF26-Saved-Views.md](../../plans/shared-features/SF26-Saved-Views.md)
- [saved-views-adoption-guide.md](../../how-to/developer/saved-views-adoption-guide.md)
- [api.md](../../reference/saved-views/api.md)
