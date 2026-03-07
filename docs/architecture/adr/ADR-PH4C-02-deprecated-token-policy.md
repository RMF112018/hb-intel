# ADR-PH4C-02: Deprecated Token Resolution Policy

**Status:** Accepted  
**Decision Date:** 2026-03-07  
**Author:** HB-INTEL-IMPL

## Context
The UI Kit contains deprecated tokens that are no longer in active use or are scheduled for replacement.
A policy is needed to manage deprecation, migration, and eventual removal of these tokens.

## Decision
Adopt a **scan-gated deprecation approach**:

1. **Scan First** — Use grep to identify usages before any removal decision
2. **Remove if Unused** — Tokens with zero usages are removed immediately
3. **Version if Used** — Tokens with usages are marked deprecated with:
   - Deprecation notice in JSDoc
   - Suggested replacement token(s)
   - Phase timeline for migration
   - Link to tracking issue for migration
4. **Track Migrations** — Create tracking issues for each token with usages
5. **Cleanup Later** — Remove versioned tokens only after migrations are complete (Phase 6+)

## Rationale
- **Data-driven**: Removal decisions are based on actual usage, not assumptions
- **Safe**: Versioning with tracking ensures no surprise removals
- **Traceable**: TSDoc and tracking issues provide audit trail
- **Phased**: Migrations happen gradually without breaking existing code

## Implementation
See `docs/reference/ui-kit/deprecated-tokens.md` for current deprecation matrix and Phase 4C scan results.

## Related ADRs
- ADR-0050 (Design System Token Strategy)
- ADR-0051 (Theme Management)

## Traceability
- D-PH4C-03: Scan-gated token deprecation workflow
- D-PH4C-04: Deprecated token set (`hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`)
- Phase: PH4C.3
