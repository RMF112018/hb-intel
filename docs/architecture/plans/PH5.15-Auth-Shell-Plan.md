# Phase 5 Development Plan – Authentication & Shell Foundation Task 15

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

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

## 5.15 Progress Notes

- 5.15.1 completed — startup phase taxonomy and locked balanced budgets implemented in `packages/shell/src/startupTiming.ts` (`runtime-detection`, `auth-bootstrap`, `session-restore`, `permission-resolution`, `first-protected-shell-render` with `100/800/500/200/1500` ms budgets) — 2026-03-06.
- 5.15.2 completed — non-blocking budget validation APIs delivered (`startPhase`, `endPhase`, `recordPhase`, `getSnapshot`, `validateBudgets`, `clear`) with explicit release-gating diagnostics semantics and no runtime throws — 2026-03-06.
- 5.15.3 completed — auth/shell startup instrumentation integrated across runtime resolution, auth bootstrap, session restore, permission resolution, and first protected shell render (`resolveAuthMode`, auth store/adapters/SPFx bootstrap, guard resolver, `ShellCore`) — 2026-03-06.
- 5.15.4 completed — shell diagnostics observer seam added via `ShellCore` startup snapshot callback and public startup timing exports/types in `@hbc/shell` (with minimal auth bridge exports preserved behind package boundaries) — 2026-03-06.
- 5.15.5 completed — startup timing unit/integration coverage added for utility behavior, guard/adapters bootstrap instrumentation, and shell first-protected-render readiness (`startupTiming.test.ts`, `guardResolution.test.ts`, `resolveAuthMode.test.ts`, `sessionRestoreTiming.test.ts`, `spfx/index.test.ts`, `ShellCore.test.ts`) — 2026-03-06.
- 5.15.6 completed — governance/doc closure finalized with PH5.15 + PH5 progress updates/checklists, blueprint/foundation progress comments, ADR-0068 creation, and ADR index update — 2026-03-06.

## 5.15 Completion Checklist

- [x] Startup phases and explicit budgets defined for runtime detection, auth bootstrap, session restore, permission resolution, and first protected shell render.
- [x] Budgets treated as release criteria through explicit non-blocking validation output and diagnostics snapshot surfaces.
- [x] Startup timing instrumentation integrated for both PWA and SPFx preview paths without changing auth/guard/shell behavior.
- [x] Deep optimization deferred with explicit documentation while ensuring startup expectations are defined and measurable in Phase 5.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm exec vitest run packages/shell/src/startupTiming.test.ts packages/shell/src/ShellCore.test.ts packages/auth/src/adapters/resolveAuthMode.test.ts packages/auth/src/adapters/sessionRestoreTiming.test.ts packages/auth/src/guards/guardResolution.test.ts packages/auth/src/spfx/index.test.ts` - BLOCKED (workspace Vitest/Vite resolution issue: package-local `vite` import not resolvable from generated `.vite-temp` configs)

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
