# ADR-0023: UI Navigation System

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.10
**References:** PH4.10-UI-Design-Plan.md §10, PH4-UI-Design-Plan.md §10 & §20, Blueprint §1f, §2c

## Context

Phase 4.9 delivered the Messaging & Feedback System. The application needs standalone, reusable navigation components. Currently, breadcrumbs and tabs are implemented inline within DetailLayout and are not available for use in other contexts.

## Decisions

### 1. Standalone Extraction (Non-Breaking)

HbcBreadcrumbs and HbcTabs are created as **new standalone components**. DetailLayout continues rendering its own inline implementations until an explicit migration step. This avoids breaking changes and allows incremental adoption.

### 2. Tab Underline Color: Orange (#F37021)

The V2.1 design spec mandates `3px solid #F37021` (HBC_ACCENT_ORANGE) for the active tab underline in HbcTabs. This differs from DetailLayout, which uses `HBC_PRIMARY_BLUE`. The standalone HbcTabs implements the spec. DetailLayout will be updated in a future migration.

**Rationale:** The orange underline provides stronger visual hierarchy and aligns with the accent color used across interactive elements (pagination active page, tree selected border).

### 3. Search Variant Split (Discriminated Union)

HbcSearch uses a discriminated union (`variant: 'global' | 'local'`) rather than a single component with conditional behavior.

- **Global**: Thin wrapper around HbcGlobalSearch. Does NOT re-register Cmd+K shortcut, avoiding duplicate keyboard handlers.
- **Local**: Native `<input>` with 200ms debounce (setTimeout pattern matching HbcCommandPalette).

**Rationale:** The global and local search behaviors are fundamentally different (one opens an overlay, the other filters inline). A discriminated union makes the API explicit and type-safe.

### 4. Tree Keyboard Pattern (Roving tabIndex)

HbcTree uses the WAI-ARIA TreeView pattern with roving tabIndex:
- Only the focused node has `tabIndex=0`; all others have `tabIndex=-1`
- A flat visible node list is computed via `useMemo` for O(1) keyboard navigation
- Arrow keys navigate the visible list; ArrowRight/Left expand/collapse

**Rationale:** This follows the WAI-ARIA Authoring Practices for tree views and provides efficient keyboard navigation even with deeply nested structures.

### 5. HbcPagination as Standalone

HbcPagination is not automatically integrated into HbcDataTable. It is a standalone component that can be composed with any list or table.

**Rationale:** Not all tables need pagination (some use virtual scrolling). Keeping pagination standalone allows flexible composition.

### 6. SparkleIcon for AI Results

Star icon replaced with SparkleIcon (sparkle/starburst SVG) in HbcCommandPalette per V2.1 spec. Pure visual change — no logic modifications.

## Consequences

- Six new standalone components available in `@hbc/ui-kit`
- DetailLayout is unchanged (no breaking changes)
- Future migration step needed to replace DetailLayout inline breadcrumbs/tabs with standalone components
- HbcPagination can be composed with HbcDataTable via a `footerSlot` pattern in a future phase
