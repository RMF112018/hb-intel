# SF18-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF18-T07 integration task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Document boundary-safe integration patterns between the SF18 adapter and required Tier-1 primitives.

---

## Integration Contracts

- `@hbc/health-indicator`
  - canonical scoring/state/profile/telemetry contracts and computation runtime
- `@hbc/bic-next-move`
  - per-criterion ownership with blockers-first sequencing and avatar projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control across Signal, Dashboard, Checklist
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freeze, and offline record replay
- `@hbc/related-items`
  - criterion-level deep-links for direct remediation actions
- `@hbc/project-canvas`
  - auto placement of actionable blockers in role-aware My Work lane
- `@hbc/notification-intelligence`
  - urgency routing for `<48h + blockers`
- `@hbc/acknowledgment`
  - CE sign-off criterion source of truth
- `@hbc/sharepoint-docs`
  - plans/specs attachment criterion source of truth

---

## Telemetry Integration

Five KPI outputs are emitted by the primitive and surfaced in canvas/governance views:

- time-to-readiness
- blocker-resolution latency
- percent bids reaching Ready to Bid
- submission error-rate reduction
- checklist CES

---

## Boundary Rules

- no imports from app route pages into package runtime
- no duplicate scoring engine in `@hbc/features-estimating`
- all side effects route through public primitive APIs
- integrations consume public contracts only and remain app-shell-safe

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- integrations
rg -n "from 'apps/" packages/features/estimating/src
rg -n "@hbc/health-indicator|@hbc/versioned-record|@hbc/project-canvas|@hbc/related-items" packages/features/estimating/src
```

---

## Progress Notes

### 2026-03-12 - T07 implementation complete

- Implemented deterministic reference integration adapters under `packages/features/estimating/src/bid-readiness/integrations/` for:
  - BIC Next Move projection
  - Notification dispatch projection
  - Versioned-record snapshot projection
  - Complexity gating
  - Approval authority resolution
- Added integration barrel export plus deterministic adapter-registry factory for mockable integration initialization.
- Updated bid-readiness and root package barrels so integration functions/types are exposed via public package surfaces.
- Added integration tests covering:
  - adapter initialization
  - deterministic output
  - error-safe fallback behavior
  - governance filtering
  - complexity gating behavior
  - recommendation integration mapping
- Verified zero-error gates:
  - `pnpm --filter @hbc/features-estimating check-types`
  - `pnpm --filter @hbc/features-estimating build`
  - `pnpm --filter @hbc/features-estimating test`
