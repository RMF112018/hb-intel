# PH7-BW-5 — Bootstrap Alignment: Replace MOCK_USER with PersonaRegistry in All 11 Apps

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · PH5C-Auth-Shell-Plan.md (PersonaRegistry established)
**Date:** 2026-03-07
**Priority:** MEDIUM — Dev tooling accuracy; does not block SharePoint deployment but breaks DevToolbar in dev mode
**Depends on:** PH6F.2 (mapRolesToPermissions() 17-key alignment should be done first)
**Blocks:** nothing directly, but PH6F.5 integration tests cover this

---

## Summary

All 11 webpart apps have `bootstrap.ts` files with hardcoded `MOCK_USER` objects:

```typescript
// Current state — every webpart app
const MOCK_USER: ICurrentUser = {
  id: 'user-001',
  displayName: 'Dev Admin',
  email: 'dev.admin@hbintel.local',
  roles: [{ id: 'role-admin', name: 'Administrator', permissions: ['*:*'] }],
};
```

This was acceptable scaffolding during Phase 5 but is now inconsistent with:
1. The PersonaRegistry established in Phase 5C (11 persona definitions with role-appropriate permission sets)
2. `apps/pwa/src/bootstrap.ts` which already uses `resolveBootstrapPersona()` / `personaToCurrentUser()`
3. The DevToolbar which persists selected persona in localStorage — a hardcoded MOCK_USER ignores that persisted choice

Additionally, each webpart bootstrap is domain-agnostic — it sets `useNavStore.getState().setActiveWorkspace('accounting')` correctly, but uses `'*:*'` wildcard permissions rather than the actual permission set for the intended test persona.

---

## Reference: How PWA Bootstrap Already Works

```typescript
// apps/pwa/src/bootstrap.ts (current — correct pattern)
import { resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions } from '@hbc/auth';

export function bootstrapMockEnvironment(): void {
  const persona = resolveBootstrapPersona();
  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));
  usePermissionStore.getState().setFeatureFlags({ 'buyout-schedule': true, 'risk-matrix': true });
  // ... project store setup
}
```

All 11 webpart `bootstrap.ts` files must follow this same pattern.

---

## Updated Bootstrap Pattern

The following template applies to all 11 webpart apps. The only domain-specific values are the `workspace` key and the `featureFlags` object.

```typescript
// apps/[domain]/src/bootstrap.ts

import type { IActiveProject } from '@hbc/models';
import { useAuthStore, usePermissionStore, resolveBootstrapPersona, personaToCurrentUser, resolveBootstrapPermissions } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';

// Domain-specific mock projects — representative data for dev scenarios
const MOCK_PROJECTS: IActiveProject[] = [
  {
    id: 'PRJ-001',
    name: 'Harbor View Medical Center',
    number: 'HV-2025-001',
    status: 'Active',
    startDate: '2025-01-15',
    endDate: '2027-06-30',
  },
  {
    id: 'PRJ-002',
    name: 'Riverside Office Complex',
    number: 'RC-2025-002',
    status: 'Active',
    startDate: '2025-03-01',
    endDate: '2026-12-15',
  },
];

export function bootstrapMockEnvironment(): void {
  // Use PersonaRegistry — respects DevToolbar persona selection persisted in localStorage
  const persona = resolveBootstrapPersona();
  useAuthStore.getState().setUser(personaToCurrentUser(persona));
  usePermissionStore.getState().setPermissions(resolveBootstrapPermissions(persona));

  // Domain-specific feature flags (see table below for per-domain values)
  usePermissionStore.getState().setFeatureFlags(DOMAIN_FEATURE_FLAGS);

  // Project store — same mock projects across all webparts for consistency
  useProjectStore.getState().setAvailableProjects(MOCK_PROJECTS);
  useProjectStore.getState().setActiveProject(MOCK_PROJECTS[0]);

  // Workspace identification
  useNavStore.getState().setActiveWorkspace('[workspace-key]');
}
```

---

## Per-Domain Workspace Key and Feature Flags

| Domain | Workspace Key | Feature Flags |
|---|---|---|
| accounting | `'accounting'` | `{ 'provisioning-trigger': true }` |
| estimating | `'estimating'` | `{ 'provisioning-status': true, 'bid-tracking': true }` |
| project-hub | `'project-hub'` | `{ 'buyout-schedule': true, 'risk-matrix': true, 'pmp-workflow': true }` |
| leadership | `'leadership'` | `{ 'portfolio-kpi': true, 'financial-forecast': true }` |
| business-development | `'business-development'` | `{ 'go-nogo-scorecard': true, 'committee-meeting': true }` |
| admin | `'admin'` | `{ 'provisioning-failures': true, 'error-log': true, 'system-settings': true }` |
| safety | `'safety'` | `{ 'incident-tracking': true, 'inspection-forms': true }` |
| quality-control-warranty | `'quality-control-warranty'` | `{ 'punch-list': true, 'warranty-claims': true }` |
| risk-management | `'risk-management'` | `{ 'risk-matrix': true, 'contingency-tracking': true }` |
| operational-excellence | `'operational-excellence'` | `{ 'process-metrics': true }` |
| human-resources | `'human-resources'` | `{ 'org-chart': true, 'onboarding-tracker': true }` |

---

## Implementation: All 11 Files

**accounting** (`apps/accounting/src/bootstrap.ts`):
```typescript
usePermissionStore.getState().setFeatureFlags({ 'provisioning-trigger': true });
useNavStore.getState().setActiveWorkspace('accounting');
```

**estimating** (`apps/estimating/src/bootstrap.ts`):
```typescript
usePermissionStore.getState().setFeatureFlags({ 'provisioning-status': true, 'bid-tracking': true });
useNavStore.getState().setActiveWorkspace('estimating');
```

**project-hub** (`apps/project-hub/src/bootstrap.ts`):
```typescript
usePermissionStore.getState().setFeatureFlags({ 'buyout-schedule': true, 'risk-matrix': true, 'pmp-workflow': true });
useNavStore.getState().setActiveWorkspace('project-hub');
```

**leadership** (`apps/leadership/src/bootstrap.ts`):
```typescript
usePermissionStore.getState().setFeatureFlags({ 'portfolio-kpi': true, 'financial-forecast': true });
useNavStore.getState().setActiveWorkspace('leadership');
```

**business-development** (`apps/business-development/src/bootstrap.ts`):
```typescript
usePermissionStore.getState().setFeatureFlags({ 'go-nogo-scorecard': true, 'committee-meeting': true });
useNavStore.getState().setActiveWorkspace('business-development');
```

**admin** (`apps/admin/src/bootstrap.ts`):
```typescript
usePermissionStore.getState().setFeatureFlags({ 'provisioning-failures': true, 'error-log': true, 'system-settings': true });
useNavStore.getState().setActiveWorkspace('admin');
```

**safety, quality-control-warranty, risk-management, operational-excellence, human-resources**: Follow same pattern with flags from the table above.

---

## Removing the Hardcoded MOCK_USER and MOCK_PERMISSIONS Constants

After updating, remove the following from every `bootstrap.ts`:
- `const MOCK_USER: ICurrentUser = { ... }` — replaced by `personaToCurrentUser(persona)`
- `usePermissionStore.getState().setPermissions(['*:*'])` — replaced by `resolveBootstrapPermissions(persona)`

The `MOCK_PROJECTS` array is **kept** — it is dev-only representative data not covered by PersonaRegistry.

---

## Verification

```bash
# Check that MOCK_USER literal is gone from all webpart bootstraps
grep -rn "MOCK_USER" apps/*/src/bootstrap.ts
# Expected: no output

# Check that resolveBootstrapPersona is used in all webpart bootstraps
grep -rn "resolveBootstrapPersona" apps/*/src/bootstrap.ts
# Expected: 11 matches (one per app)

# Run TypeScript check
pnpm turbo run typecheck --filter="./apps/accounting"
pnpm turbo run typecheck --filter="./apps/estimating"
```

---

## Definition of Done

- [ ] All 11 `apps/[domain]/src/bootstrap.ts` files updated to use `resolveBootstrapPersona()`
- [ ] No `MOCK_USER` literal in any webpart `bootstrap.ts`
- [ ] No `permissions: ['*:*']` wildcard in any webpart `bootstrap.ts`
- [ ] Each app's `bootstrapMockEnvironment()` calls `resolveBootstrapPermissions(persona)`
- [ ] Each app uses the correct workspace key from the table above
- [ ] Each app has domain-appropriate feature flags set
- [ ] TypeScript compiles without errors
- [ ] DevToolbar persona selection in dev mode is respected by all 11 apps (manual test)
