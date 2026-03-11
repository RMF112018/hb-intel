# SF21-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`
**Decisions Applied:** D-07 through D-09
**Estimated Effort:** 0.65 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF21-T07 integration task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Document boundary-safe integration patterns for pulse data, recommended actions, and role-based surfaces.

---

## Integration Contracts

- `@hbc/bic-next-move`
  - office health and top recommended action inputs
- `@hbc/notification-intelligence`
  - urgency/escalation signals for immediate action conditions
- `@hbc/auth`
  - write permissions for inline edit; admin access for settings panel
- `@hbc/complexity`
  - controls compact/detail/diagnostic depth
- `@hbc/project-canvas`
  - pulse tile consumption for role-based canvases
- Procore-stub/manual-entry path
  - metric freshness and manual entry persistence integration

---

## Boundary Rules

- no app-route imports into package runtime
- pulse compute engine remains pure and deterministic
- recommendations consume BIC/notification APIs; no direct side effects in calculators

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- integrations
rg -n "from 'apps/" packages/features/project-hub/src
```
