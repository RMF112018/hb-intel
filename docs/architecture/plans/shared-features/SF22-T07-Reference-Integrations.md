# SF22-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-01 through L-14
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF22-T07 integration task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Document boundary-safe integration contracts across SF22 adapters, `@hbc/post-bid-autopsy`, and required Tier-1 primitives, including explicit data-exchange and publish-subscribe assumptions.

---

## Integration Contracts

- `@hbc/post-bid-autopsy`
  - canonical autopsy model, lifecycle, confidence, governance, sync, and telemetry contracts
- `@hbc/bic-next-move`
  - per-section gap ownership and action triage projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety
- `@hbc/project-canvas`
  - My Work placement for assigned section gaps, disagreement escalation, and stale revalidation tasks
- `@hbc/related-items`
  - deep-links and similar-pursuit references from findings and seeded outputs
- `@hbc/notification-intelligence`
  - trigger/escalation notifications plus publication/revalidation reminders
- `@hbc/strategic-intelligence`
  - approved findings seed draft entries with sensitivity-aware visibility
- `@hbc/score-benchmark`
  - approved/published autopsy outputs emit benchmark update signals
- `@hbc/health-indicator`
  - shared KPI semantics for dashboard consistency
- `@hbc/step-wizard`
  - sequential five-section interaction model

---

## Publish-Subscribe Assumptions

- publishable autopsy events include minimum payload: ids, status, confidence, evidence coverage, sensitivity policy, reason codes
- downstream consumers subscribe only to approved/published streams
- redacted payload variants are emitted for restricted visibility contexts
- adapters subscribe/project only; primitive owns publication gate enforcement

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle/governance/telemetry engines
- pending/unapproved/unpublishable outputs are excluded from downstream indexed surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/post-bid-autopsy test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/post-bid-autopsy/src
```
