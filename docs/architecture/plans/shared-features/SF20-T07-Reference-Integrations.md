# SF20-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 0.95 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF20-T07 integration task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Document boundary-safe integration contracts across SF20 adapter surfaces, `@hbc/strategic-intelligence`, and required Tier-1 primitives, including acknowledgment and redacted projection governance.

---

## Integration Contracts

- `@hbc/strategic-intelligence`
  - canonical snapshot/living model, trust/sensitivity/conflict/suggestion workflows, sync-state contracts, and telemetry output
- `@hbc/bic-next-move`
  - per-entry strategic gap ownership, commitment accountability linkage, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control across panel/feed/form/queue/review surfaces
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, offline replay, and conflict-resolution event lineage
- `@hbc/related-items`
  - deep-links from intelligence entries and strategic gaps with redacted projection compatibility
- `@hbc/project-canvas`
  - automatic My Work placement for assigned strategic gaps, unresolved commitments, stale-review tasks, and conflict tasks
- `@hbc/notification-intelligence`
  - pending-approval alerts, review-due reminders, and conflict/escalation notifications
- `@hbc/acknowledgment`
  - participant handoff review acknowledgment workflow and audit state rendering
- `@hbc/health-indicator`
  - shared threshold/status semantics for operations-grade KPI interpretation
- `@hbc/score-benchmark`
  - bidirectional context interop for SF19/SF22 intelligence enrichment and reuse-quality feedback
- SF22 post-bid learning loop
  - approved win/loss factors enrich downstream intelligence datasets

---

## Boundary Rules

- no app-route imports into package runtime
- approval authority resolved through admin policy APIs only
- pending/rejected entries never emitted to search index
- redacted projections are policy-enforced in primitive layer, not adapter-specific business logic
- SF20-SF19 interop occurs through public primitive interfaces only

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/strategic-intelligence test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/strategic-intelligence/src packages/score-benchmark/src
```
