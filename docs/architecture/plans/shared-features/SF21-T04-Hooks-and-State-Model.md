# SF21-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-05 through D-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF21-T04 hooks task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define state orchestration for pulse computation, config retrieval/mutation, and recommended-action refresh.

---

## `useProjectHealthPulse`

Responsibilities:

- assemble four dimensions + composite pulse
- enforce stale exclusion/re-normalization behavior
- attach top recommended action metadata
- expose loading/error/refresh and compute timestamp

Cache key:

- `['project-health-pulse', projectId]`

---

## `useHealthPulseAdminConfig`

Responsibilities:

- load active admin config singleton
- validate and persist weight/threshold updates
- trigger pulse recalculation invalidation on config change

Cache key:

- `['project-health-pulse', 'admin-config']`

---

## State Guarantees

- stable return shape across loading/success/error
- config mutation invalidates all visible pulse queries
- stale-exclusion effects reflected immediately after edits

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- hooks
pnpm --filter @hbc/features-project-hub check-types
```
