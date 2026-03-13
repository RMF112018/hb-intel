# SF23-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF23-T07 integration task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Document boundary-safe integration contracts across `@hbc/record-form`, module adapters, and required Tier-1 primitives with explicit trust, provenance, recovery, and workflow-intelligence obligations.

---

## Integration Contracts

- `@hbc/record-form`
  - canonical lifecycle runtime, sync, explanation, next-step, AI-action, BIC-step, and telemetry contracts
- `@hbc/bic-next-move`
  - review/approval and handoff ownership, blockers-first sequencing, avatar projection, downstream owner visibility
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control without lifecycle contradiction
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety, and comparison basis for restored drafts
- `@hbc/project-canvas`
  - My Work placement for review and handoff ownership steps plus trust-aware downstream visibility
- `@hbc/related-items`
  - deep-links from validation issues, review tasks, submitted records, and conflict-resolution context
- `@hbc/notification-intelligence`
  - review required, approval decision, handoff routing, and degraded/retry attention routing notifications
- `@hbc/strategic-intelligence`
  - optional intelligence contribution routing for approved record insights
- `@hbc/score-benchmark`
  - benchmark-impact metadata linkage where records influence score contexts
- `@hbc/health-indicator`
  - KPI interpretation semantics and status-band consistency
- `@hbc/post-bid-autopsy`
  - shared authoring runtime reuse for autopsy section submissions
- `@hbc/step-wizard`
  - multi-step orchestration where module forms require staged completion; wizard composition must not fork lifecycle truth
- `@hbc/session-state`
  - draft continuity, reconnect state handoff, local queue persistence, and replay-safe operation boundaries
- `@hbc/ui-kit`
  - field primitives, layout, interaction patterns, and any reusable visual review/recovery surfaces

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle, trust, or telemetry engines
- review-step ownership and reassignment truth remains primitive-derived
- pending/unapproved outputs are excluded from downstream indexed/reporting surfaces
- My Work and Canvas projections must reflect the same review/handoff truth as the form runtime
- reusable visual primitives added during implementation must land in `@hbc/ui-kit`, not `@hbc/record-form`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/record-form test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/record-form/src
```
