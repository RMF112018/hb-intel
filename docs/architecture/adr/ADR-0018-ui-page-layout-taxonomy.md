# ADR-0018: UI Page Layout Taxonomy

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.5
**References:** PH4.5-UI-Design-Plan.md §5, Blueprint §1f/§2c

## Context

After Phase 4.4 delivered the Global Application Shell (HbcAppShell, HbcHeader, HbcSidebar, HbcConnectivityBar), we need a consistent way to structure page content inside `<main>`. Without standardization, each page would implement its own layout, leading to visual inconsistency, duplicated code, and accessibility gaps.

Additionally, create/edit forms benefit from a "focus mode" that reduces distractions by collapsing the sidebar and dimming surrounding UI. This requires communication between child layout components and the parent shell.

## Decision

### Three Canonical Layouts

Every page in HB Intel must use exactly one of three layouts:

1. **ToolLandingLayout** — Tool list/dashboard pages (KPI cards, command bar, data table, status bar)
2. **DetailLayout** — Single-item detail pages (breadcrumbs, tabs, 8:4 content split)
3. **CreateUpdateLayout** — Create/edit form pages (centered form, Focus Mode)

No custom layouts are allowed.

### Focus Mode via CustomEvent + DOM Attribute

For the CreateUpdateLayout Focus Mode communication between child and parent shell:

**Chosen:** CustomEvent + DOM data-attribute pattern

The `useFocusMode` hook dispatches `CustomEvent('hbc-focus-mode-change', { detail: { active } })` on window. HbcAppShell and HbcSidebar listen for this event and adjust their rendering (overlay, sidebar collapse). The hook also sets `data-focus-mode` on the shell element for CSS targeting.

**Alternatives considered:**

1. **React Context** — Would require wrapping the shell in a FocusMode provider, creating tight coupling between layout and shell. The shell is already rendered; child components shouldn't need to modify provider state.

2. **Prop drilling** — Would require passing focus mode state up through the component tree, violating the principle that layouts are self-contained children of `<main>`.

3. **Zustand store** — Adds a dependency for a single boolean state that only exists during form editing. Over-engineering for this use case.

The CustomEvent pattern matches the established `useFieldMode` → `data-theme` pattern already used in the codebase, maintaining consistency.

## Consequences

### Positive
- Consistent page structure across the entire application
- Focus Mode works without tight coupling between layout and shell
- Pattern is familiar (matches useFieldMode)
- Auto-detection of touch devices provides immediate value for field users
- Full accessibility support (tablist/tab/tabpanel, aria-live, keyboard navigation)

### Negative
- CustomEvent is not type-safe at the listener boundary (mitigated by typed handler cast)
- Three layout constraint may need revisiting if genuinely new page types emerge
- Focus Mode localStorage persistence is per-device, not per-user

### Risks
- Future layouts must not be added without an ADR amendment
- CustomEvent listeners must be cleaned up on unmount to avoid memory leaks
