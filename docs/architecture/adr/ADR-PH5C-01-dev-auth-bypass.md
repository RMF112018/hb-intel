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
