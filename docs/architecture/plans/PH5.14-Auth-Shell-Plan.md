# Phase 5 Development Plan – Authentication & Shell Foundation Task 14

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.14 SPFx Boundary and Hosting Integration

1. HB Intel must remain the primary shell in SPFx mode.

2. SPFx may provide:
   - host container
   - Microsoft identity context
   - narrow approved host integration hooks

3. SPFx may not become the source of shell composition truth.

4. Document and implement approved SPFx host integrations only where they add clear value without fragmenting shell behavior.

5. Keep all SPFx-specific integration logic out of generic shell components except through documented seams.

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

## Phase 5.14 Progress Notes

- 5.14.1 completed — strict SPFx identity/host bridge contracts added in `@hbc/auth` and `@hbc/shell` for approved boundary seams only (host container metadata, identity context handoff, and limited host signals) — 2026-03-06.
- 5.14.2 completed — SPFx adapter/bootstrap integration refactored to consume typed bridge input (`SpfxIdentityBridgeInput`, `SpfxHostBridgeInput`) while preserving backward-compatible legacy page-context intake through normalized seams — 2026-03-06.
- 5.14.3 completed — shell boundary enforcement added so SPFx host bridge data is accepted only in `spfx` environment adapters and cannot drive shell composition truth (mode/layout remain resolved by shell-owned rules) — 2026-03-06.
- 5.14.4 completed — documented narrow approved SPFx host integration hooks implemented (`theme`, `resize`, `location`) through `createSpfxShellEnvironmentAdapter` callback seams without generic-shell SPFx coupling — 2026-03-06.
- 5.14.5 completed — boundary regression tests added for auth/shell seam normalization and composition-authority enforcement; package exports updated for typed host-bridge public APIs — 2026-03-06.

## Phase 5.14 Completion Checklist

- [x] HB Intel primary shell enforced for SPFx mode.
- [x] SPFx host responsibilities constrained to container, Microsoft identity context, and approved narrow host hooks.
- [x] SPFx prevented from becoming shell composition source of truth.
- [x] Approved SPFx host integrations documented and implemented without shell fragmentation.
- [x] SPFx-specific logic kept out of generic shell components except through documented seams.
