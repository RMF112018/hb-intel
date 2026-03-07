# Phase 5C Development Plan – Authentication & Shell Foundation Completion

**Version:** 2.0 (Auth Shell Hardening & Developer Experience)
**Purpose:** This document defines the complete Phase 5C implementation roadmap to elevate Phase 5 (Authentication & Shell Foundation) from 92.5% audit coverage to 100% and production-ready status through targeted hardening, developer tooling, and comprehensive documentation.
**Audience:** Implementation agents, engineering leads, quality assurance, and technical stakeholders.
**Implementation Objective:** Deliver a production-hardened authentication shell with full developer mode support, comprehensive documentation for all personas (developer, end user, administrator), alignment markers for code integrity, and audit-verified validation covering all quality gates.

---

## Refined Blueprint Section for Phase 5C

### Locked Architectural Outcome
Phase 5C represents the *completion and hardening* of Phase 5. The authentication and shell foundation is now:
- **Fully functional** in both production and development modes
- **Testable** with a working Vitest configuration verified across all auth and shell packages
- **Developer-friendly** with an in-app persona switcher and debug toolbar for manual testing and feature validation
- **Comprehensively documented** with role-specific guides for developers, end users, and administrators
- **Code-integrity verified** through structured alignment markers that guard against drift
- **100% audit-passing** across all seven mandatory categories: security, code quality, documentation, testability, maintainability, completeness, and architecture alignment

### Locked Decisions from the Structured Interview (2026-03-07)

#### 1. Development Mode Architecture
- **D-PH5C-01**: Persona Switcher — in-app UI with pre-built persona list
- **D-PH5C-02**: Build-mode flag (`import.meta.env.DEV`) — bypass code is absent from production bundle
- **D-PH5C-03**: Full simulated auth flow with configurable delay (default 500ms) to simulate real-world latency

#### 2. Persona Management
- **D-PH5C-04**: Auto-generated base personas (6 core: Administrator, AccountingUser, EstimatingUser, ProjectUser, Executive, Member) + hand-crafted supplement (5 edge cases: pending override, expired session, multi-role, read-only, degraded mode)

#### 3. Quality & Testing
- **D-PH5C-05**: Root-cause Vitest fix + versioned fallback script as insurance (`scripts/test-auth-shell.sh`)

#### 4. Developer Experience
- **D-PH5C-06**: Collapsible dev toolbar docked to bottom of screen, three tabs (Personas / Settings / Session)
- **D-PH5C-07**: Structured 2–3 page how-to guides with full numbered steps + worked example for each persona type

#### 5. Code Integrity
- **D-PH5C-08**: Targeted manual alignment markers in 4 key files (ShellCore.tsx, authStore.ts, guardResolution.ts, sessionNormalization.ts) + custom ESLint rule to guard against drift

---

## Phase 5C Success Criteria

1. ✓ Vitest workspace configuration has explicit absolute paths in `vitest.workspace.ts`; all test scripts are executable (`pnpm test` in auth and shell packages)
2. ✓ `DevAuthBypassAdapter` implements full auth lifecycle (acquireIdentity → normalizeSession → restoreSession) with configurable delay and startup timing events
3. ✓ `PersonaRegistry` exports 11 personas (6 base + 5 supplemental) with `getById()`, `all`, `base`, `supplemental` accessors
4. ✓ `DevToolbar.tsx` is integrated into `ShellCore.tsx`, collapsible, three-tab interface, fully styled and functional
5. ✓ Developer how-to guide (`docs/how-to/developer/integrate-auth-with-your-feature.md`) includes 8+ worked steps + Accounting Invoice List example
6. ✓ End-user how-to guide (`docs/how-to/user/request-elevated-access.md`) covers request workflow with screenshots/descriptions
7. ✓ Administrator how-to guide (`docs/how-to/administrator/manage-override-requests.md`) covers override request management
8. ✓ Alignment markers present in all 4 key files; custom ESLint rule enforces guard comments
9. ✓ ADR-PH5C-01 (Dev Auth Bypass) created; ADR-0070 and ADR-0071 updated with cross-references
10. ✓ All 12 verification gates pass: build, lint, type check, test, bundle size, no console errors, no production bypass leak, documentation present, ADRs linked, performance baseline met, audit coverage 100%

---

## Phase 5C Definition of Done

Phase 5C is complete when:
1. All 10 granular task files (PH5C.1 through PH5C.10) are executed in sequence.
2. Phase 5 audit coverage reaches **100%** across all seven categories (security, code quality, documentation, testability, maintainability, completeness, architecture alignment).
3. `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` succeeds with zero warnings.
4. `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes and reports ≥95% coverage.
5. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure (how-to, reference, explanation).
6. All alignment markers are in place; `pnpm lint` detects no violations.
7. Production bundle contains zero byte references to dev-mode code (verified via string search).
8. Final sign-off table is completed with all roles approved.

---

## Scope Boundaries

### In Scope for Phase 5C
- Root-cause fix for Vitest workspace configuration (absolute paths, test scripts, turbo.json integration)
- Fallback test script (`scripts/test-auth-shell.sh`) as contingency
- `DevAuthBypassAdapter` with full lifecycle simulation and configurable delay
- `PersonaRegistry` with auto-generated base personas and hand-crafted supplementals
- `DevToolbar.tsx` component with three-tab interface, collapsible state, localStorage persistence
- Three role-specific how-to guides (developer, end user, administrator) following Diátaxis how-to format
- Alignment markers in 4 key files; custom ESLint rule for guard enforcement
- ADR-PH5C-01 (Dev Auth Bypass) creation; updates to ADR-0070, ADR-0071
- All 12 verification gates and final audit sign-off

### Explicitly Deferred
- Changes to production authentication logic or guard resolution beyond alignment markers
- New personas beyond the locked 11 (6 base + 5 supplemental)
- UI redesign of dev toolbar (fixed bottom-docked, three-tab layout is locked)
- Integration with external auth providers in dev mode (simulation only)
- Localization or accessibility enhancements beyond WCAG 2.1 AA baseline

---

## Implementation Principles

1. **Copy-Paste Ready**: Every code block in every task file is complete, production-grade, and immediately executable. No `// ...` truncations.
2. **Locked Decisions Embedded**: Every implementation step and code block references the relevant D-PH5C-XX decision, enforcing traceability.
3. **Build-Mode Gating**: All dev-mode code is behind `import.meta.env.DEV` guards; production bundle inspection confirms zero dev bytes.
4. **Role-Based Documentation**: How-to guides are written for specific personas (developer, end user, administrator) with clear entry points and worked examples.
5. **Alignment Markers as Guards**: Structured comments in code act as audit trails and drift-prevention mechanisms.
6. **Verification-First**: Every task file includes a checklist and verification commands; final sign-off only when all gates pass.
7. **Diátaxis Structure**: All documentation lives in correct `docs/` subfolders (how-to, reference, explanation, adr) with clear audience separation.

---

## Phase 5C Code Deliverables

| File | Purpose | Task | LOC Est. |
|------|---------|------|----------|
| `packages/auth/src/adapters/DevAuthBypassAdapter.ts` | Mock adapter for dev mode | PH5C.2 | 150–200 |
| `packages/auth/src/mock/personaRegistry.ts` | Persona registry with 11 personas | PH5C.3 | 200–250 |
| `packages/auth/src/index.ts` (updated) | Dev subpath export | PH5C.2 | 5–10 |
| `packages/shell/src/devToolbar/DevToolbar.tsx` | Collapsible toolbar component | PH5C.4 | 250–300 |
| `packages/shell/src/devToolbar/DevToolbar.module.css` | Toolbar styling | PH5C.4 | 100–150 |
| `packages/shell/src/devToolbar/useDevAuthBypass.ts` | Hook for dev toolbar state | PH5C.4 | 80–100 |
| `packages/shell/src/devToolbar/index.ts` | Toolbar exports | PH5C.4 | 5–10 |
| `packages/shell/src/ShellCore.tsx` (updated) | Dev toolbar integration + alignment markers | PH5C.4, PH5C.8 | 10–20 |
| `packages/auth/src/authStore.ts` (updated) | Alignment marker | PH5C.8 | 5–10 |
| `packages/auth/src/guardResolution.ts` (updated) | Alignment marker | PH5C.8 | 5–10 |
| `packages/auth/src/sessionNormalization.ts` (updated) | Alignment marker | PH5C.8 | 5–10 |
| `packages/auth/eslint-alignment-markers.cjs` | Custom ESLint rule | PH5C.8 | 60–80 |
| `scripts/test-auth-shell.sh` | Fallback test script | PH5C.1 | 40–60 |
| `vitest.workspace.ts` (updated) | Absolute paths + workspace config | PH5C.1 | 20–40 |
| `turbo.json` (updated) | Test task added | PH5C.1 | 5–10 |
| `packages/auth/package.json` (updated) | Test script | PH5C.1 | 2–5 |
| `packages/shell/package.json` (updated) | Test script | PH5C.1 | 2–5 |

---

## Phase 5C Documentation Deliverables

| File | Purpose | Task | Diátaxis Type |
|------|---------|------|----------------|
| `docs/how-to/developer/integrate-auth-with-your-feature.md` | Developer integration guide | PH5C.5 | How-To |
| `docs/how-to/user/request-elevated-access.md` | End-user access request guide | PH5C.6 | How-To |
| `docs/how-to/administrator/manage-override-requests.md` | Admin override management guide | PH5C.7 | How-To |
| `docs/reference/dev-toolbar/DevToolbar.md` | Dev toolbar API reference | PH5C.4 | Reference |
| `docs/reference/auth/personas.md` | Persona registry reference | PH5C.3 | Reference |
| `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md` | Dev Auth Bypass decision record | PH5C.9 | ADR |
| `docs/architecture/adr/ADR-0070.md` (updated) | Cross-reference to ADR-PH5C-01 | PH5C.9 | ADR |
| `docs/architecture/adr/ADR-0071.md` (updated) | Cross-reference to ADR-PH5C-01 | PH5C.9 | ADR |

---

## Phase 5C Validation Deliverables

| Verification Gate | Type | Task |
|-------------------|------|------|
| Root-cause Vitest fix applied; all tests execute | Code Quality | PH5C.1 |
| `DevAuthBypassAdapter` implements full lifecycle | Testability | PH5C.2 |
| `PersonaRegistry` exports all 11 personas | Completeness | PH5C.3 |
| `DevToolbar.tsx` integrated and functional | Code Quality | PH5C.4 |
| Developer how-to guide present + worked example | Documentation | PH5C.5 |
| End-user how-to guide present | Documentation | PH5C.6 |
| Admin how-to guide present | Documentation | PH5C.7 |
| Alignment markers in 4 files; ESLint rule enforces | Maintainability | PH5C.8 |
| ADR-PH5C-01 created; ADR-0070/0071 updated | Architecture Alignment | PH5C.9 |
| All 12 gates pass; 100% audit coverage | Final Verification | PH5C.10 |

---

## Recommended Implementation Sequence

Execute Phase 5C tasks in this order:

1. **PH5C.1 – Vitest Fix** (2–3 hours)
   - Root-cause absolute path fix in `vitest.workspace.ts`
   - Test scripts in package.json, turbo.json
   - Fallback script `scripts/test-auth-shell.sh`
   - Verify: `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell`

2. **PH5C.2 – MockAuthAdapter Upgrade** (2–3 hours)
   - `DevAuthBypassAdapter.ts` with full lifecycle
   - Dev subpath export in auth `index.ts`
   - Configurable delay (default 500ms), timing events
   - Verify: `pnpm build --filter=@hbc/auth`; check import paths

3. **PH5C.3 – PersonaRegistry** (1–2 hours)
   - `personaRegistry.ts` with 11 personas (6 base + 5 supplemental)
   - Export methods: `getById()`, `all`, `base`, `supplemental`
   - Reference documentation in `docs/reference/auth/personas.md`
   - Verify: `pnpm turbo run build --filter=@hbc/auth`

4. **PH5C.4 – DevToolbar** (3–4 hours)
   - `DevToolbar.tsx` component (three tabs, collapsible)
   - `useDevAuthBypass.ts` hook, localStorage persistence
   - Integration into `ShellCore.tsx` behind `import.meta.env.DEV`
   - `DevToolbar.module.css` styling
   - Verify: `pnpm turbo run build --filter=@hbc/shell`; visual inspection

5. **PH5C.5 – Developer How-To Guide** (1–2 hours)
   - `docs/how-to/developer/integrate-auth-with-your-feature.md`
   - Numbered steps: registerFeature, useAuthSession, useHasPermission, AuthGuard, withFeatureAuth HOC
   - Worked example: Accounting Invoice List
   - Verify: File exists, Diátaxis structure, steps are complete

6. **PH5C.6 – End-User How-To Guide** (1 hour)
   - `docs/how-to/user/request-elevated-access.md`
   - Steps: identify missing permission, navigate to request form, submit, receive confirmation
   - Visual descriptions or screenshots
   - Verify: File exists, user-friendly language, workflow is clear

7. **PH5C.7 – Administrator How-To Guide** (1 hour)
   - `docs/how-to/administrator/manage-override-requests.md`
   - Steps: view pending requests, approve/reject, configure expiration, audit trail
   - Verify: File exists, steps cover full lifecycle

8. **PH5C.8 – Alignment Markers** (1–2 hours)
   - Markers in ShellCore.tsx, authStore.ts, guardResolution.ts, sessionNormalization.ts
   - Custom ESLint rule in `packages/auth/eslint-alignment-markers.cjs`
   - Verify: `pnpm lint` detects no violations; grep confirms markers present

9. **PH5C.9 – ADR Updates** (1–2 hours)
   - ADR-PH5C-01 (Dev Auth Bypass) creation
   - Update ADR-0070 and ADR-0071 with cross-references
   - Verify: Files present, cross-links valid

10. **PH5C.10 – Final Verification** (2–3 hours)
    - Execute all 12 verification gates
    - Audit coverage assessment
    - Sign-off table completion
    - Verify: All gates pass; Phase 5 scores 100%

---

## Phase 5C Task File Map

| Task | File | Objective |
|------|------|-----------|
| PH5C.1 | `PH5C.1-Vitest-Fix.md` | Fix Vitest config, add test scripts, fallback script |
| PH5C.2 | `PH5C.2-MockAuthAdapter-Upgrade.md` | Implement `DevAuthBypassAdapter` with full lifecycle |
| PH5C.3 | `PH5C.3-PersonaRegistry.md` | Create `PersonaRegistry` with 11 personas |
| PH5C.4 | `PH5C.4-DevToolbar.md` | Build collapsible dev toolbar with three tabs |
| PH5C.5 | `PH5C.5-HowToDeveloper.md` | Write developer auth integration guide |
| PH5C.6 | `PH5C.6-HowToEndUser.md` | Write end-user access request guide |
| PH5C.7 | `PH5C.7-HowToAdmin.md` | Write admin override management guide |
| PH5C.8 | `PH5C.8-AlignmentMarkers.md` | Add alignment markers and ESLint rule |
| PH5C.9 | `PH5C.9-ADRUpdates.md` | Create ADR-PH5C-01, update ADR-0070/0071 |
| PH5C.10 | `PH5C.10-FinalVerification.md` | Execute all verification gates, sign-off |

---

## Phase 5C Progress Notes

All tasks start in PENDING state. Update this section after each task completion.

### PH5C.1 Progress Notes
- 5.C.1.1 [COMPLETED] — Vitest workspace config absolute paths
- 5.C.1.2 [COMPLETED] — Test scripts in package.json
- 5.C.1.3 [COMPLETED] — Fallback script creation

### PH5C.2 Progress Notes
- 5.C.2.1 [COMPLETED] — DevAuthBypassAdapter implementation
- 5.C.2.2 [COMPLETED] — Dev subpath export (`@hbc/auth/dev` via `src/dev.ts`)
- 5.C.2.3 [COMPLETED] — Lifecycle events and timing

### PH5C.3 Progress Notes
- 5.C.3.1 [COMPLETED] — PersonaRegistry creation with 11 personas
- 5.C.3.2 [COMPLETED] — Export methods implementation
- 5.C.3.3 [COMPLETED] — Reference documentation

### PH5C.4 Progress Notes
- 5.C.4.1 [PENDING] — DevToolbar.tsx component
- 5.C.4.2 [PENDING] — useDevAuthBypass hook
- 5.C.4.3 [PENDING] — ShellCore.tsx integration
- 5.C.4.4 [PENDING] — Styling and layout

### PH5C.5 Progress Notes
- 5.C.5.1 [PENDING] — Developer guide creation
- 5.C.5.2 [PENDING] — Worked example (Accounting Invoice List)

### PH5C.6 Progress Notes
- 5.C.6.1 [PENDING] — End-user guide creation
- 5.C.6.2 [PENDING] — Request workflow documentation

### PH5C.7 Progress Notes
- 5.C.7.1 [PENDING] — Admin guide creation
- 5.C.7.2 [PENDING] — Override request lifecycle

### PH5C.8 Progress Notes
- 5.C.8.1 [PENDING] — Alignment markers in 4 files
- 5.C.8.2 [PENDING] — ESLint rule creation and integration

### PH5C.9 Progress Notes
- 5.C.9.1 [PENDING] — ADR-PH5C-01 creation
- 5.C.9.2 [PENDING] — ADR-0070 update
- 5.C.9.3 [PENDING] — ADR-0071 update

### PH5C.10 Progress Notes
- 5.C.10.1 [PENDING] — Verification gate execution
- 5.C.10.2 [PENDING] — Audit coverage assessment
- 5.C.10.3 [PENDING] — Sign-off completion

---

## Verification Evidence

All verification gates remain PENDING until execution. See PH5C.10 for full verification protocol.

### Build & Compilation
- `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` - [PASS for PH5C.1]
- `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` - [PASS for PH5C.1]
- `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` - [PASS for PH5C.1]

### Testing & Coverage
- `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` - [PASS for PH5C.1]
- Coverage reports generated via `bash scripts/test-auth-shell.sh --coverage` - [PASS for PH5C.1]

### Bundle & Security
- Production bundle size check (no unexpected growth) - [PENDING]
- Zero dev-mode code in production bundle (grep verification) - [PASS for PH5C.2]

### Documentation & Architecture
- All documentation files in correct `docs/` subfolders - [PASS for PH5C.3]
- ADRs linked and cross-referenced - [PENDING]

### Audit Coverage
- Security: 100% - [PENDING]
- Code Quality: 100% - [PENDING]
- Documentation: 100% - [PENDING]
- Testability: 100% - [PENDING]
- Maintainability: 100% - [PENDING]
- Completeness: 100% - [PENDING]
- Architecture Alignment: 100% - [PENDING]

---

## Final Phase 5C Sign-off Record

| Role | Name/ID | Checklist | Status | Date | Notes |
|------|---------|-----------|--------|------|-------|
| Implementation Lead | [Agent] | All 10 tasks executed, code reviewed | [PENDING] | [TBD] | Complete PH5C.1–PH5C.10 |
| Code Reviewer | [TBD] | All code passes quality gates, no drift | [PENDING] | [TBD] | Review after PH5C.8 |
| Test Lead | [TBD] | All test gates pass, ≥95% coverage | [PENDING] | [TBD] | Verify after PH5C.1 |
| Documentation Lead | [TBD] | All docs in correct folders, Diátaxis compliant | [PENDING] | [TBD] | Review after PH5C.5–PH5C.7 |
| Architecture Lead | [TBD] | ADRs complete, alignment markers guard code | [PENDING] | [TBD] | Review after PH5C.9 |
| Security Lead | [TBD] | Dev code gated, zero production leak verified | [PENDING] | [TBD] | Verify after PH5C.10 |
| QA Lead | [TBD] | All 12 verification gates pass, 100% audit | [PENDING] | [TBD] | Execute PH5C.10 |
| Product Owner | [TBD] | Phase 5 ready for MVP rollout (Accounting) | [PENDING] | [TBD] | Final approval |

---

**End of Phase 5C Master Plan**

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 5C master plan created: 2026-03-07
All 10 task files to follow.
PH5C.1 completed: 2026-03-07
D-PH5C-05 traceability closed: absolute-path `vitest.workspace.ts`, package/root test scripts, `turbo.json` test task updates, fallback runner `scripts/test-auth-shell.sh`, and package README "Running Tests" sections implemented.
PH5C.1 verification evidence: `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` PASS; `bash scripts/test-auth-shell.sh --coverage` PASS; `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` PASS; `pnpm turbo run lint --filter=@hbc/auth --filter=@hbc/shell` PASS; `pnpm turbo run check-types --filter=@hbc/auth --filter=@hbc/shell` PASS.
PH5C.1 remediation note: corrected workspace execution pathing/dependencies (`happy-dom`, `@vitest/coverage-v8`) and resolved two failing auth tests needed to satisfy verification gates.
PH5C.2 completed: 2026-03-07
D-PH5C-02/D-PH5C-03 traceability closed: `DevAuthBypassAdapter` implemented with full acquire/normalize/restore lifecycle, configurable delay, startup/performance events, structured audit logging, session persistence/recovery, and strict `import.meta.env.DEV` gating in `packages/auth/src/adapters/DevAuthBypassAdapter.ts`.
PH5C.2 dev export wiring: added dedicated subpath entrypoint `packages/auth/src/dev.ts` and `@hbc/auth/dev` package export mapping while preserving compile-safe root exports.
PH5C.2 verification evidence: `pnpm turbo run build --filter=@hbc/auth` PASS; `pnpm turbo run test --filter=@hbc/auth` PASS; `pnpm --filter @hbc/auth run test:coverage` PASS (`DevAuthBypassAdapter.ts` statements 97.74%, functions 100.00%); `grep -r "DevAuthBypassAdapter" dist/ --include="*.js"` returned empty.
PH5C.3 completed: 2026-03-07
D-PH5C-04 traceability closed: `packages/auth/src/mock/personaRegistry.ts` created with 6 base + 5 supplemental personas and query helpers (`getById`, `base`, `supplemental`, `all`, `default`, `byTag`, `byCategory`, `count`), and dev export wired through `packages/auth/src/dev.ts` for `@hbc/auth/dev`.
PH5C.3 documentation closure: `docs/reference/auth/personas.md` created with persona tables, permission matrix, testing scenarios, and extension guidance.
PH5C.3 verification evidence: `pnpm turbo run build --filter=@hbc/auth` PASS; `pnpm turbo run test --filter=@hbc/auth` PASS; `pnpm --filter @hbc/auth run test:coverage` PASS with `personaRegistry.ts` coverage 100% statements/branches/functions; PersonaRegistry test suite added (`packages/auth/src/mock/personaRegistry.test.ts`).
Next: Execute PH5C.4 (DevToolbar)
-->
