# SF18-T03 - Readiness Profile and Configuration

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan - SF18-T03 model/config task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define the Estimating readiness profile that configures `@hbc/health-indicator` without duplicating core health computation.

---

## Profile Semantics

- scoring remains deterministic and weighted by criterion completion
- blockers-first precedence is enforced by profile metadata and BIC ownership rules
- status classification uses primitive outputs and SF18 profile thresholds
- due-date urgency and overdue behavior are consumed from primitive state

This mirrors operations-grade weighted readiness approaches used in construction project-definition indexes and enterprise health scoring patterns.

---

## Configuration Model

- default profile provides six baseline criteria and threshold bands
- admin overrides may adjust weights, blocker flags, and trade coverage threshold
- merge order: baseline profile -> admin override -> runtime validation
- validation rules:
  - weights are non-negative and normalize deterministically
  - threshold ordering remains `ready > nearly-ready > attention-needed`
  - at least one blocker criterion remains configured

---

## Provenance and Versioning

- profile/config changes are persisted through `@hbc/versioned-record`
- each save records immutable provenance metadata (`version`, `modifiedBy`, `modifiedAt`)
- submission snapshot freeze records an immutable readiness artifact
- replay/idempotency requirements apply to offline-synced configuration updates

---

## Telemetry Contract

The profile must emit five KPI signals through `@hbc/health-indicator` telemetry channels:

- time-to-readiness
- blocker-resolution latency
- percent reaching Ready to Bid
- submission error-rate reduction
- checklist CES

KPI emission events are role-aware and complexity-aware for canvas and governance dashboards.

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- bidReadinessProfile
pnpm --filter @hbc/features-estimating test -- bidReadinessConfig
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF18-T03 completed: 2026-03-12
- Replaced T03 scope stubs with deterministic model/config implementation:
  - `src/bid-readiness/profiles/estimatingBidReadinessProfile.ts`
  - `src/bid-readiness/profiles/readinessConfigResolver.ts`
  - `src/bid-readiness/profiles/readinessScoring.ts`
  - `src/bid-readiness/adapters/index.ts`
  - `src/bid-readiness/telemetry/index.ts`
- Implemented baseline six-criterion estimating profile and threshold bands aligned to SF18 score model.
- Implemented config resolution merge order (baseline -> admin override -> validation) with:
  - non-negative deterministic weight normalization
  - threshold ordering enforcement (`ready > nearly-ready > attention-needed`)
  - blocker-presence validation
  - duplicate criterion override detection
  - deterministic fallback to baseline profile on invalid/partial config states.
- Implemented pure scoring/summary composition:
  - weighted score computation
  - status and scoring-band classification
  - category breakdown composition
  - completeness summary
  - recommendation/action derivation for blocker and non-blocker gaps.
- Implemented version/governance-aware config outputs and typed telemetry KPI projection helpers for the five locked metrics.
- Updated barrels/exports for clean T03 model/config public surface from `src/bid-readiness/index.ts`.
- Replaced T03 testing fixture stubs with typed deterministic factories in `testing/`.
- Added T03 tests:
  - `src/bid-readiness/profiles/bidReadinessProfile.test.ts`
  - `src/bid-readiness/profiles/bidReadinessConfig.test.ts`
- Verification (zero errors):
  - `pnpm --filter @hbc/features-estimating test -- bidReadinessProfile` ✓
  - `pnpm --filter @hbc/features-estimating test -- bidReadinessConfig` ✓
  - `pnpm --filter @hbc/features-estimating check-types` ✓
  - `pnpm --filter @hbc/features-estimating build` ✓
- T03 success criteria complete. Work stopped before T04 per phase instruction.
-->
