# Phase 5 Development Plan – Authentication & Shell Foundation Task 10

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.10 Access-Control Backend and Data Model

1. Store roles, grants, overrides, approvals, expiration metadata, review flags, and audit records in an HB Intel-owned data layer.

2. Keep Microsoft/SharePoint identity as input, not the app authorization system of record.

3. Model override records to support:
   - target user
   - base role reference
   - requested grant or restriction
   - reason
   - requester
   - approver
   - approval timestamp
   - expiration
   - renewal state
   - emergency flag
   - review-required flag
   - active/revoked/archive status

4. When base role definitions change, mark dependent overrides for review rather than silently rebasing or silently ignoring drift.

5. Use a central typed configuration layer for shell/auth runtime rules, redirect defaults, session windows, and policy settings.

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

## Phase 5.10 Progress Notes

- 5.10.1 completed — HB Intel-owned access-control backend model implemented (`accessControlModel.ts`) for roles, grants, approvals, expiration metadata, review flags, and typed audit events while preserving Microsoft/SharePoint identity as input-only context — 2026-03-06.
- 5.10.2 completed — explicit override record model implemented (`overrideRecord.ts`) with full governance fields (target user, base role reference, requested grant/restriction, reason, requester, approver, approval timestamp, expiration, renewal, emergency/review flags, active/revoked/archived) — 2026-03-06.
- 5.10.3 completed — deterministic dependent-override drift review flagging implemented (`markDependentOverridesForRoleReview`) so base-role version changes mark overrides for review instead of silent rebasing/ignoring — 2026-03-06.
- 5.10.4 completed — central typed auth/shell runtime configuration layer implemented (`configurationLayer.ts`) for runtime rules, redirect defaults, session windows, and policy settings with default-deny invariant validation — 2026-03-06.
- 5.10.5 completed — package typing/exports, governance traceability updates, and ADR-0063 documentation closure completed for Phase 5.10 — 2026-03-06.

## Phase 5.10 Completion Checklist

- [x] §5.10 item 1 complete — HB Intel-owned data layer contracts cover roles, grants, overrides, approvals, expiration metadata, review flags, and audit records.
- [x] §5.10 item 2 complete — Microsoft/SharePoint identity retained as input only, not system-of-record authorization truth.
- [x] §5.10 item 3 complete — override record model includes all required governance fields and lifecycle statuses.
- [x] §5.10 item 4 complete — base-role definition changes now flag dependent overrides for mandatory review.
- [x] §5.10 item 5 complete — central typed configuration layer covers runtime rules, redirect defaults, session windows, and policy settings.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth` - PASS
- `pnpm turbo run lint --filter=@hbc/auth` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth` - PASS
- `pnpm --filter @hbc/auth exec vitest run packages/auth/src/backend/accessControlModel.test.ts packages/auth/src/backend/overrideRecord.test.ts packages/auth/src/backend/configurationLayer.test.ts` - BLOCKED (workspace Vitest startup cannot resolve package-local `vite` in generated temp config).
