/**
 * @file mockAuth.ts
 * @description Mock authentication configuration for Storybook.
 *
 * This file defines the standard mock HB Intel user persona used across
 * all Storybook stories. All auth-dependent components see this user
 * when stories are rendered in Storybook.
 *
 * This is Storybook-only; mock users are NOT exported from @hbc/ui-kit
 * and are NOT available in production builds.
 *
 * Traceability:
 * - PH4C.9 §4C.9
 * - D-PH4C-15 (Dev Auth Bypass scope)
 * - D-PH4C-16 (No production leak boundary)
 */

import type { ICurrentUser } from '@hbc/models';

/**
 * Standard mock HB Intel developer user.
 *
 * Roles: Estimator + ProjectManager (typical power user).
 * Permissions: view projects, create/edit estimates, view reports.
 *
 * This persona covers most story requirements. For role-specific testing,
 * use the alternate personas below.
 */
export const STORYBOOK_MOCK_USER: ICurrentUser = {
  id: 'storybook-dev-user-001',
  displayName: 'HB Dev User',
  email: 'dev.user@hbcorp.com',
  roles: [
    {
      id: 'role-estimator',
      name: 'Estimator',
      permissions: [
        'view:projects',
        'edit:estimates',
        'view:reports',
        'create:estimates',
      ],
    },
    {
      id: 'role-project-manager',
      name: 'ProjectManager',
      permissions: [
        'view:projects',
        'manage:team',
        'create:proposals',
        'view:reports',
      ],
    },
  ],
};

/**
 * Alternative personas for role-specific testing.
 * Use as needed from Storybook-only decorators/stories.
 */
export const ADMIN_PERSONA: ICurrentUser = {
  id: 'storybook-admin-001',
  displayName: 'Admin User',
  email: 'admin@hbcorp.com',
  roles: [
    {
      id: 'role-system-admin',
      name: 'SystemAdmin',
      permissions: [
        'view:all',
        'edit:all',
        'manage:users',
        'manage:permissions',
        'view:audit-logs',
      ],
    },
    {
      id: 'role-estimator',
      name: 'Estimator',
      permissions: ['view:projects', 'edit:estimates', 'create:estimates'],
    },
    {
      id: 'role-project-manager',
      name: 'ProjectManager',
      permissions: ['view:projects', 'manage:team', 'create:proposals'],
    },
    {
      id: 'role-field-user',
      name: 'FieldUser',
      permissions: ['view:projects', 'report:daily-logs'],
    },
  ],
};

export const FIELD_USER_PERSONA: ICurrentUser = {
  id: 'storybook-field-001',
  displayName: 'Field User',
  email: 'field.user@hbcorp.com',
  roles: [
    {
      id: 'role-field-user',
      name: 'FieldUser',
      permissions: ['view:projects', 'view:estimates', 'report:daily-logs'],
    },
  ],
};

export const ESTIMATOR_PERSONA: ICurrentUser = {
  id: 'storybook-estimator-001',
  displayName: 'Estimator User',
  email: 'estimator@hbcorp.com',
  roles: [
    {
      id: 'role-estimator',
      name: 'Estimator',
      permissions: [
        'view:projects',
        'edit:estimates',
        'view:reports',
        'create:estimates',
      ],
    },
  ],
};
