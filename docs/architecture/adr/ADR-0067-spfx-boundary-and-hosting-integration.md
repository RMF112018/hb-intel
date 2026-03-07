# ADR-0067: SPFx Boundary and Hosting Integration

- **Status:** Accepted
- **Date:** 2026-03-06
- **Phase:** 5.14 (SPFx Boundary and Hosting Integration)
- **Related Plans:** `docs/architecture/plans/PH5.14-Auth-Shell-Plan.md`, `docs/architecture/plans/PH5-Auth-Shell-Plan.md`

## Context

Phase 5.14 requires preserving one HB Intel shell product across runtime modes while allowing SPFx to host the product in SharePoint contexts. Locked Option C decisions require a narrow SPFx boundary: SPFx may supply host container context, Microsoft identity context, and limited approved host hooks, but must not become the source of shell composition truth.

## Decision

1. Introduce strict typed SPFx bridge contracts in `@hbc/auth` and `@hbc/shell`:
   - identity handoff seam (`SpfxIdentityBridgeInput`, `SpfxHostBridgeInput`)
   - host container metadata
   - limited host signal state/hooks (`theme`, `resize`, `location`).
2. Keep shell composition authority in HB Intel shell rules (`resolveShellModeRules`) and environment adapters.
3. Refactor SPFx bootstrap/adapter paths to consume bridge contracts through validated normalization helpers, including legacy compatibility mapping from raw `ISpfxPageContext`.
4. Add shell boundary enforcement so SPFx bridge payloads are accepted only for `spfx` environment adapters.
5. Implement narrow host hook dispatch through `createSpfxShellEnvironmentAdapter` without introducing SPFx-specific branching inside generic shell components.

## Consequences

### Positive

- SPFx hosting remains a bounded integration seam instead of a shell composition owner.
- Auth/shell package contracts become explicit, testable, and reusable across SharePoint host variants.
- Approved host signals can flow for high-value host integration needs without fragmenting shell behavior.

### Tradeoffs

- Additional bridge contracts increase type surface area.
- Legacy raw page-context paths require normalization helpers during migration.

## Rejected Alternatives

1. **Allowing SPFx host payloads to set shell mode/layout controls:** rejected because it violates one-product shell authority.
2. **Embedding SPFx-specific logic directly in generic shell components:** rejected because it breaks host-agnostic shell boundaries.
3. **No runtime validation for bridge seams:** rejected because boundary mistakes become silent and harder to audit.

## Traceability

- `docs/architecture/plans/PH5.14-Auth-Shell-Plan.md` §5.14 items 1-5
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` locked Option C SPFx boundary decisions
- `docs/architecture/plans/PH5.13-Auth-Shell-Plan.md` (foundation continuity for governance and traceability patterns)
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- Implementation alignment tags referenced in code comments: D-04, D-07, D-10, D-12
