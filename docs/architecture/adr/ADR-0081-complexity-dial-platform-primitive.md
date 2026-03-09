# ADR-0081 — Complexity Dial as Platform Primitive

**Status:** Accepted
**Date:** 2026-03-09
**Deciders:** HB Intel Architecture Team
**Source Feature:** PH7-SF-03, PH7.4 (Shared-Feature Tier-1 Normalization)
**Related ADRs:** ADR-0001 (monorepo structure), ADR-0080 (BIC Next Move platform primitive)

---

## Context

Every HB Intel module must answer the same question before rendering any UI element: **"How much information should I show this user right now?"**

Without a shared answer, each module makes independent density decisions. Field staff using six modules simultaneously would encounter six different information densities — some overwhelming, some too sparse — destroying the coherent, learnable experience that HB Intel promises.

The platform requires a single, authoritative, cross-module context that:
- Applies a consistent three-tier density model (Essential / Standard / Expert)
- Persists the user's tier choice across sessions and browser tabs
- Derives a sensible initial tier from the user's role at first launch
- Locks the tier during onboarding or admin-directed workflows

The SF03 master plan originally referenced this decision as "ADR-0012". That number was already assigned to `ADR-0012-models-comprehensive-structure.md`. PH7.4 (§7.4.2) corrected this conflict by assigning the next sequential number, ADR-0081.

---

## Decision

Designate `@hbc/complexity` as a **Tier-1 Platform Primitive** with the following properties:

1. **Mandatory use:** Any feature that renders UI with variable information density, expertise-gated content, or coaching prompts must use `@hbc/complexity` rather than implementing local density logic.

2. **Three-tier model:** Essential (minimal, coaching-visible), Standard (full working set), Expert (all fields, audit trails, configuration).

3. **Persistence:** `localStorage` for PWA, `sessionStorage` for SPFx, with cross-tab synchronization via `StorageEvent`. Zero-flash rendering through synchronous cache read on mount.

4. **Role-derived defaults:** New users receive an initial tier derived from Azure AD group membership via a config-file mapping. Fires exactly once; user controls from there.

5. **Optimistic hydration:** New users render at Essential by default. Tier always upgrades upward when role-derived value arrives — content reveals, never hides.

6. **Admin lock:** Soft lock with `lockedBy` and `lockedUntil` fields. Auto-expires at `lockedUntil`. Dial renders disabled with tooltip when locked.

7. **Retrofit pattern:** Existing `@hbc/ui-kit` components accept `complexityMinTier`/`complexityMaxTier` props with sensible defaults. Components gate themselves internally.

8. **Non-duplication:** New domain work must not re-implement complexity/density concern areas locally without an ADR exception referencing this record.

---

## Consequences

### Positive

- Consistent information density across all modules — users learn one density model, not eleven.
- Role-derived defaults reduce onboarding friction: field staff see Essential, executives see Expert, with zero configuration.
- Cross-tab synchronization ensures a tier change in one tab applies everywhere instantly.
- The `HbcComplexityGate` component provides a declarative, testable gate pattern that is simpler than manual conditional rendering.

### Negative

- Every UI component that varies by density must be aware of the complexity context, adding a cross-cutting concern to component design.
- The three-tier model is fixed; features that need finer granularity (e.g., a four-tier model) require an ADR exception.
- SPFx contexts use `sessionStorage`, so tier changes do not persist across browser sessions in SharePoint.

### Risks

- If the retrofit audit (SF03-T07) does not cover enough components, users will see inconsistent density within a module.
- The admin lock feature depends on a backend API endpoint that is not yet implemented; the provider reads and respects lock fields immediately but the admin write surface is deferred.

---

## Related

- [Platform Primitives Registry](../../reference/platform-primitives.md)
- [SF03 Master Plan](../plans/shared-features/SF03-Complexity-Dial.md)
- [ADR-0080 — BIC Next Move as Platform Primitive](./ADR-0080-bic-next-move-platform-primitive.md)
- [Current-State Architecture Map](../current-state-map.md) §3 Category C
- [`packages/complexity/README.md`](../../../packages/complexity/README.md)
- [Complexity Sensitivity Reference](../../reference/ui-kit/complexity-sensitivity.md)

<!-- PH7.4 §7.4.2 — ADR created to replace incorrect ADR-0012 reference in SF03 master plan.
     Original SF03-T09-Deployment.md authored ADR content under number 0012, which conflicts
     with the existing ADR-0012-models-comprehensive-structure.md. This ADR-0081 is the corrected,
     canonical record. -->
