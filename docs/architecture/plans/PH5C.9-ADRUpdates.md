# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.9: Architecture Decision Records Updates

**Version:** 2.0 (Create ADR-PH5C-01, update ADR-0070 & ADR-0071)
**Purpose:** This document defines the implementation steps to create a new Architecture Decision Record (ADR) for the Dev Auth Bypass feature and update existing ADRs with cross-references and alignment to Phase 5C decisions.
**Audience:** Implementation agent(s), architects, technical writers
**Implementation Objective:** Deliver comprehensive ADR documentation that records the rationale, alternatives considered, and consequences of dev auth bypass architecture, plus updated references in existing ADRs for complete traceability.

---

## 5.C.9 Architecture Decision Records Updates

1. **Create `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md`** (D-PH5C-01 through D-PH5C-08)
   - ADR template: Status, Context, Decision, Consequences, Alternatives, Rationale
   - Title: "Dev Auth Bypass for Development-Mode Authentication"
   - Status: Accepted (decision made during Phase 5C structured interview)
   - Context: Need for uncredentialed auth during dev/testing without requiring real credentials
   - Decision summary: Implement DevAuthBypassAdapter with in-app persona switcher, build-mode gating
   - Consequences: Faster dev iteration, easier testing, no production impact (gated behind DEV flag)
   - Alternatives considered: Mock adapter in test only (rejected, too limited), environment-based token (rejected, more complex)
   - Document all 8 locked decisions (D-PH5C-01 through D-PH5C-08) as sub-decisions

2. **Update `docs/architecture/adr/ADR-0070.md`** (hypothetical existing ADR on auth architecture)
   - Assumption: ADR-0070 covers Session Management and Auth Lifecycle
   - Add section: "Phase 5C Enhancement: Dev Auth Bypass"
   - Reference ADR-PH5C-01 for dev-mode specifics
   - Note that production session management remains unchanged
   - Cross-link to D-PH5C-02 and D-PH5C-03 decisions

3. **Update `docs/architecture/adr/ADR-0071.md`** (hypothetical existing ADR on permission guards)
   - Assumption: ADR-0071 covers Guard Resolution and Permission Checking
   - Add section: "Phase 5C Enhancement: Persona-Based Permission Testing"
   - Reference ADR-PH5C-01 and PersonaRegistry implementation
   - Cross-link to D-PH5C-04 decision on persona mapping
   - Document testing strategy using personas

4. **Document decision rationale** (all 8 decisions)
   - Why Persona Switcher over alternatives
   - Why build-mode gating (DEV flag) vs. other approaches
   - Why full lifecycle simulation vs. partial mocks
   - Why PersonaRegistry with auto-generation + hand-crafted supplement
   - Why Vitest fix approach (root-cause + fallback)
   - Why collapsible dev toolbar vs. modal/sidebar
   - Why structured guides (Diátaxis) vs. unstructured docs
   - Why alignment markers for code integrity

5. **Include alternatives section** (for each major decision)
   - Alternative 1: Why not considered or rejected
   - Alternative 2: Why not considered or rejected
   - Trade-offs between approaches
   - Selection rationale

6. **Document consequences** (positive and negative)
   - Benefits to dev experience
   - No impact on production
   - Maintenance considerations
   - Future extension possibilities

---

## Production-Ready Code: `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md`

```markdown
# ADR-PH5C-01: Dev Auth Bypass for Development-Mode Authentication

**Status:** Accepted
**Date:** 2026-03-07
**Phase:** 5C (Auth & Shell Foundation Completion)
**Supercedes:** None
**Superceded By:** None
**Locked Decisions:** D-PH5C-01 through D-PH5C-08

---

## Context

### Problem Statement

During development and testing of HB Intel, developers need to:
1. Authenticate without Microsoft credentials or setup
2. Test different user roles and permission scenarios
3. Simulate complete auth lifecycle (acquire → normalize → restore)
4. Switch personas to test feature access control

### Current Challenge

- Real auth provider requires credentials setup
- Creates friction for local development
- Difficult to test edge cases (expired sessions, denied permissions)
- No fast feedback loop for auth/permission changes

### Requirements

1. Allow uncredentialed access in dev mode
2. Support multiple personas (roles, permissions)
3. Simulate real auth flow (timing, events, audit logging)
4. Zero impact on production
5. Intuitive UI for persona switching

---

## Decision

### Overview

Implement **DevAuthBypassAdapter** with:
1. In-app persona switcher UI (collapsible dev toolbar)
2. Complete auth lifecycle simulation (configurable delay)
3. 11 predefined personas (6 base + 5 supplemental edge cases)
4. Build-mode gating (`import.meta.env.DEV`) to exclude from production
5. Structured alignment markers for code integrity

### Sub-Decisions (Locked)

#### D-PH5C-01: Persona Switcher — UI Component
**Decision:** In-app UI with pre-built persona list
- **Rationale:** Fastest feedback, no config needed, visual feedback
- **Alternative:** Command-line config (rejected: requires restart)
- **Alternative:** Environment variable (rejected: not user-friendly)

#### D-PH5C-02: Build-Mode Flag — Production Safety
**Decision:** `import.meta.env.DEV` gates all dev code; excluded from production bundle
- **Rationale:** Zero production risk, optimizable away by bundler
- **Alternative:** Runtime config flag (rejected: risky, could be enabled in production)
- **Alternative:** Separate dev build (rejected: duplicate build artifacts)

#### D-PH5C-03: Full Lifecycle Simulation
**Decision:** Complete flow with configurable delay (default 500ms)
- **Rationale:** Realistic testing, catches timing bugs, tunable for slow environments
- **Alternative:** Instant mock (rejected: doesn't catch real-world timing issues)
- **Alternative:** Fixed delay (rejected: not tunable)

#### D-PH5C-04: PersonaRegistry — Pre-Built + Supplemental
**Decision:** 6 auto-generated base personas (core roles) + 5 hand-crafted edge cases
- **Rationale:** Balance: auto-generation for standard roles, hand-crafted for edge cases
- **Alternative:** Fully auto-generated (rejected: can't handle edge cases like degraded mode)
- **Alternative:** Fully hand-crafted (rejected: tedious, missing standard roles)

#### D-PH5C-05: Vitest Fix — Root-Cause + Fallback
**Decision:** Fix absolute paths in config + provide fallback script
- **Rationale:** Root fix prevents recurrence, fallback is safety net
- **Alternative:** Fallback script only (rejected: doesn't fix underlying issue)
- **Alternative:** Environment-specific workaround (rejected: technical debt)

#### D-PH5C-06: DevToolbar — Collapsible Bottom-Docked
**Decision:** Fixed-bottom component, 36px collapsed, 300–400px expanded, three tabs
- **Rationale:** Non-intrusive, always available, organized tabs
- **Alternative:** Modal dialog (rejected: blocks main content)
- **Alternative:** Sidebar (rejected: takes screen real estate)

#### D-PH5C-07: Documentation — Structured How-To Guides
**Decision:** 2–3 page Diátaxis how-to guides for developer, user, administrator
- **Rationale:** Clear audience separation, goal-oriented, actionable
- **Alternative:** Single comprehensive guide (rejected: confuses audiences)
- **Alternative:** Unstructured documentation (rejected: hard to find info)

#### D-PH5C-08: Code Integrity — Alignment Markers + ESLint
**Decision:** Manual markers in 4 critical files + custom ESLint rule for validation
- **Rationale:** Audit trail + automated drift detection
- **Alternative:** Only markers (rejected: no enforcement)
- **Alternative:** Only ESLint (rejected: no traceability)

---

## Implementation

### Components

1. **DevAuthBypassAdapter** (`packages/auth/src/adapters/DevAuthBypassAdapter.ts`)
   - Implements `IAuthAdapter` interface
   - Methods: `acquireIdentity()`, `normalizeSession()`, `restoreSession()`
   - Gated behind `import.meta.env.DEV`

2. **PersonaRegistry** (`packages/auth/src/mock/personaRegistry.ts`)
   - 11 personas: 6 base + 5 supplemental
   - Methods: `getById()`, `all()`, `base()`, `supplemental()`, `default()`

3. **DevToolbar** (`packages/shell/src/devToolbar/DevToolbar.tsx`)
   - Three tabs: Personas / Settings / Session
   - Collapsible state management with localStorage persistence
   - Integration into `ShellCore.tsx`

4. **Vitest Configuration** (`vitest.workspace.ts`)
   - Explicit absolute paths
   - Test scripts in package.json
   - Fallback shell script

5. **Alignment Markers**
   - In ShellCore.tsx, authStore.ts, guardResolution.ts, sessionNormalization.ts
   - Custom ESLint rule for validation

6. **Documentation**
   - Developer integration guide
   - End-user access request guide
   - Administrator override management guide
   - Reference documents

### Files Affected

**New Files:**
- `packages/auth/src/adapters/DevAuthBypassAdapter.ts`
- `packages/auth/src/mock/personaRegistry.ts`
- `packages/shell/src/devToolbar/DevToolbar.tsx`
- `packages/shell/src/devToolbar/useDevAuthBypass.ts`
- `packages/shell/src/devToolbar/PersonaCard.tsx`
- `packages/auth/eslint-alignment-markers.cjs`
- `scripts/test-auth-shell.sh`
- Multiple documentation files

**Modified Files:**
- `packages/auth/src/index.ts` (dev exports)
- `packages/shell/src/ShellCore.tsx` (toolbar integration)
- `packages/auth/src/authStore.ts` (markers)
- `packages/auth/src/guardResolution.ts` (markers)
- `packages/auth/src/sessionNormalization.ts` (markers)
- `vitest.workspace.ts` (absolute paths)
- `turbo.json` (test task)

---

## Consequences

### Positive

1. **Developer Experience**
   - Fast local development without credential setup
   - Instant persona switching for testing
   - No friction between code change and testing

2. **Testing Coverage**
   - Easy testing of permission edge cases
   - Simulated auth flow catches timing bugs
   - Audit logging for debugging

3. **Code Quality**
   - Alignment markers provide audit trail
   - ESLint rule prevents architectural drift
   - Comprehensive documentation (Diátaxis)

4. **Zero Production Risk**
   - Build-mode gating ensures no dev code in production
   - Dev persona adapter completely excluded from bundle
   - No performance impact

### Negative / Trade-Offs

1. **Maintenance**
   - PersonaRegistry must be updated when new personas needed
   - DevToolbar styling maintenance
   - Alignment markers require discipline in code reviews

2. **Bundle Size (Negligible)**
   - Dev-mode checks add < 1KB (optimized away in production)
   - No runtime overhead for production users

---

## Alternatives Considered

### Alternative 1: Test-Only Mock (Rejected)

Mock adapter only in test files, not in dev mode.

**Pros:** Minimal code additions
**Cons:** Doesn't help local dev, requires test setup for manual testing, slower feedback loop

### Alternative 2: Environment Variable Configuration (Rejected)

Use env vars to configure mock personas instead of UI.

**Pros:** No UI code needed
**Cons:** Requires restart for changes, not user-friendly, harder to test scenarios

### Alternative 3: Separate Dev Build (Rejected)

Create separate dev build with mock auth baked in.

**Pros:** Clear separation
**Cons:** Duplicate build artifacts, maintenance burden, doesn't match production build

### Alternative 4: External Mock Server (Rejected)

Spin up mock auth server for local development.

**Pros:** Closer to production auth flow
**Cons:** Extra dependency, setup complexity, slower testing

---

## Related Decisions

- **ADR-0070**: Session Management & Auth Lifecycle (see Phase 5C Enhancement section)
- **ADR-0071**: Guard Resolution & Permission Checking (see Phase 5C Enhancement section)
- **Phase 5-Auth-Shell-Plan.md**: Original Phase 5 architecture
- **PH5C-Auth-Shell-Plan.md**: Phase 5C completion roadmap

---

## Implementation Timeline

- **PH5C.1**: Vitest Fix (2–3 hours)
- **PH5C.2**: DevAuthBypassAdapter (2–3 hours)
- **PH5C.3**: PersonaRegistry (1–2 hours)
- **PH5C.4**: DevToolbar (3–4 hours)
- **PH5C.5–7**: How-To Guides (3–4 hours)
- **PH5C.8**: Alignment Markers (1–2 hours)
- **PH5C.9**: ADR Updates (1–2 hours)
- **PH5C.10**: Final Verification (2–3 hours)

**Total:** 15–23 hours (2–3 engineering weeks)

---

## Validation & Testing

### Pre-Merge Checklist

- [ ] All 10 PH5C tasks completed
- [ ] `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` passes
- [ ] `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` passes (≥95% coverage)
- [ ] `pnpm lint` passes (no marker violations)
- [ ] Production bundle has zero dev code (grep verification)
- [ ] Documentation in correct `docs/` folders
- [ ] ADRs created and linked
- [ ] Sign-off table completed

### Verification Commands

```bash
# Build
pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell

# Test
pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell

# Lint
pnpm lint --filter @hbc/auth --filter @hbc/shell

# Check for dev code in production bundle
grep -r "DevAuthBypassAdapter" dist/ || echo "✓ No dev code in bundle"
grep -r "PersonaRegistry" dist/ || echo "✓ No personas in bundle"
```

---

## Future Considerations

1. **Extending PersonaRegistry**: Add new personas for future roles
2. **DevToolbar Enhancements**: Add more settings (simulated network conditions, error injection)
3. **Performance Simulation**: Add configurable latency for different network conditions
4. **Integration Testing**: Use personas in automated test suites
5. **CI/CD Adoption**: Use dev auth bypass in CI for feature validation

---

**End of ADR-PH5C-01**

---

## Template for ADR-0070 Enhancement

```markdown
### Phase 5C Enhancement: Dev Auth Bypass

See **ADR-PH5C-01-dev-auth-bypass.md** for complete decision details.

**Impact on ADR-0070:**
- Session Management logic unchanged (production path unaffected)
- Dev Auth Bypass provides alternative implementation of `IAuthAdapter`
- Session normalization in dev mode follows same ISessionData shape
- Guards evaluation identical in dev and production

**Cross-References:**
- D-PH5C-02: Build-mode gating ensures no dev code in production
- D-PH5C-03: Dev mode simulates full lifecycle with configurable delay
- D-PH5C-04: Personas provide complete permission test coverage
```

## Template for ADR-0071 Enhancement

```markdown
### Phase 5C Enhancement: Persona-Based Permission Testing

See **ADR-PH5C-01-dev-auth-bypass.md** for complete decision details.

**Impact on ADR-0071:**
- Permission guard logic unchanged (production evaluation identical)
- Dev mode provides 11 personas for comprehensive testing
- PersonaRegistry demonstrates all possible role/permission combinations
- Test coverage for edge cases (expired session, multi-role, degraded mode)

**Cross-References:**
- D-PH5C-04: PersonaRegistry with auto-generated + supplemental personas
- D-PH5C-01: Persona switcher UI for easy role testing
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
9. PH5C.9 – ADR Updates (this task)
10. PH5C.10 – Final Verification

---

## Final Phase 5C Definition of Done

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

## 5.C.9 Success Criteria Checklist (Task 5C.9)

- [ ] 5.C.9.1 ADR-PH5C-01 created with full decision documentation
- [ ] 5.C.9.2 ADR-PH5C-01 documents all 8 locked decisions (D-PH5C-01 through D-PH5C-08)
- [ ] 5.C.9.3 ADR-PH5C-01 includes alternatives section for each major decision
- [ ] 5.C.9.4 ADR-PH5C-01 documents consequences (positive and negative)
- [ ] 5.C.9.5 ADR-0070 updated with Phase 5C Enhancement section
- [ ] 5.C.9.6 ADR-0071 updated with Phase 5C Enhancement section
- [ ] 5.C.9.7 All cross-references between ADRs are valid and complete
- [ ] 5.C.9.8 ADRs follow standard ADR template structure
- [ ] 5.C.9.9 All linked decisions (D-PH5C-XX) are correctly referenced
- [ ] 5.C.9.10 ADR files are properly formatted and readable

---

## Phase 5.C.9 Progress Notes

- 5.C.9.1 [PENDING] — ADR-PH5C-01 creation with all decisions
- 5.C.9.2 [PENDING] — ADR-0070 update
- 5.C.9.3 [PENDING] — ADR-0071 update

### Verification Evidence

- `docs/architecture/adr/ADR-PH5C-01-dev-auth-bypass.md` exists and is complete - [PENDING]
- ADR-0070 and ADR-0071 include Phase 5C enhancement sections - [PENDING]
- All cross-references are valid - [PENDING]
- ADRs follow standard template structure - [PENDING]

---

**End of Task PH5C.9**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.9 created: 2026-03-07
ADR specifications complete with all locked decisions documented.
Next: PH5C.10 (Final Verification)
-->
