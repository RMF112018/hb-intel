# Phase 5 Development Plan – Authentication & Shell Foundation Task 3

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.3 Central Auth / Session / Permission State

1. Use one central Zustand store for auth/session truth.

2. The auth store must own:
   - current auth lifecycle phase
   - normalized HB Intel session
   - runtime mode
   - restore state
   - sign-in / sign-out / reauth actions
   - structured error state
   - shell bootstrap readiness flags required by guards and shell

3. Use typed selectors and shallow subscription patterns to prevent broad rerender cascades.

4. Keep auth actions atomic and side-effect boundaries explicit.

5. Create a permission resolution layer adjacent to auth, but keep provider identity resolution separate from app authorization resolution.

6. Permission evaluation must combine:
   - base role grants
   - default feature-action grants
   - explicit per-user overrides
   - temporary / expiring override state
   - emergency access state where applicable

7. Never allow feature modules to compute their own authorization truth outside the shared permission APIs.

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

## 5.3 Success Criteria Checklist (Task 3)

- [x] 5.3.1 central Zustand auth/session truth store implemented.
- [x] 5.3.2 auth store now owns lifecycle phase, normalized session, runtime mode, restore state, sign-in/sign-out/reauth actions, structured error, and shell bootstrap readiness flags.
- [x] 5.3.3 typed selectors with shallow subscription patterns implemented.
- [x] 5.3.4 auth actions implemented as atomic actions with explicit side-effect boundaries.
- [x] 5.3.5 permission resolution layer implemented adjacent to auth with provider identity resolution kept separate.
- [x] 5.3.6 permission evaluation now combines base grants, default grants, explicit overrides, expiring overrides, and emergency access state.
- [x] 5.3.7 shared permission APIs exported as centralized authorization truth entry points.
- [x] ADR-0056 created and linked to Phase 5.3 traceability.

## Phase 5.3 Progress Notes

- 5.3.1 completed - central auth/session store redesigned with lifecycle, restore, structured error, and shell bootstrap readiness ownership - 2026-03-06.
- 5.3.2 completed - typed shallow selector contracts and selector hooks implemented for lifecycle/bootstrap/session/permission slices - 2026-03-06.
- 5.3.3 completed - adjacent permission resolution layer implemented with deterministic multi-source permission combination logic - 2026-03-06.
- 5.3.4 completed - shared authorization APIs exported via auth store and root barrels to prevent feature-level truth recomputation - 2026-03-06.
- 5.3.5 completed - ADR-0056 created and governance traceability updated in docs index/plans - 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth` - PASS
- `pnpm turbo run lint --filter=@hbc/auth` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth` - PASS
