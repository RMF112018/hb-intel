# Phase 5 Development Plan – Authentication & Shell Foundation Task 4

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.4 Role Mapping and Authorization Governance

1. Implement an HB Intel role-mapping layer that converts provider/context identity into app roles.

2. Role mapping must not rely on raw provider group semantics directly in feature code.

3. Define a standard action permission vocabulary for Phase 5, such as:
   - `view`
   - `create`
   - `edit`
   - `approve`
   - `admin`

4. Feature permissions in Phase 5 must use:
   - feature-level access
   - standard action-level grants
   - documented future seam for deeper custom feature-specific grammars

5. Default-deny must apply to all new protected features until explicit role mappings exist.

6. Restricted feature visibility rules must support:
   - hidden by default
   - selectively locked/discoverable presentation for strategic capabilities

7. Direct access to unauthorized pages must render a structured access-denied experience with:
   - plain-language explanation
   - safe navigation options
   - optional request-access entry point

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

## 5.4 Success Criteria Checklist (Task 4)

- [x] 5.4.1 HB Intel role-mapping layer implemented in `@hbc/auth` to convert provider/context identity into app roles.
- [x] 5.4.2 role mapping isolated from feature code so raw provider semantics are no longer required in guarded feature flows.
- [x] 5.4.3 standard action permission vocabulary implemented (`view`, `create`, `edit`, `approve`, `admin`).
- [x] 5.4.4 feature-level + action-level permission registration/evaluation implemented with documented future grammar seam.
- [x] 5.4.5 default-deny enforcement implemented for unregistered protected feature access checks.
- [x] 5.4.6 restricted visibility behavior implemented for hidden-by-default and discoverable-locked features.
- [x] 5.4.7 structured access-denied surface implemented with plain-language explanation, safe navigation actions, and optional request-access entry point.
- [x] ADR-0057 created and linked to Phase 5.4 governance traceability.

## Phase 5.4 Progress Notes

- 5.4.1 completed - centralized role-mapping layer added (`packages/auth/src/roleMapping.ts`) and session normalization now resolves mapped app roles - 2026-03-06.
- 5.4.2 completed - authorization contracts expanded for standard action vocabulary, feature registration, default-deny evaluation, and visibility-lock semantics - 2026-03-06.
- 5.4.3 completed - guard layer updated (`RoleGate`, `PermissionGate`, `FeatureGate`) and structured `AccessDenied` experience added with optional request-access callback - 2026-03-06.
- 5.4.4 completed - unit tests added for role mapping, default-deny/visibility evaluation, and access-denied request CTA model behavior - 2026-03-06.
- 5.4.5 completed - ADR-0057 authored and Phase 5 governance/planning docs updated for traceability closure - 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth` - PASS
- `pnpm turbo run lint --filter=@hbc/auth` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth` - PASS
- `pnpm exec vitest run packages/auth/src/roleMapping.test.ts packages/auth/src/stores/permissionResolution.test.ts packages/auth/src/guards/AccessDenied.test.ts` - BLOCKED (workspace Vitest project setup cannot resolve package-local `vite` in generated temp config; no code-level test failures reported).
