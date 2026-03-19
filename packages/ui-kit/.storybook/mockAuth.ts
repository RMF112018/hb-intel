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

import type { IInternalUser } from '@hbc/models';

/**
 * Standard mock HB Intel developer user.
 *
 * Roles: Estimator + ProjectManager (typical power user).
 * Grants: view projects, create/edit estimates, view reports.
 *
 * This persona covers most story requirements. For role-specific testing,
 * use the alternate personas below.
 */
export const STORYBOOK_MOCK_USER: IInternalUser = {
  type: 'internal',
  id: 'storybook-dev-user-001',
  displayName: 'HB Dev User',
  email: 'dev.user@hbcorp.com',
  roles: [
    {
      id: 'role-estimator',
      name: 'Estimator',
      grants: [
        'view:projects',
        'edit:estimates',
        'view:reports',
        'create:estimates',
      ],
      source: 'manual',
    },
    {
      id: 'role-project-manager',
      name: 'ProjectManager',
      grants: [
        'view:projects',
        'manage:team',
        'create:proposals',
        'view:reports',
      ],
      source: 'manual',
    },
  ],
};

/**
 * Alternative personas for role-specific testing.
 * Use as needed from Storybook-only decorators/stories.
 */
export const ADMIN_PERSONA: IInternalUser = {
  type: 'internal',
  id: 'storybook-admin-001',
  displayName: 'Admin User',
  email: 'admin@hbcorp.com',
  roles: [
    {
      id: 'role-system-admin',
      name: 'SystemAdmin',
      grants: [
        'view:all',
        'edit:all',
        'manage:users',
        'manage:permissions',
        'view:audit-logs',
      ],
      source: 'manual',
    },
    {
      id: 'role-estimator',
      name: 'Estimator',
      grants: ['view:projects', 'edit:estimates', 'create:estimates'],
      source: 'manual',
    },
    {
      id: 'role-project-manager',
      name: 'ProjectManager',
      grants: ['view:projects', 'manage:team', 'create:proposals'],
      source: 'manual',
    },
    {
      id: 'role-field-user',
      name: 'FieldUser',
      grants: ['view:projects', 'report:daily-logs'],
      source: 'manual',
    },
  ],
};

export const FIELD_USER_PERSONA: IInternalUser = {
  type: 'internal',
  id: 'storybook-field-001',
  displayName: 'Field User',
  email: 'field.user@hbcorp.com',
  roles: [
    {
      id: 'role-field-user',
      name: 'FieldUser',
      grants: ['view:projects', 'view:estimates', 'report:daily-logs'],
      source: 'manual',
    },
  ],
};

export const ESTIMATOR_PERSONA: IInternalUser = {
  type: 'internal',
  id: 'storybook-estimator-001',
  displayName: 'Estimator User',
  email: 'estimator@hbcorp.com',
  roles: [
    {
      id: 'role-estimator',
      name: 'Estimator',
      grants: [
        'view:projects',
        'edit:estimates',
        'view:reports',
        'create:estimates',
      ],
      source: 'manual',
    },
  ],
};
