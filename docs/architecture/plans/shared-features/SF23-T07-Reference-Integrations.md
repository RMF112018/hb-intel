# SF23-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF23-T07 integration task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Document boundary-safe integration contracts across `@hbc/record-form`, module adapters, and required Tier-1 primitives.

---

## Integration Contracts

- `@hbc/record-form`
  - canonical lifecycle runtime, sync, AI-action, BIC-step, and telemetry contracts
- `@hbc/bic-next-move`
  - review/approval and handoff ownership, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety
- `@hbc/project-canvas`
  - My Work placement for review and handoff ownership steps
- `@hbc/related-items`
  - deep-links from validation issues, review tasks, and submitted records
- `@hbc/notification-intelligence`
  - review required, approval decision, and handoff routing notifications
- `@hbc/strategic-intelligence`
  - optional intelligence contribution routing for approved record insights
- `@hbc/score-benchmark`
  - benchmark-impact metadata linkage where records influence score contexts
- `@hbc/health-indicator`
  - KPI interpretation semantics and status-band consistency
- `@hbc/post-bid-autopsy`
  - shared authoring runtime reuse for autopsy section submissions
- `@hbc/step-wizard`
  - multi-step orchestration where module forms require staged completion
- `@hbc/session-state`
  - draft continuity and reconnect state handoff
- `@hbc/ui-kit`
  - field primitives, layout, and interaction patterns

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle/telemetry engines
- pending/unapproved outputs are excluded from downstream indexed/reporting surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/record-form test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/record-form/src
```
