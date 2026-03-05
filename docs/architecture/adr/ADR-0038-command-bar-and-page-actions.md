# ADR-0038: Command Bar & Page Actions (D-03)

**Status:** Accepted
**Date:** 2026-03-05
**Phase:** 4b.4 — Command Bar & Page Actions

## Context

Before Phase 4b.4, page actions were rendered inconsistently — some pages placed buttons directly in content zones, others used the command bar. This prevented:

1. Automatic field mode adaptation (no way to derive FAB vs. palette actions)
2. Overflow menu support for secondary actions
3. Consistent destructive action styling
4. ESLint enforcement of the pattern

## Decision

All page actions flow through `WorkspacePageShell.actions` and `overflowActions` props, which render in a reserved command bar zone via `HbcCommandBar` (D-03).

### Key design choices:

- **CommandBarAction enhanced** with `isDestructive` (red styling) and `tooltip` (HbcTooltip wrapping)
- **Overflow menu** via Fluent v9 `Menu`/`MenuPopover`/`MenuItem` components
- **Field mode adaptation**: primary action → 56px FAB (fixed bottom-right), secondary + overflow → injected into Cmd+K palette via `fieldModeActionsStore`
- **Module-level store** (`useSyncExternalStore`) for palette injection — HbcCommandPalette is a sibling of WorkspacePageShell in the component tree, so React context cannot flow between them
- **ESLint rule** `hbc/no-direct-buttons-in-content` warns when `HbcButton` or `Button` appears as a direct child of `<WorkspacePageShell>`

### Naming: kept `primary`/`disabled` (not `isPrimary`/`isDisabled`)

Existing convention across 6+ stories and components uses `primary`/`disabled`. Only genuinely new fields (`isDestructive`, `tooltip`) were added.

## Consequences

- No standalone buttons allowed in page content zones
- Every page automatically gets field mode adaptation
- Overflow actions are cleanly separated from primary actions
- ESLint rule catches the most common violation pattern (direct children)
- Deeper nesting violations enforced by documentation and code review
