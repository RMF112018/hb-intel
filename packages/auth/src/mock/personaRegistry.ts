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
