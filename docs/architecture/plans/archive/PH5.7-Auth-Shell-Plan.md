# Phase 5 Development Plan – Authentication & Shell Foundation Task 7

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.7 Controlled Degraded Mode

1. Degraded mode is allowed only for recently authenticated users with sufficient last-known trusted state.

2. Degraded mode must not allow fresh sensitive actions or any operation that depends on current authorization confirmation.

3. In degraded mode, preserve:
   - the core shell frame
   - user/session identity context where safe
   - selected safe cached navigation
   - visibly restricted zones

4. Block or disable:
   - sensitive write actions
   - approval actions
   - permission-changing actions
   - data requiring current backend validation

5. Every visible cached section must communicate freshness/validation status.

6. Recovery back to fully connected mode must be explicit, observable in shell-status messaging, and safe.

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

## 5.7 Success Criteria Checklist (Task 7)

- [x] 5.7.1 degraded mode eligibility is enforced for recently authenticated users with trusted fresh last-known section state.
- [x] 5.7.2 degraded mode blocks fresh sensitive actions and operations that require current authorization validation.
- [x] 5.7.3 degraded mode preserves shell frame, safe identity context, cached navigation, and visibly restricted zones.
- [x] 5.7.4 every visible cached section communicates freshness and validation status through centralized section labels.
- [x] 5.7.5 explicit safe recovery to fully connected mode is surfaced through canonical shell-status signaling.
- [x] ADR-0060 created and linked to Phase 5.7 traceability.

## Phase 5.7 Progress Notes

- 5.7.1 completed — centralized degraded mode policy domain implemented in `packages/shell/src/degradedMode.ts` with strict eligibility rules (4-hour auth recency + trusted fresh section requirement), sensitive action blocking matrix, restricted-zone resolver, and safe recovery resolver — 2026-03-06.
- 5.7.2 completed — `ShellCore` integrated with centralized degraded policy enforcement to preserve shell frame/context/navigation, surface restricted zones, block sensitive action intents in degraded mode, and emit explicit recovery-state callbacks — 2026-03-06.
- 5.7.3 completed — section freshness/validation/restriction labels expanded in `shellStatus.ts`, comprehensive tests added (`degradedMode.test.ts`, `ShellCore.test.ts`, `shellStatus.test.ts`), and ADR-0060 + governance traceability updates completed — 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/shell` - PASS
