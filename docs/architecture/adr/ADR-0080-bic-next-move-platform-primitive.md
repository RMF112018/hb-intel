# ADR-0080 — BIC Next Move as Platform Primitive

**Status:** Accepted
**Date:** 2026-03-09
**Deciders:** HB Intel Architecture Team
**Source Feature:** PH7-SF-02, PH7.4 (Shared-Feature Tier-1 Normalization)

---

## Context

The UX competitive study (ux-mold-breaker.md §7.2, con-tech-ux-study §8.2) identified that Procore's Ball-In-Court (BIC) system — which shows who owns the next move on a record — is the industry's most effective accountability mechanism. However, Procore's implementation is inconsistent: BIC exists on submittals and RFIs but not on Change Events, disorienting users who rely on it in some tools but find it absent in others.

HB Intel's response is to generalize BIC into a **platform-wide primitive** via `@hbc/bic-next-move` — a Tier-1 shared package that any module adopts through a generic configuration contract (`IBicNextMoveConfig<T>`). This ensures every actionable item across every module renders consistent ownership state.

The SF02 master plan originally referenced this decision as "ADR-0011". That number was already assigned to `ADR-0011-verification-deployment.md`. PH7.4 (§7.4.2) corrected this conflict by assigning the next sequential number, ADR-0080.

---

## Decision

Designate `@hbc/bic-next-move` as a **Tier-1 Platform Primitive** with the following properties:

1. **Mandatory use:** Any feature that tracks ownership, accountability, or "who acts next" on actionable records must use `@hbc/bic-next-move` rather than implementing local ownership logic.

2. **Generic contract:** The package exposes `IBicNextMoveConfig<T>` — a generic configuration interface that domain modules implement to resolve BIC state for their specific item types.

3. **Cross-module registry:** Modules register via `registerBicModule()` with a key from `BIC_MODULE_MANIFEST`, enabling the `useBicMyItems()` hook to aggregate ownership items across the entire platform.

4. **Urgency tier model:** Fixed platform defaults (`watch < 3 business days`, `immediate = overdue or today`) with optional per-config threshold overrides. Null owner forces `immediate`.

5. **Transfer detection:** Hybrid approach — hook-level diff detection on mount + explicit `recordBicTransfer()` for background transitions + deduplication guard on 60-second bucket key.

6. **Complexity integration:** All three components (`HbcBicBadge`, `HbcBicDetail`, `HbcBicBlockedBanner`) render in Essential/Standard/Expert tiers per the Complexity Dial (`@hbc/complexity`, ADR-0081).

7. **Non-duplication:** New domain work must not re-implement BIC concern areas locally without an ADR exception referencing this record.

---

## Consequences

### Positive

- Every module presents consistent ownership visibility — no gaps like Procore's inconsistent BIC coverage.
- Cross-module "My Work Feed" becomes possible via `useBicMyItems()` fan-out aggregation.
- Transfer detection and notification wiring are centralized, eliminating per-module notification plumbing.
- Module authors get a zero-configuration path for the common case while retaining override capability.

### Negative

- Module authors must implement `IBicNextMoveConfig<T>` (8 required resolvers) to adopt BIC, adding upfront integration work.
- Client-side fan-out for `useBicMyItems()` will need server-side migration (`BIC_AGGREGATION_MODE`) as module count grows.
- The `BIC_MODULE_MANIFEST` must be updated when new modules are added, creating a coordination point.

### Risks

- If adoption is not enforced during feature development, the platform advantage (consistent BIC everywhere) degrades.
- The deduplication guard (60-second bucket) may need tuning for high-frequency transfer scenarios.

---

## Related

- [Platform Primitives Registry](../../reference/platform-primitives.md)
- [SF02 Master Plan](../plans/shared-features/SF02-BIC-Next-Move.md)
- [ADR-0081 — Complexity Dial as Platform Primitive](./ADR-0081-complexity-dial-platform-primitive.md)
- [Current-State Architecture Map](../current-state-map.md) §3 Category C
- [`packages/bic-next-move/README.md`](../../../packages/bic-next-move/README.md)

<!-- PH7.4 §7.4.2 — ADR created to replace incorrect ADR-0011 reference in SF02 master plan.
     Original SF02-T08-Deployment.md authored ADR content under number 0011, which conflicts
     with the existing ADR-0011-verification-deployment.md. This ADR-0080 is the corrected,
     canonical record. -->
