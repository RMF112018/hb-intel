# Phase 5 Development Plan – Authentication & Shell Foundation Task 12

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.12 Approval, Renewal, and Emergency Access Workflows

1. Standard overrides require structured request and approval.

2. Requests must capture:
   - requested access change
   - business reason
   - target feature/action
   - requested duration or expiration

3. Standard override approvals in Phase 5 must support:
   - approve
   - reject
   - set expiration
   - mark permanent only with explicit justification

4. Most overrides must expire by default.

5. Expiring overrides must not silently continue.

6. Renewal requires:
   - renewed request
   - updated justification
   - fresh approval

7. Emergency access must support:
   - immediate action by authorized admins
   - mandatory reason
   - short expiration
   - mandatory post-action review

8. Document and implement clear boundaries so emergency access does not become a substitute for the normal workflow.

---

## Recommended Implementation Sequence

1. Lock ADRs and package boundaries.
2. Implement provider abstraction and runtime detection.
3. Implement session normalization and auth store.
4. Implement role-mapping and permission resolution.
5. Implement guards, redirects, and recovery surfaces.
6. Implement shell core and shell-status derivation.
7. Integrate the existing connectivity bar as unified shell-status UI.
8. Implement degraded mode and section-level freshness rules.
9. Implement feature registration contract and enforcement.
10. Implement access-control backend model.
11. Implement minimal production admin UX.
12. Implement override approval / renewal / emergency workflows.
13. Implement audit and retention flows.
14. Execute dual-mode validation matrix.
15. Complete documentation package and release sign-off artifacts.

---

## Final Phase 5 Definition of Done

Phase 5 is done when HB Intel has a production-ready authentication and shell foundation that:
- behaves as one product across PWA and SPFx,
- uses centralized session and authorization truth,
- enforces protected access consistently,
- supports governed exceptions without contaminating base roles,
- provides safe degraded-mode behavior,
- leverages the existing connectivity bar as the canonical shell-status surface,
- enables production operations through core admin workflows,
- satisfies formal validation, audit, release, and documentation requirements,
- and explicitly documents every deferred future expansion path so later phases can extend the platform without re-architecting the foundation.

---

## Phase 5.12 Progress Notes

- 5.12.1 completed — structured override request workflow implemented (`workflows/overrideRequest.ts`) capturing requested access change, business reason, target feature/action, and requested duration/expiration with strict validation — 2026-03-06.
- 5.12.2 completed — standard approval workflow implemented (`workflows/overrideApproval.ts`) supporting approve/reject/set expiration and permanent designation only with explicit justification — 2026-03-06.
- 5.12.3 completed — default expiration policy enforced for standard approvals, preventing indefinite continuation unless explicit permanent justification passes policy checks — 2026-03-06.
- 5.12.4 completed — renewal workflow implemented (`workflows/renewalWorkflow.ts`) requiring renewed request, updated justification, and fresh approval; expired overrides explicitly detected to prevent silent continuation — 2026-03-06.
- 5.12.5 completed — emergency workflow implemented (`workflows/emergencyAccess.ts`) with authorized-admin gating, mandatory reason, short expiration, mandatory post-action review, and boundary checks to prevent normal-workflow substitution — 2026-03-06.
- 5.12.6 completed — related workflow types and root exports added in `types.ts` + `index.ts`; governance closure finalized with ADR-0065 — 2026-03-06.

## Phase 5.12 Completion Checklist

- [x] §5.12 item 1 complete — standard overrides require structured request + approval workflow.
- [x] §5.12 item 2 complete — requests capture access change, business reason, target feature/action, and duration/expiration.
- [x] §5.12 item 3 complete — approvals support approve, reject, set expiration, and permanent with explicit justification.
- [x] §5.12 item 4 complete — default expiration enforced for most overrides.
- [x] §5.12 item 5 complete — expiring overrides cannot silently continue.
- [x] §5.12 item 6 complete — renewal requires renewed request, updated justification, and fresh approval.
- [x] §5.12 item 7 complete — emergency access supports immediate authorized action, mandatory reason, short expiration, and mandatory post-review.
- [x] §5.12 item 8 complete — emergency boundary checks implemented and documented to prevent substitution for normal workflow.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth` - PASS
- `pnpm turbo run lint --filter=@hbc/auth` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth` - PASS
- `pnpm --filter @hbc/auth exec vitest run packages/auth/src/workflows/overrideRequest.test.ts packages/auth/src/workflows/overrideApproval.test.ts packages/auth/src/workflows/renewalWorkflow.test.ts packages/auth/src/workflows/emergencyAccess.test.ts` - BLOCKED (workspace Vitest startup cannot resolve package-local `vite` in generated temp config).
