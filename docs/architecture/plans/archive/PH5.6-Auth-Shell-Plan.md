# Phase 5 Development Plan – Authentication & Shell Foundation Task 6

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.6 Unified Shell-Status / Connectivity Bar Integration

1. Reuse the existing top connectivity bar as the canonical shell-status rail.

2. Expand it from pure network display into a unified shell-status bar for:
   - initializing
   - restoring session
   - connected
   - reconnecting
   - degraded mode
   - access validation issue
   - error/failure state

3. The shell-status bar must derive from a central shell-status state model, not direct updates from multiple subsystems.

4. Implement a fixed priority hierarchy so the most important message always wins.

5. Use plain-language status copy.

6. Only allow limited, approved actions in the bar where they are clearly useful and safe, such as:
   - retry
   - sign in again
   - learn more / open recovery detail

7. Degraded mode must use:
   - global shell-status signal via the bar
   - section-level labels for last-known data / limited validation

8. Document a future path to richer sub-states and feature-specific status contributions, but do not overbuild that now.

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

## 5.6 Success Criteria Checklist (Task 6)

- [x] 5.6.1 existing top connectivity bar reused as the canonical unified shell-status rail.
- [x] 5.6.2 required shell-status states implemented (`initializing`, `restoring-session`, `connected`, `reconnecting`, `degraded`, `access-validation-issue`, `error-failure`).
- [x] 5.6.3 shell-status derivation centralized in `@hbc/shell` model/resolver (no direct subsystem writes).
- [x] 5.6.4 fixed priority hierarchy implemented and enforced by resolver.
- [x] 5.6.5 plain-language status copy and limited approved actions (`retry`, `sign in again`, `learn more`) implemented with allowlist enforcement.
- [x] 5.6.6 degraded mode integrated with global shell-status signal and section-level labels, without overbuilding future sub-states.
- [x] ADR-0059 created and linked to Phase 5.6 traceability.

## Phase 5.6 Progress Notes

- 5.6.1 completed — centralized shell-status domain added in `@hbc/shell` (`shellStatus.ts`) with required state vocabulary, plain-language copy, approved action allowlist, and fixed priority hierarchy — 2026-03-06.
- 5.6.2 completed — shell-core integration implemented to derive unified shell-status snapshots from central auth/shell state + connectivity signal adapter, with centralized action handlers (`retry`, `sign-in-again`, `learn-more`) — 2026-03-06.
- 5.6.3 completed — existing top `HbcConnectivityBar` expanded to consume unified shell-status snapshots while preserving legacy connectivity-only compatibility paths — 2026-03-06.
- 5.6.4 completed — degraded mode section-label contract integrated (`deriveDegradedSectionLabels`) and wired through centralized status snapshot derivation — 2026-03-06.
- 5.6.5 completed — unit tests added for resolver priority, copy/action mapping, action allowlist enforcement, degraded labels, and connectivity-bar compatibility rendering model — 2026-03-06.
- 5.6.6 completed — ADR-0059 authored and governance traceability updates applied across PH5.6/PH5/Blueprint/Foundation plans — 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/shell` - PASS
