# SF22-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF22-T07 integration task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Document boundary-safe integration contracts across SF22 adapters, `@hbc/post-bid-autopsy`, and required Tier-1 primitives.

---

## Integration Contracts

- `@hbc/post-bid-autopsy`
  - canonical autopsy model, lifecycle, sync, and telemetry contracts
- `@hbc/bic-next-move`
  - per-section gap ownership, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety
- `@hbc/project-canvas`
  - My Work placement for assigned section gaps and overdue actions
- `@hbc/related-items`
  - deep-links from section findings and seeded outputs
- `@hbc/notification-intelligence`
  - immediate trigger/escalation notifications and decision routing
- `@hbc/strategic-intelligence`
  - approved findings seed intelligence contribution drafts
- `@hbc/score-benchmark`
  - autopsy outcomes and adjustments emit benchmark update signals
- `@hbc/health-indicator`
  - shared status/KPI interpretation semantics for dashboard consistency
- `@hbc/step-wizard`
  - sequential five-section interaction model

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle/telemetry engines
- pending/unapproved outputs are excluded from downstream indexed/intelligence surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/post-bid-autopsy test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/post-bid-autopsy/src
```
