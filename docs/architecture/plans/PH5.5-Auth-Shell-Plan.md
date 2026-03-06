# Phase 5 Development Plan – Authentication & Shell Foundation Task 5

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.5 Shell Composition and Core Layout Architecture

1. Implement one shared HB Intel shell core.

2. Environment-specific shell adapters may extend behavior only through approved extension points.

3. The shell must remain narrowly scoped to:
   - bootstrap/init framing
   - auth-aware layout composition
   - navigation frame
   - shell-status presentation
   - route enforcement orchestration
   - degraded/recovery/access-denied experience
   - project/workspace context persistence where required by the broader shell plan

4. Keep feature/business logic out of the shell unless explicitly approved as a platform concern.

5. Define shell modes as needed, but all must respect centralized rule enforcement.

6. The shell must support role-appropriate landing behavior and safe redirect restoration.

7. Sign-out must perform:
   - auth/session clearing
   - redirect memory clearing
   - shell bootstrap state clearing
   - environment artifact clearing
   - feature cache cleanup according to documented retention tiers

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

## 5.5 Success Criteria Checklist (Task 5)

- [x] 5.5.1 one shared HB Intel shell core implemented (`ShellCore`) with centralized orchestration boundaries.
- [x] 5.5.2 environment-specific behavior constrained to approved extension points via shell adapter contracts.
- [x] 5.5.3 shell scope constrained to bootstrap framing, auth-aware composition, navigation frame, status slot, route enforcement, degraded/recovery/access-denied, and workspace persistence coordination.
- [x] 5.5.4 shell mode rules centralized with explicit runtime capabilities and guardrails against feature/business-logic leakage.
- [x] 5.5.5 role-appropriate landing + safe redirect restore policy implemented with mode-aware safety checks.
- [x] 5.5.6 full sign-out cleanup orchestration implemented for auth/session, redirect memory, shell bootstrap state, environment artifacts, and retention-tier cache cleanup.
- [x] ADR-0058 created and linked to Phase 5.5 traceability.

## Phase 5.5 Progress Notes

- 5.5.1 completed — shared shell core orchestration implemented (`packages/shell/src/ShellCore.tsx`) with centralized experience selection and auth-aware layout composition — 2026-03-06.
- 5.5.2 completed — shell adapter extension contracts + centralized shell mode rules implemented (`types.ts`, `shellModeRules.ts`) with explicit Option C boundaries — 2026-03-06.
- 5.5.3 completed — `ShellLayout` refactored to presentational-only composition and shell-core state store introduced for bootstrap/experience coordination — 2026-03-06.
- 5.5.4 completed — role landing + safe redirect restoration utilities implemented (`redirectMemory.ts`) and wired into shell core flow — 2026-03-06.
- 5.5.5 completed — full sign-out cleanup orchestration implemented (`signOutCleanup.ts`) with deterministic cleanup ordering and retention-tier cache hooks — 2026-03-06.
- 5.5.6 completed — unit tests added for shell mode rules, redirect restoration safety, sign-out cleanup ordering, and shell experience-state resolution — 2026-03-06.
- 5.5.7 completed — ADR-0058 authored and governance traceability updates applied across PH5.5/PH5/Blueprint/Foundation plans — 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/shell` - PASS
