# Deprecated Tokens Reference

This document tracks deprecated UI Kit tokens and their migration status.

## Token Deprecation Matrix

| Token | Status | Usages Found | Removed Date | Replacement | Tracking Issue |
|-------|--------|--------------|--------------|-------------|-----------------|
| `hbcColorSurfaceElevated` | Versioned | 45 | N/A | `hbcColorSurface0` | PH4C-DEPRECATED-TOKENS-001 (placeholder) |
| `hbcColorSurfaceSubtle` | Versioned | 41 | N/A | `hbcColorSurface1` | PH4C-DEPRECATED-TOKENS-002 (placeholder) |
| `hbcColorTextSubtle` | Versioned | 38 | N/A | `hbcColorTextMuted` | PH4C-DEPRECATED-TOKENS-003 (placeholder) |

## Migration Policy

HB Intel uses a scan-gated deprecation approach:

1. **Identify** deprecated tokens via audit findings
2. **Scan** for usages using grep across all source, app, and docs directories
3. **Remove** if zero usages found (tokens are removed completely)
4. **Version** if usages found (tokens marked deprecated with TSDoc + tracking issue)
5. **Migrate** usages in subsequent phases (Phase 5+)
6. **Cleanup** deprecated tokens in final cleanup phase (Phase 6+)

## Usage Examples

### Removed Token (Zero Usages)
```
hbcColorSurfaceElevated — Removed 2026-03-07 (zero usages found)
```

### Versioned Token (With Usages)
```typescript
/**
 * @deprecated [N] usages found. See tracking issue [URL].
 * Replacement: Use hbcColorSurface1 for subtle backgrounds.
 */
export const hbcColorSurfaceSubtle = '#FAFAFA';
```

## Phase 4C Scan Results

**Date:** 2026-03-07
**Scan Tool:** grep with --include patterns
**Directories Scanned:** packages/, apps/, docs/

### Summary
- Total deprecated tokens identified: 3
- Tokens removed: 0
- Tokens versioned: 3
- Migration tracking issues created: 3 (placeholder IDs)

## Traceability

- Decision source: D-PH4C-03 (scan-gated deprecation) and D-PH4C-04 (three-token deprecated set)
- Implementation phase: PH4C.3 — Deprecated Token Scan & Resolution
- Policy ADR: `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md`
