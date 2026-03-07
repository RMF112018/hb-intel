# Phase 5 Development Plan – Authentication & Shell Foundation Task 16

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.16 Testing Strategy and Validation Matrix

1. Implement a formal dual-mode validation matrix.

2. Cover at minimum:
   - happy-path sign-in by mode
   - session restore by mode
   - redirect restoration
   - role landing behavior
   - direct unauthorized access
   - locked navigation presentation
   - request-access submission
   - override approval lifecycle
   - override expiration and renewal
   - role-change review flag behavior
   - emergency access path
   - degraded mode entry and exit
   - shell-status priority behavior
   - sign-out cleanup
   - unsupported/missing context handling
   - controlled dev/test mode override behavior

3. Include accessibility checks for shell navigation and status surfaces.

4. Include performance and rerender checks on store selectors and shell transitions.

5. Include automated boundary checks where practical to prevent feature bypass of shell/auth contracts.

## 5.16 Progress Notes

- 5.16.1 completed — formal dual-mode validation matrix tests implemented across auth/shell seams for required scenarios (sign-in/restore by mode, redirect restoration, role landing, unauthorized/locked navigation, request-access presentation, override lifecycle/renewal/review flags, emergency path, degraded mode, shell-status priority, sign-out cleanup, unsupported context, dev/test override behavior) — 2026-03-06.
- 5.16.2 completed — accessibility validation checks added for shell navigation/status surfaces (landmark/ARIA contract assertions and plain-language shell-status copy/action checks) — 2026-03-06.
- 5.16.3 completed — performance/rerender validation checks added for auth selector slice stability and shell transition readiness boundaries; automated boundary-enforcement checks added for protected-feature registration and SPFx bridge constraints — 2026-03-06.
- 5.16.4 completed — verification gates executed (build/lint/check-types + targeted matrix test run) and all new matrix suites passed with zero test failures — 2026-03-06.
- 5.16.5 completed — governance closure finalized (PH5.16 + PH5 progress/checklists, blueprint/foundation progress comments, ADR-0069, ADR index update) — 2026-03-06.

## 5.16 Completion Checklist

- [x] Formal dual-mode validation matrix implemented for all required Phase 5.16 scenario categories.
- [x] Accessibility checks included for shell navigation and status surfaces.
- [x] Performance/rerender checks implemented for store selectors and shell transitions.
- [x] Automated boundary checks implemented to reduce shell/auth contract bypass risk.
- [x] Documentation, checklist updates, and ADR deliverables completed with traceability to locked Option C decisions.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm exec vitest run --config /tmp/hb-intel-vitest.config.ts` - PASS (6 files, 20 tests, 0 failures)

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
