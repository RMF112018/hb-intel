# ADR-0123: Bulk Actions Shared Primitive Architecture

**Status:** Accepted
**Date:** 2026-03-23
**Package:** `@hbc/bulk-actions`
**Governing Plan:** `docs/architecture/plans/shared-features/SF27-Bulk-Actions.md`

## Context

Phase 3 modules need safe, governed bulk operations — selection, eligibility checks, chunked execution, and mixed-result reporting. SF27 defines `@hbc/bulk-actions` as the Tier-1 shared bulk-actions primitive.

## Decision

- **L-01–L-10:** Selection scope safety (page/visible/filtered, no implicit whole-dataset), per-item eligibility with reason codes, chunked execution (default 50), mixed-result reporting with grouped failure reasons, destructive action gating, permission gates, ISavedViewContext handoff from SF26
- 6 ui-kit components (BulkSelectionBar, BulkActionMenu, BulkActionConfirmDialog, BulkActionInputDialog, BulkActionResultsPanel, SelectAllFilteredBanner)
- 25 tests at 100%/96%/100% coverage

## Related

- [SF27-Bulk-Actions.md](../../plans/shared-features/SF27-Bulk-Actions.md)
- [bulk-actions-adoption-guide.md](../../how-to/developer/bulk-actions-adoption-guide.md)
- [api.md](../../reference/bulk-actions/api.md)
