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
