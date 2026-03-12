# SF21-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-07 through D-13  
**Estimated Effort:** 0.8 sprint-weeks  
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF21-T07 integration task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Document boundary-safe integration patterns for pulse data, confidence/compound escalation, recommendation reason provenance, governance audit trails, triage workflows, and telemetry emissions.

---

## Integration Contracts

- `@hbc/bic-next-move`
  - office health signals and top recommended action inputs/ownership
- `@hbc/notification-intelligence`
  - escalation signals for at-risk/critical and compound-risk conditions
  - confidence-degradation and triage-priority notifications where configured
- `@hbc/auth`
  - inline edit permission gates and governance approval visibility
- `@hbc/complexity`
  - controls compact/detail/diagnostic disclosure depth
- `@hbc/project-canvas`
  - pulse tile consumption and project drill-in context
- `@hbc/versioned-record`
  - manual override provenance, action reason traceability, and policy change audit lineage
- Procore-stub/manual-entry path
  - freshness and manual-entry persistence integration

---

## Boundary Rules

- no app-route imports into package runtime
- compute engine remains pure and deterministic
- recommendation and triage ranking are deterministic projections; side effects remain in integration consumers
- telemetry emission must preserve reason-code and confidence context without coupling to UI-only state

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- integrations
rg -n "from 'apps/" packages/features/project-hub/src
```
