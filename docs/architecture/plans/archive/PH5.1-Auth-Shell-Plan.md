# Phase 5 Development Plan – Authentication & Shell Foundation Task 1

**Version:** 2.0 (refined from interview-locked decisions and intended to supersede/expand the current Phase 5 plan)  
**Purpose:** This document defines the comprehensive Phase 5 implementation plan for a production-ready HB Intel authentication and shell foundation that satisfies the dual PWA / SPFx operating model. It consolidates the architectural direction established in the current Phase 5 plan and hard-locks the additional interview decisions around runtime mode handling, shell governance, permission modeling, override administration, degraded-mode behavior, release gating, and documentation standards.  
**Audience:** Implementation agent(s), technical reviewers, product owner, operations/support stakeholders, and future maintainers.  
**Implementation Objective:** Deliver a production-ready auth shell package that behaves as one HB Intel product across PWA and SPFx, while preserving tightly bounded environment-specific integrations and a clear future path for later governance, observability, and admin-surface expansion.

---

# Comprehensive Step-by-Step Implementation Plan

## 5.1 Package and Architecture Foundation

1. Confirm the Phase 5 package boundaries:
   - `@hbc/auth` owns provider abstraction, auth adapters, session normalization, auth store, permission evaluation helpers, route/authorization guards, and auth-specific hooks.
   - `@hbc/shell` owns shell composition, shell-status derivation, navigation shell, shell layouts, degraded/recovery UI states, and shell-level stores.

2. Preserve per-feature file organization inside both packages:
   - one file per major item
   - `types.ts`
   - `constants.ts`
   - local `index.ts`
   - JSDoc on public exports

3. Add/update ADRs before implementation begins so the package structure and non-negotiable boundaries are locked prior to code migration.

4. Define explicit ownership boundaries:
   - auth provider/adapters may not directly control UI composition
   - feature modules may not bypass the auth store, permission resolution layer, or shell registration contract
   - SPFx-specific code must remain behind approved adapters or host integration seams

5. Update root workspace dependency rules so `@hbc/shell` depends on `@hbc/auth`, while feature packages consume auth/shell only through public exports.

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

## 5.1 Success Criteria Checklist (Task 1)

- [x] 5.1.1 package boundaries confirmed and codified for `@hbc/auth` and `@hbc/shell`.
- [x] 5.1.2 Option C per-feature structure constraints documented and locked.
- [x] 5.1.3 ADR boundaries locked before migration (`ADR-0053`, `ADR-0054`).
- [x] 5.1.4 workspace dependency governance updated in `pnpm-workspace.yaml` and `turbo.json`.
- [x] 5.1.5 documentation/progress evidence appended to all required plan/blueprint/foundation files.
- [x] Build, lint, and type-check verification commands executed and captured for `@hbc/auth` and `@hbc/shell`.

## Phase 5.1 Progress Notes

- 5.1.1 completed - package boundaries codified in package manifests/tsconfig/vite and package ownership READMEs - 2026-03-06.
- 5.1.2 completed - Option C per-feature structure + public-export JSDoc requirements documented in `packages/auth/README.md` and `packages/shell/README.md` - 2026-03-06.
- 5.1.3 completed - ADRs 0053 and 0054 created and locked - 2026-03-06.
- 5.1.4 completed - root workspace dependency governance updated in `pnpm-workspace.yaml` and `turbo.json` - 2026-03-06.
- 5.1.5 completed - verification evidence and traceability comments appended across Phase 5 plans + blueprint + foundation plan - 2026-03-06.

### Verification Evidence (2026-03-06)

- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` - PASS
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` - PASS (0 errors)
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` - PASS
