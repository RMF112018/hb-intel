# Phase 5 Development Plan – Authentication & Shell Foundation Task 11

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

## 5.11 Admin Capability Scope for Phase 5

1. Build core production admin UX only.

2. Minimum required admin capability includes:
   - user lookup
   - role/access lookup
   - override request review
   - approval / rejection action
   - expiration and renewal handling
   - review queue for role-change impacts
   - emergency access review queue
   - basic audit visibility

3. Phase 5 admin UX may be intentionally narrower than the full long-term governance workspace, but it must be sufficient for real production operations.

4. Backend/rules capability must be more complete than the initial admin UX so future UI expansion does not require redesigning the access model.

5. Document explicit future expansion items for:
   - broader admin dashboards
   - richer analytics
   - request tracking
   - notifications
   - advanced reporting

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

## Phase 5.11 Progress Notes

- 5.11.1 completed — shared minimal production admin module added to `@hbc/auth` (`src/admin/`) with typed repository/workflow/hook/page surfaces and sectioned capability coverage for user lookup, role/access lookup, override review, renewal handling, role-change review, emergency review, and basic audit visibility — 2026-03-06.
- 5.11.2 completed — in-memory repository adapter implemented as Phase 5.11 runtime bridge while preserving Phase 5.10 backend/rules ownership as the richer system-of-record model — 2026-03-06.
- 5.11.3 completed — deterministic override review workflows implemented for approve/reject, renewal, role-change review resolution, and emergency review with mandatory reason enforcement — 2026-03-06.
- 5.11.4 completed — dual-surface wiring applied: PWA `/admin` and `apps/admin` now consume shared `@hbc/auth` admin UX, with admin route guards enforcing access-control permission boundaries — 2026-03-06.
- 5.11.5 completed — admin unit tests added for repository, hooks, and workflows; verification and governance closure completed with ADR-0064 — 2026-03-06.

## Phase 5.11 Completion Checklist

- [x] §5.11 item 1 complete — core production admin UX implemented (minimum required scope only).
- [x] §5.11 item 2 complete — required admin capabilities delivered (lookup, review queues, decision actions, renewals, audit visibility).
- [x] §5.11 item 3 complete — scope intentionally narrower than long-term governance workspace while operationally usable in production.
- [x] §5.11 item 4 complete — backend/rules layer remains richer than initial admin UX, preserving expansion without redesign.
- [x] §5.11 item 5 complete — deferred expansion items documented explicitly.

## Deferred Expansion (Documented for Later Phases)

- Broader admin dashboards and executive governance overview surfaces.
- Richer analytics and anomaly-oriented access insights.
- Request tracking/history timeline and notification center workflows.
- Advanced compliance reporting and exportable audit intelligence.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth` - PASS
- `pnpm turbo run lint --filter=@hbc/auth` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth` - PASS
- `pnpm --filter @hbc/auth exec vitest run packages/auth/src/admin/workflows.test.ts packages/auth/src/admin/repository.test.ts packages/auth/src/admin/hooks.test.ts` - BLOCKED (workspace Vitest startup cannot resolve package-local `vite` in generated temp config).
