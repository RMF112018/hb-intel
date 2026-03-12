# SF25-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF25-T07 integration task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Document boundary-safe integration contracts across `@hbc/publish-workflow`, module adapters, and required Tier-1 primitives.

---

## Integration Contracts

- `@hbc/publish-workflow`
  - canonical publish lifecycle, readiness/approval/supersession/revocation engines, sync, AI-action, BIC-step, and telemetry contracts
- `@hbc/bic-next-move`
  - publish-step ownership, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - full panel visibility policy across all modes (locked Decision 2)
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety
- `@hbc/project-canvas`
  - My Work placement for publish readiness/approval/supersession/revocation ownership steps
- `@hbc/related-items`
  - deep-links from receipts, supersession chains, and governance actions
- `@hbc/notification-intelligence`
  - issue notifications, escalations, approval routing, and revocation alerts
- `@hbc/strategic-intelligence`
  - optional routing of approved published insights to intelligence records
- `@hbc/score-benchmark`
  - benchmark-related publication traceability and artifact lineage links
- `@hbc/health-indicator`
  - KPI interpretation semantics and status-band consistency
- `@hbc/post-bid-autopsy`
  - governed issue publication for autopsy outputs and learning packets
- `@hbc/record-form`
  - shared approval/acknowledgment semantics and handoff interoperability
- `@hbc/export-runtime`
  - artifact generation boundary before publication governance

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle/readiness/telemetry engines
- pending/unapproved outputs are excluded from downstream indexed/reporting surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/publish-workflow test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/publish-workflow/src
```

