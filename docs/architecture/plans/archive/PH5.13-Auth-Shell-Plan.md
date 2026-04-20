# Phase 5 Development Plan – Authentication & Shell Foundation Task 13

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.13 Audit, Retention, and Traceability

1. Record structured audit events for at least:
   - sign in
   - sign out
   - session restore success/failure
   - access denied
   - request submitted
   - request approved/rejected
   - override created/modified/revoked
   - override expired/renewed
   - emergency access used
   - review flag generated/resolved
   - admin action affecting access state

2. Audit records must capture structured metadata sufficient for troubleshooting and governance.

3. Retention policy in Phase 5 must use:
   - meaningful active history for operations
   - an archive strategy for older records
   - documentation for future event-type tiering

4. Provide basic operational audit visibility in the initial admin scope.

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

## 5.15 Performance Baseline and Startup Budgets

1. Define startup phases and performance budgets for at least:
   - runtime detection
   - auth bootstrap
   - session restore
   - role/permission resolution
   - first protected shell render

2. Treat performance budgets as release criteria, not optional aspirations.

3. Instrument enough timing to validate the budgets in both PWA and SPFx previews.

4. Avoid premature deep optimization, but do not allow Phase 5 to ship with undefined startup expectations.

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

---

## 5.17 Release Gating and Sign-Off

1. Phase 5 may not ship based on engineering intuition alone.

2. Use a formal release checklist with pass/fail criteria covering:
   - architecture compliance
   - auth/shell package completeness
   - dual-mode validation matrix pass state
   - degraded mode safety checks
   - audit and retention implementation
   - admin operability
   - documentation completion
   - known issues review
   - performance budget results

3. Require named sign-offs from:
   - architecture owner
   - product owner
   - operations/support owner

4. No production release is complete without those sign-offs captured in the release package.

---

## 5.18 Documentation Package

1. Produce full technical and operational documentation.

2. Minimum required documentation set:
   - package README / purpose summaries
   - architecture overviews for `@hbc/auth` and `@hbc/shell`
   - store contracts and state diagrams
   - provider/adapter behavior docs
   - runtime mode detection and override docs
   - role-mapping and permission model docs
   - override governance/admin process docs
   - emergency access policy docs
   - shell-status bar state hierarchy docs
   - degraded mode policy docs
   - SPFx host-boundary docs
   - protected feature registration contract docs
   - test matrix docs
   - release checklist docs
   - deferred-scope roadmap notes for future “C” expansions

3. Each deferred item from the interview must be explicitly documented as:
   - not in Phase 5 scope
   - intentionally deferred
   - expected future direction
   - dependency assumptions for later implementation

---

## 5.19 Final Acceptance Criteria Structure

Phase 5 acceptance must be layered.

### Layer 1 — Feature Completion
- All required packages, stores, guards, adapters, shell surfaces, admin workflows, and docs exist.

### Layer 2 — Outcome Validation
- The system proves one-product behavior across dual runtime modes.
- Authorization and shell behavior are consistent and centrally enforced.
- Degraded mode and recovery behavior are safe and understandable.
- Admin operations are sufficient for production use.

### Layer 3 — Operational Readiness
- Audit and retention behavior are active.
- Release checklist passes.
- Documentation set is complete.
- Named sign-offs are captured.
- Deferred future expansion paths are explicitly documented.

Only when all three layers pass is Phase 5 accepted.

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

## Phase 5.13 Progress Notes

- 5.13.1 completed — structured audit logger added in `packages/auth/src/audit/auditLogger.ts` with canonical PH5.13 event taxonomy and required metadata contract (`eventId`, actor/subject attribution, source/runtime, correlation, outcome, and structured troubleshooting details) — 2026-03-06.
- 5.13.2 completed — retention utilities implemented with locked Option C defaults (180-day active history + indefinite archive strategy) and explicit deferred documentation seam for future event-type tiering — 2026-03-06.
- 5.13.3 completed — audit emission integrated across auth lifecycle stores/adapters, access-denied/request submission surfaces, override approval/renewal/emergency workflows, and admin state-changing actions — 2026-03-06.
- 5.13.4 completed — basic operational admin audit visibility hook added (`toAdminAuditOperationalVisibility`) with retention-aware active/archived counts and recent-event projection — 2026-03-06.
- 5.13.5 completed — auth package type/export surfaces updated and verification-gated with PH5.13 audit tests (`auditLogger.test.ts`, `authStore.audit.test.ts`, admin/workflow test updates) plus ADR-0066 traceability closure — 2026-03-06.

## Phase 5.13 Completion Checklist

- [x] Structured audit events implemented for all §5.13 required action classes.
- [x] Structured metadata contract implemented for troubleshooting/governance traceability.
- [x] Retention policy implemented (active history + archive strategy) with future event-tiering explicitly documented.
- [x] Basic operational audit visibility delivered in initial admin scope.
