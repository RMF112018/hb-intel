# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.3: PersonaRegistry Implementation

**Version:** 2.0 (Persona registry with 6 base + 5 supplemental personas)
**Purpose:** This document defines the complete implementation steps to create a comprehensive PersonaRegistry with 11 personas (6 core business roles + 5 edge cases) and export methods for querying by ID, filtering by category, and default persona selection.
**Audience:** Implementation agent(s), backend developers, test engineers, QA
**Implementation Objective:** Deliver a production-grade persona registry that supports development-mode persona switching, provides comprehensive coverage of business roles and edge cases, and enables automated testing of authentication and authorization scenarios.

---

## 5.C.3 PersonaRegistry Implementation

1. **Create `packages/auth/src/mock/personaRegistry.ts`** (D-PH5C-04)
   - Define `IPersona` interface with name, displayName, email, roles, permissions, description, category
   - Define 6 base personas representing core business roles: Administrator, AccountingUser, EstimatingUser, ProjectUser, Executive, Member
   - Define 5 supplemental personas for edge cases: PendingOverride, ExpiredSession, MultiRole, ReadOnly, DegradedMode (D-PH5C-04)
   - Each persona must include a realistic email, full set of roles, and detailed description
   - Export `PERSONA_REGISTRY` constant as array of all 11 personas
   - Export helper methods: `getPersonaById(id: string)`, `getBasePersonas()`, `getSupplementalPersonas()`, `getAllPersonas()`, `getDefaultPersona()`

2. **Implement base personas** (D-PH5C-04)
   - **Administrator**: Full system access, user management, override capabilities, all features enabled
   - **AccountingUser**: Access to accounting module, invoice management, financial reports, read-write on financials
   - **EstimatingUser**: Access to estimating module, project quotes, estimation tools, read-write on estimates
   - **ProjectUser**: Access to project hub, task tracking, project visibility, read-write on assigned projects
   - **Executive**: High-level reporting access, dashboard visibility, limited operational access
   - **Member**: Basic user, view-only access to assigned projects and public information

3. **Implement supplemental personas** (D-PH5C-04)
   - **PendingOverride**: User with pending access request, limited permissions until approved
   - **ExpiredSession**: User with expired session token (for testing session restoration logic)
   - **MultiRole**: User with multiple roles (e.g., Accounting + Estimating) to test cross-module scenarios
   - **ReadOnly**: User with read-only access across all modules (no write permissions)
   - **DegradedMode**: User in degraded system state (limited features available due to maintenance)

4. **Define comprehensive permission sets** (D-PH5C-04)
   - Create permission map for each persona: e.g., `feature:admin-panel`, `feature:accounting-invoice`, `feature:user-management`
   - Ensure permissions align with registered features in the app
   - Include both module-level and action-level permissions (read, write, delete, approve)
   - Base permissions on persona roles automatically

5. **Implement helper methods** (D-PH5C-04)
   - `getPersonaById(id: string): IPersona | undefined` — returns persona by ID
   - `getBasePersonas(): IPersona[]` — returns only 6 core personas
   - `getSupplementalPersonas(): IPersona[]` — returns only 5 edge-case personas
   - `getAllPersonas(): IPersona[]` — returns all 11 personas
   - `getDefaultPersona(): IPersona` — returns Administrator persona as default for dev mode

6. **Add metadata and documentation** (D-PH5C-04)
   - Include `created` timestamp, `updatedAt`, `version` for each persona
   - Add `description` field explaining persona's purpose and use cases
   - Add `category` field: 'base' or 'supplemental'
   - Add `tags` array for filtering: ['admin', 'accounting', 'testing', 'edge-case', etc.]
   - Include `usageExample` string describing when to use this persona

7. **Create reference documentation** (D-PH5C-04)
   - Create `docs/reference/auth/personas.md` with full persona listing
   - Include table of all personas with columns: Name, Category, Email, Roles, Primary Permissions, Use Case
   - Add section describing how to select personas in dev toolbar
   - Include guidance on which persona to use for specific testing scenarios

8. **Add unit tests for PersonaRegistry** (D-PH5C-05)
   - Test `getPersonaById()` returns correct persona
   - Test `getPersonaById()` returns undefined for invalid ID
   - Test `getBasePersonas()` returns exactly 6 personas
   - Test `getSupplementalPersonas()` returns exactly 5 personas
   - Test `getAllPersonas()` returns all 11 personas
   - Test `getDefaultPersona()` returns Administrator
   - Verify all personas have required fields (name, email, roles, permissions)
   - Verify no duplicate persona IDs
   - Verify permission sets are valid (no empty arrays)
   - Achieve ≥95% code coverage

9. **Export PersonaRegistry from auth package** (D-PH5C-04)
   - Add export in `packages/auth/src/index.ts` (if public) or dev subpath export
   - Ensure PersonaRegistry is accessible from `@hbc/auth/dev` (dev mode only if gated)

10. **Document persona selection in DevToolbar integration notes** (D-PH5C-04)
    - Create internal documentation for how DevToolbar uses PersonaRegistry to populate persona selector
    - Document how to extend PersonaRegistry with new personas (if needed in future)

---

## Production-Ready Code: `packages/auth/src/mock/personaRegistry.ts`

```typescript
// packages/auth/src/mock/personaRegistry.ts
// D-PH5C-04: Persona registry with 6 base + 5 supplemental personas
// Version: 1.0
// Last Updated: 2026-03-07

export interface IPersona {
  id: string; // unique identifier for persona
  name: string; // display name
  email: string; // realistic email address
  roles: string[]; // assigned roles
  permissions: Record<string, boolean>; // feature permissions
  description: string; // purpose and use case
  category: 'base' | 'supplemental'; // persona category
  tags: string[]; // searchable tags
  usageExample: string; // when/how to use this persona
  created: number; // timestamp
  updatedAt: number; // last update
}

/**
 * Base Personas (6) — Core business roles
 * D-PH5C-04: Represents main user types in HB Intel
 */
const BASE_PERSONAS: IPersona[] = [
  {
    id: 'persona-admin',
    name: 'Administrator',
    email: 'admin@hb-intel.local',
    roles: ['Administrator', 'Manager'],
    permissions: {
      'feature:admin-panel': true,
      'feature:user-management': true,
      'feature:system-settings': true,
      'feature:override-requests': true,
      'feature:audit-logs': true,
      'feature:accounting-invoice': true,
      'feature:accounting-reports': true,
      'feature:estimating-projects': true,
      'feature:estimating-quotes': true,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': true,
      'action:delete': true,
      'action:approve': true,
    },
    description:
      'Full system administrator with access to all modules and administrative functions',
    category: 'base',
    tags: ['admin', 'full-access', 'manager'],
    usageExample: 'Use when testing admin features, user management, system settings',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-accounting',
    name: 'AccountingUser',
    email: 'accounting@hb-intel.local',
    roles: ['AccountingUser'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': true,
      'feature:accounting-reports': true,
      'feature:estimating-projects': false,
      'feature:estimating-quotes': false,
      'feature:project-hub': false,
      'feature:project-tracking': false,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': true,
      'action:delete': false,
      'action:approve': false,
    },
    description:
      'Accounting department user with full access to invoices, payments, and financial reports',
    category: 'base',
    tags: ['accounting', 'finance', 'module-specific'],
    usageExample: 'Use when testing accounting module features, invoice management',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-estimating',
    name: 'EstimatingUser',
    email: 'estimating@hb-intel.local',
    roles: ['EstimatingUser'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': false,
      'feature:accounting-reports': false,
      'feature:estimating-projects': true,
      'feature:estimating-quotes': true,
      'feature:project-hub': false,
      'feature:project-tracking': false,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': true,
      'action:delete': false,
      'action:approve': true,
    },
    description:
      'Estimating department user with access to project estimation and quote management',
    category: 'base',
    tags: ['estimating', 'quotes', 'module-specific'],
    usageExample: 'Use when testing estimating module, project quotes, estimation tools',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-project',
    name: 'ProjectUser',
    email: 'project@hb-intel.local',
    roles: ['ProjectUser'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': false,
      'feature:accounting-reports': false,
      'feature:estimating-projects': false,
      'feature:estimating-quotes': false,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': true,
      'action:delete': false,
      'action:approve': false,
    },
    description:
      'Project management user with access to project hub, task tracking, and team collaboration',
    category: 'base',
    tags: ['projects', 'team', 'module-specific'],
    usageExample: 'Use when testing project module, task tracking, team features',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-executive',
    name: 'Executive',
    email: 'executive@hb-intel.local',
    roles: ['Executive', 'Manager'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': true,
      'feature:accounting-invoice': true,
      'feature:accounting-reports': true,
      'feature:estimating-projects': true,
      'feature:estimating-quotes': true,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': false,
      'action:delete': false,
      'action:approve': true,
    },
    description:
      'Executive user with read-only access to all modules and approval capabilities',
    category: 'base',
    tags: ['executive', 'manager', 'reporting'],
    usageExample: 'Use when testing executive dashboard, read-only access, approval workflows',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-member',
    name: 'Member',
    email: 'member@hb-intel.local',
    roles: ['Member'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': false,
      'feature:accounting-reports': false,
      'feature:estimating-projects': false,
      'feature:estimating-quotes': false,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': false,
      'action:delete': false,
      'action:approve': false,
    },
    description:
      'Basic member user with view-only access to assigned projects and public information',
    category: 'base',
    tags: ['basic-user', 'read-only', 'limited-access'],
    usageExample: 'Use when testing basic user access, view-only scenarios',
    created: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * Supplemental Personas (5) — Edge cases and special scenarios
 * D-PH5C-04: For testing authorization logic, edge cases, degraded modes
 */
const SUPPLEMENTAL_PERSONAS: IPersona[] = [
  {
    id: 'persona-pending-override',
    name: 'PendingOverride',
    email: 'pending-override@hb-intel.local',
    roles: ['Member'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': false,
      'feature:accounting-reports': false,
      'feature:estimating-projects': false,
      'feature:estimating-quotes': false,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': false,
      'action:delete': false,
      'action:approve': false,
      '_override:pending': true, // Flag for pending override request
    },
    description:
      'User with pending access override request; tests temporary elevated access workflows',
    category: 'supplemental',
    tags: ['edge-case', 'override', 'pending-request'],
    usageExample:
      'Use when testing override request flows, temporary permission elevation',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-expired-session',
    name: 'ExpiredSession',
    email: 'expired-session@hb-intel.local',
    roles: ['AccountingUser'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': false,
      'feature:accounting-reports': false,
      'feature:estimating-projects': false,
      'feature:estimating-quotes': false,
      'feature:project-hub': false,
      'feature:project-tracking': false,
      'feature:view-dashboard': false,
      'feature:view-profile': false,
      'action:read': false,
      'action:write': false,
      'action:delete': false,
      'action:approve': false,
      '_session:expired': true, // Flag for expired session
    },
    description:
      'User with expired session token; tests session restoration and re-authentication flows',
    category: 'supplemental',
    tags: ['edge-case', 'session-management', 're-auth'],
    usageExample: 'Use when testing session expiration, token refresh, re-login flows',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-multi-role',
    name: 'MultiRole',
    email: 'multi-role@hb-intel.local',
    roles: ['AccountingUser', 'EstimatingUser', 'ProjectUser'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': true,
      'feature:accounting-reports': true,
      'feature:estimating-projects': true,
      'feature:estimating-quotes': true,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': true,
      'action:delete': false,
      'action:approve': true,
    },
    description:
      'User with multiple module roles; tests cross-module authorization and complex permission logic',
    category: 'supplemental',
    tags: ['edge-case', 'multi-role', 'cross-module'],
    usageExample:
      'Use when testing users with multiple roles, cross-module workflows, permission intersection',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-read-only',
    name: 'ReadOnly',
    email: 'read-only@hb-intel.local',
    roles: ['Viewer'],
    permissions: {
      'feature:admin-panel': false,
      'feature:user-management': false,
      'feature:system-settings': false,
      'feature:override-requests': false,
      'feature:audit-logs': true,
      'feature:accounting-invoice': true,
      'feature:accounting-reports': true,
      'feature:estimating-projects': true,
      'feature:estimating-quotes': true,
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': false,
      'action:delete': false,
      'action:approve': false,
    },
    description:
      'User with read-only access across all modules; tests permission denial and UI feature gating',
    category: 'supplemental',
    tags: ['edge-case', 'read-only', 'audit'],
    usageExample: 'Use when testing read-only access, permission denial, UI graying-out',
    created: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'persona-degraded-mode',
    name: 'DegradedMode',
    email: 'degraded-mode@hb-intel.local',
    roles: ['Administrator'],
    permissions: {
      'feature:admin-panel': true,
      'feature:user-management': false, // Unavailable in degraded mode
      'feature:system-settings': false, // Unavailable in degraded mode
      'feature:override-requests': false,
      'feature:audit-logs': false,
      'feature:accounting-invoice': true,
      'feature:accounting-reports': false, // Unavailable in degraded mode
      'feature:estimating-projects': true,
      'feature:estimating-quotes': false, // Unavailable in degraded mode
      'feature:project-hub': true,
      'feature:project-tracking': true,
      'feature:view-dashboard': true,
      'feature:view-profile': true,
      'action:read': true,
      'action:write': false,
      'action:delete': false,
      'action:approve': false,
      '_system:degraded': true, // Flag for degraded mode
    },
    description:
      'Admin user in system degraded mode; tests fallback behaviors, limited feature availability',
    category: 'supplemental',
    tags: ['edge-case', 'degraded-mode', 'maintenance'],
    usageExample:
      'Use when testing degraded system states, feature unavailability, fallback workflows',
    created: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * Complete Persona Registry
 * Combines base and supplemental personas into single queryable registry
 * D-PH5C-04: Export all personas and query methods
 */
export const PERSONA_REGISTRY = {
  /**
   * Get persona by ID
   */
  getById(id: string): IPersona | undefined {
    return [...BASE_PERSONAS, ...SUPPLEMENTAL_PERSONAS].find(
      (p) => p.id === id
    );
  },

  /**
   * Get all base personas (6)
   */
  base(): IPersona[] {
    return [...BASE_PERSONAS];
  },

  /**
   * Get all supplemental personas (5)
   */
  supplemental(): IPersona[] {
    return [...SUPPLEMENTAL_PERSONAS];
  },

  /**
   * Get all personas (11)
   */
  all(): IPersona[] {
    return [...BASE_PERSONAS, ...SUPPLEMENTAL_PERSONAS];
  },

  /**
   * Get default persona for dev mode (Administrator)
   */
  default(): IPersona {
    return BASE_PERSONAS[0]; // Administrator
  },

  /**
   * Filter personas by tag
   */
  byTag(tag: string): IPersona[] {
    return this.all().filter((p) => p.tags.includes(tag));
  },

  /**
   * Filter personas by category
   */
  byCategory(category: 'base' | 'supplemental'): IPersona[] {
    return this.all().filter((p) => p.category === category);
  },

  /**
   * Get persona count
   */
  count(): number {
    return this.all().length;
  },
};

export type { IPersona };
```

---

## Production-Ready Code: `docs/reference/auth/personas.md`

```markdown
# Persona Registry Reference

This document describes all available personas in HB Intel for development and testing.

## Overview

The Persona Registry provides 11 predefined personas:
- **6 Base Personas**: Core business roles representing primary user types
- **5 Supplemental Personas**: Edge cases and special scenarios for testing

## Base Personas (6)

| Name | Email | Roles | Category | Use Case |
|------|-------|-------|----------|----------|
| Administrator | admin@hb-intel.local | Administrator, Manager | Admin | Full system access, user management, testing admin features |
| AccountingUser | accounting@hb-intel.local | AccountingUser | Finance | Invoice management, financial reports, accounting workflows |
| EstimatingUser | estimating@hb-intel.local | EstimatingUser | Estimating | Project estimation, quote management, estimation tools |
| ProjectUser | project@hb-intel.local | ProjectUser | Project | Project hub access, task tracking, team collaboration |
| Executive | executive@hb-intel.local | Executive, Manager | Management | High-level reporting, read-only access, approval workflows |
| Member | member@hb-intel.local | Member | Basic | Basic user, view-only access, limited permissions |

## Supplemental Personas (5)

| Name | Email | Roles | Category | Use Case |
|------|-------|-------|----------|----------|
| PendingOverride | pending-override@hb-intel.local | Member | Override Request | Testing temporary permission elevation |
| ExpiredSession | expired-session@hb-intel.local | AccountingUser | Session Management | Testing session expiration and re-authentication |
| MultiRole | multi-role@hb-intel.local | Accounting, Estimating, Project | Cross-Module | Testing users with multiple module roles |
| ReadOnly | read-only@hb-intel.local | Viewer | Read-Only | Testing read-only access and permission denial |
| DegradedMode | degraded-mode@hb-intel.local | Administrator | Maintenance | Testing degraded system states and fallback behaviors |

## Using Personas in Development

### Persona Switcher (Dev Toolbar)

1. Open the Dev Toolbar (bottom of screen, collapsible)
2. Click "Personas" tab
3. Select desired persona from list
4. App will simulate login as that persona

### Programmatic Access

```typescript
import { PERSONA_REGISTRY } from '@hbc/auth/dev';

// Get all personas
const allPersonas = PERSONA_REGISTRY.all();

// Get specific persona
const admin = PERSONA_REGISTRY.getById('persona-admin');

// Get default (Administrator)
const defaultPersona = PERSONA_REGISTRY.default();

// Filter by category
const basePersonas = PERSONA_REGISTRY.byCategory('base');
const edgeCases = PERSONA_REGISTRY.byCategory('supplemental');

// Filter by tag
const accounting = PERSONA_REGISTRY.byTag('accounting');
```

## Permission Matrix

### Accounting Module
- **AccountingUser**: Read, Write, Approve
- **Executive**: Read only
- **Administrator**: Read, Write, Delete, Approve
- **Others**: None (access denied)

### Estimating Module
- **EstimatingUser**: Read, Write, Approve
- **Executive**: Read only
- **Administrator**: Read, Write, Delete, Approve
- **Others**: None (access denied)

### Project Hub
- **ProjectUser**: Read, Write
- **Executive**: Read only
- **Administrator**: Read, Write, Delete
- **Member**: Read only
- **Others**: None (access denied)

### Admin Panel
- **Administrator**: Full access
- **Others**: None (access denied)

## Testing Scenarios

### Basic Happy Path
Use: **AccountingUser** or **ProjectUser**
- Test normal user workflow
- Verify standard permissions
- Confirm feature accessibility

### Admin Workflows
Use: **Administrator**
- Test admin-only features
- Verify user management
- Test system settings access

### Cross-Module Scenarios
Use: **MultiRole**
- Test users with multiple roles
- Verify permission intersection
- Test module switching

### Permission Denial
Use: **ReadOnly** or **Member**
- Test disabled buttons
- Verify error handling
- Confirm access denial messages

### Edge Cases
Use: **ExpiredSession**, **PendingOverride**, **DegradedMode**
- Test session restoration
- Test override workflows
- Test fallback behaviors

## Extending the Registry

To add new personas in the future:

1. Add persona object to `SUPPLEMENTAL_PERSONAS` array in `personaRegistry.ts`
2. Follow `IPersona` interface: id, name, email, roles, permissions, description, category, tags, usageExample
3. Update this reference document with new persona details
4. Add unit tests for new persona

Example:
```typescript
{
  id: 'persona-custom',
  name: 'CustomRole',
  email: 'custom@hb-intel.local',
  roles: ['CustomRole'],
  permissions: { /* ... */ },
  description: 'Description of this custom role',
  category: 'supplemental',
  tags: ['custom', 'testing'],
  usageExample: 'When to use this persona',
  created: Date.now(),
  updatedAt: Date.now(),
}
```
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry (this task)
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
9. PH5C.9 – ADR Updates
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

## 5.C.3 Success Criteria Checklist (Task 5C.3)

- [ ] 5.C.3.1 `personaRegistry.ts` created with all 11 personas (6 base + 5 supplemental)
- [ ] 5.C.3.2 All personas include: id, name, email, roles, permissions, description, category, tags, usageExample
- [ ] 5.C.3.3 Base personas represent core business roles (Admin, Accounting, Estimating, Project, Executive, Member)
- [ ] 5.C.3.4 Supplemental personas cover edge cases (PendingOverride, ExpiredSession, MultiRole, ReadOnly, DegradedMode)
- [ ] 5.C.3.5 PERSONA_REGISTRY exports methods: getById, base, supplemental, all, default, byTag, byCategory
- [ ] 5.C.3.6 All permissions align with registered features and authentication guard logic
- [ ] 5.C.3.7 Reference documentation `docs/reference/auth/personas.md` created with persona table and examples
- [ ] 5.C.3.8 Unit tests cover all query methods; ≥95% code coverage
- [ ] 5.C.3.9 No duplicate persona IDs; all personas have valid permission sets
- [ ] 5.C.3.10 `pnpm turbo run build --filter=@hbc/auth` succeeds; PersonaRegistry exports available

---

## Phase 5.C.3 Progress Notes

- 5.C.3.1 [PENDING] — PersonaRegistry creation with all personas
- 5.C.3.2 [PENDING] — Query method implementation
- 5.C.3.3 [PENDING] — Permission mapping
- 5.C.3.4 [PENDING] — Reference documentation

### Verification Evidence

- `pnpm turbo run build --filter=@hbc/auth` - [PENDING]
- `pnpm turbo run test --filter=@hbc/auth` - [PENDING]
- Coverage report ≥95% for personaRegistry - [PENDING]
- `docs/reference/auth/personas.md` exists and is complete - [PENDING]

---

**End of Task PH5C.3**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.3 created: 2026-03-07
PersonaRegistry specification complete with all 11 personas and query methods.
Next: PH5C.4 (DevToolbar)
-->
