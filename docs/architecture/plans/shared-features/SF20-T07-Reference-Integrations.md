# SF20-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF20-T07 integration task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Document boundary-safe integration contracts across SF20 adapter surfaces, `@hbc/strategic-intelligence`, and required Tier-1 primitives.

---

## Integration Contracts

- `@hbc/strategic-intelligence`
  - canonical heritage/intelligence model, lifecycle APIs, sync-state contracts, and telemetry output
- `@hbc/bic-next-move`
  - per-entry strategic gap ownership, blockers-first sequencing, avatar projection
- `@hbc/complexity`
  - Essential/Standard/Expert behavior control across panel/feed/form/queue
- `@hbc/versioned-record`
  - immutable provenance, audit history, snapshot freezing, offline replay
- `@hbc/related-items`
  - direct deep-links from intelligence entries and strategic gaps
- `@hbc/project-canvas`
  - automatic My Work placement for assigned strategic gaps
- `@hbc/notification-intelligence`
  - pending-approval immediate alerts and decision routing notifications
- `@hbc/health-indicator`
  - shared threshold/status semantics for operations-grade KPI interpretation
- `@hbc/score-benchmark`
  - bidirectional context interop for SF19/SF22 intelligence enrichment flows
- SF22 post-bid learning loop
  - approved win/loss factors enrich downstream intelligence datasets

---

## Boundary Rules

- no app-route imports into package runtime
- approval authority resolved through admin policy APIs only
- pending/rejected entries never emitted to search index
- SF20-SF19 interop occurs through public primitive interfaces (`@hbc/strategic-intelligence`, `@hbc/score-benchmark`)

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- integrations
pnpm --filter @hbc/strategic-intelligence test -- integrations
rg -n "from 'apps/" packages/features/business-development/src packages/strategic-intelligence/src packages/score-benchmark/src
```
