# SF24-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF24-T07 integration task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Document boundary-safe integration contracts across `@hbc/export-runtime`, module adapters, and required Tier-1 primitives.

---

## Integration Contracts

- `@hbc/export-runtime`
  - canonical export lifecycle, rendering/composition, sync, AI-action, BIC-step, and telemetry contracts
- `@hbc/bic-next-move`
  - review/approval and post-export handoff ownership, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety
- `@hbc/project-canvas`
  - My Work placement for export review and handoff ownership steps
- `@hbc/related-items`
  - deep-links from receipt rows, artifacts, and follow-up actions
- `@hbc/notification-intelligence`
  - approval required, export completion/failure, and handoff routing notifications
- `@hbc/strategic-intelligence`
  - optional routing of approved artifact insights to intelligence records
- `@hbc/score-benchmark`
  - benchmark-context export linkage and artifact trace stamps
- `@hbc/health-indicator`
  - KPI interpretation semantics and status-band consistency
- `@hbc/post-bid-autopsy`
  - autopsy report artifact generation reuse boundary
- `@hbc/record-form`
  - shared review/approval handoff and receipt traceability interoperability

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle/renderer/telemetry engines
- pending/unapproved outputs are excluded from downstream indexed/reporting surfaces

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/export-runtime test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/export-runtime/src
```

