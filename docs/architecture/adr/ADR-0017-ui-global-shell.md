# ADR-0017: UI Global Application Shell Architecture

**Status:** Accepted
**Date:** 2026-03-04
**Context:** Phase 4.4 — Global Application Shell
**References:** Blueprint §1f, §2c | PH4.4-UI-Design-Plan.md §4.1–4.3

## Decision

The global application shell (connectivity bar, header, sidebar, orchestrator) is implemented as pure ui-kit components in `packages/ui-kit/src/HbcAppShell/`, not in `packages/shell/` or `apps/pwa/`.

## Rationale

1. **Tree-shakable for SPFx**: Phase 5 requires SPFx Application Customizers to re-export only `HbcConnectivityBar` + `HbcHeader` under a 250KB bundle constraint. Placing components in ui-kit enables selective imports.

2. **Token-driven styling**: All visual properties derive from `theme/tokens.ts`, ensuring consistency across PWA and SPFx surfaces without duplicating design decisions.

3. **Store composition, not ownership**: Shell components consume stores (`useProjectStore`, `usePermission`) from `@hbc/shell` and `@hbc/auth` but do not own them. This preserves the ports-and-adapters boundary.

4. **Hook-based state**: Each state concern (connectivity, field mode, sidebar collapse) has a dedicated hook with localStorage persistence, enabling independent testing and reuse.

## Alternatives Considered

- **Components in `packages/shell/`**: Rejected because shell owns navigation stores and layout logic, not visual components. Mixing would couple visual styling to navigation concerns.
- **Components in `apps/pwa/`**: Rejected because SPFx webparts need the same components without depending on the PWA app.

## Consequences

- `@hbc/ui-kit` gains a dependency on `@hbc/auth` (for `usePermission` in sidebar group filtering).
- Future SPFx integration (Phase 5) can import shell components directly from `@hbc/ui-kit`.
- The `HbcAppShell` orchestrator accepts a `mode?: 'pwa' | 'spfx'` prop for future differentiation.
