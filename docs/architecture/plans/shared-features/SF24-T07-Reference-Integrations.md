# SF24-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF24-T07 integration task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Document boundary-safe integration contracts across `@hbc/export-runtime`, module adapters, and required Tier-1 primitives with explicit truth-passing, provenance, recovery, and workflow-intelligence obligations.

---

## Integration Contracts

- `@hbc/export-runtime`
  - canonical export lifecycle, rendering/composition, sync, explanation, next-step, BIC-step, and telemetry contracts
- `@hbc/bic-next-move`
  - review/approval and post-export handoff ownership, blockers-first sequencing, avatar projection, downstream owner visibility
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control without artifact-truth contradiction
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, replay safety, and restored-receipt comparison basis
- `@hbc/project-canvas`
  - My Work placement for export review and handoff ownership steps plus trust-aware downstream visibility
- `@hbc/related-items`
  - deep-links from receipt rows, artifacts, follow-up actions, and comparison context
- `@hbc/session-state`
  - queued local request continuity, reconnect state handoff, and replay-safe operation boundaries
- `@hbc/notification-intelligence`
  - approval required, export completion/failure, degraded receipt, and handoff routing notifications
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
- `@hbc/ui-kit`
  - reusable action-menu, picker, progress, receipt, and messaging primitives

---

## Module Consumer Obligations

Consuming modules must explicitly pass:

- filter truth
- sort truth
- visible column truth
- selected-row truth
- record version truth
- export intent classification
- composition warnings for partial or missing sections

The primitive owns how that truth is stamped and surfaced; modules own supplying accurate source truth.

---

## Boundary Rules

- public interfaces only; no route-layer imports
- adapters do not re-implement primitive lifecycle, renderer, trust, or telemetry engines
- review-step ownership and reassignment truth remains primitive-derived
- pending/unapproved outputs are excluded from downstream indexed/reporting surfaces
- export runtime remains distinct from future publish/distribute workflow; export generation does not imply publication
- reusable visual primitives added during implementation must land in `@hbc/ui-kit`, not `@hbc/export-runtime`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/features-estimating test -- integrations
pnpm --filter @hbc/export-runtime test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/features/estimating/src packages/export-runtime/src
```
