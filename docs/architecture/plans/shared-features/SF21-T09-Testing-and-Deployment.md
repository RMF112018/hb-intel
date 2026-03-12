# SF21-T09 - Testing and Deployment: Project Health Pulse

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** All D-01 through D-14  
**Estimated Effort:** 0.8 sprint-weeks  
**Depends On:** T01-T08

> **Doc Classification:** Canonical Normative Plan - SF21-T09 testing/deployment task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Finalize SF21 with full closure gates for confidence-aware health, compound-risk escalation, explainability quality, governance controls, triage workflows, suppression behavior, and decision-quality telemetry.

---

## 3-Line Plan

1. Complete compute/data-quality/confidence/compound/explainability/triage validations at >=95% coverage.
2. Pass mechanical enforcement and architecture/integration boundaries.
3. Publish ADR-0110 updates and verify closure documentation/index/state-map consistency.

---

## Pre-Deployment Checklist

### Architecture & Boundary Verification
- [ ] pulse feature remains within `@hbc/features-project-hub`
- [ ] no app-route imports in package runtime
- [ ] compute engine remains deterministic and side-effect free
- [ ] stale/missing exclusion and confidence degradation model enforced
- [ ] compound-risk rules and escalation model enforced

### Type Safety
- [ ] zero TypeScript errors
- [ ] pulse/confidence/compound/explainability contracts stable
- [ ] recommendation reason-code schema stable
- [ ] governance/suppression/triage config contracts stable
- [ ] telemetry schema stable

### Build & Package
- [ ] package build succeeds
- [ ] runtime/testing entrypoints emitted
- [ ] testing sub-path excluded from production bundle

### Tests
- [ ] all tests pass
- [ ] coverage thresholds met (>=95)
- [ ] confidence and compound-risk tests complete
- [ ] explainability and reason-code tests complete
- [ ] governance and suppression tests complete
- [ ] triage mode behavior tests complete
- [ ] end-to-end stale-edit-to-triage-update scenario passing

### Storage/API (Pulse Metrics + Admin Config + Manual Entries)
- [ ] metric persistence and freshness metadata validated
- [ ] admin config singleton schema validated
- [ ] manual-entry save path + governance metadata validated
- [ ] override approval visibility and aging behavior validated
- [ ] confidence/compound/top-action reason persistence validated

### Integration
- [ ] BIC-driven office dimension and recommendation integration validated
- [ ] notification-intelligence escalation and suppression behavior validated
- [ ] auth role/permission/approval gates validated
- [ ] complexity and project-canvas integration behavior validated
- [ ] versioned-record provenance/audit path validated

### Telemetry
- [ ] intervention lead time metric validated
- [ ] false alarm and pre-lag detection metrics validated
- [ ] action adoption and review cycle metrics validated
- [ ] suppression impact telemetry validated

### Documentation
- [ ] `ADR-0110` reflects confidence/compound/triage/governance model
- [ ] adoption guide/API reference/README updated for new model
- [ ] `docs/README.md` and `current-state-map.md` linkage verified

---

## Final Verification Commands

```bash
pnpm turbo run build --filter @hbc/features-project-hub...
pnpm turbo run lint --filter @hbc/features-project-hub...
pnpm --filter @hbc/features-project-hub check-types
pnpm --filter @hbc/features-project-hub test --coverage
rg -n "from 'apps/" packages/features/project-hub/src
```
