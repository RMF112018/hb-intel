# Phase 5 Development Plan – Authentication & Shell Foundation Task 8

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.8 Guards, Hooks, Redirects, and Recovery Surfaces

1. Build central guards for:
   - authenticated access
   - role access
   - permission access
   - runtime/environment requirements where applicable

2. Guards must execute before protected content renders.

3. Provide shared hooks for:
   - current user/session
   - resolved runtime mode
   - permission evaluation
   - shell-status state
   - degraded mode visibility rules

4. Redirect handling must:
   - capture intended destination
   - return there when safe
   - fall back to role landing page when not safe

5. Build dedicated shell surfaces for:
   - loading/bootstrap
   - session restore
   - access denied
   - expired session / reauthentication
   - unsupported environment
   - fatal startup failure

6. Request-access flow in Phase 5 must allow simple in-app submission into the admin review queue.

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

## 5.8 Success Criteria Checklist (Task 8)

- [x] 5.8.1 centralized guards implemented for authenticated, role, permission, and runtime/environment checks.
- [x] 5.8.2 centralized guard resolution executes before protected content renders.
- [x] 5.8.3 shared hooks implemented for session/runtime/permission, shell-status state, and degraded visibility rules.
- [x] 5.8.4 redirect handling implemented for intended destination capture, safe restore, and role-landing fallback.
- [x] 5.8.5 dedicated recovery surfaces implemented for bootstrap, restore, access denied, reauth, unsupported runtime, and fatal startup failure.
- [x] 5.8.6 simple request-access submission seam implemented for admin review queue integration.
- [x] ADR-0061 created and linked to Phase 5.8 traceability.

## Phase 5.8 Progress Notes

- 5.8.1 completed — central guard resolution contract implemented (`resolveGuardResolution`) and pre-render guard component added (`ProtectedContentGuard`) with deterministic runtime/auth/role/permission execution order — 2026-03-06.
- 5.8.2 completed — shared hooks expanded for current session, resolved runtime mode, and centralized permission evaluation in `@hbc/auth`; shell hooks added for shell-status state and degraded visibility rules in `@hbc/shell` — 2026-03-06.
- 5.8.3 completed — redirect utilities extended with intended-destination capture and post-guard restore/fallback policy (`captureIntendedDestination`, `resolvePostGuardRedirect`) aligned with safe restoration rules — 2026-03-06.
- 5.8.4 completed — dedicated recovery surfaces implemented for loading/bootstrap, session restore, expired session/reauth, unsupported runtime, and fatal startup failure — 2026-03-06.
- 5.8.5 completed — request-access flow extended with typed admin review queue submission seam in `AccessDenied` and request-access contracts; ADR-0061 and documentation traceability updates completed — 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm exec vitest run packages/auth/src/guards/guardResolution.test.ts packages/auth/src/guards/AccessDenied.test.ts packages/shell/src/redirectMemory.test.ts` - BLOCKED (known workspace Vitest project setup cannot resolve package-local `vite` in generated temp config).
