/**
 * Admin Control Plane — action identifier types.
 *
 * @module admin-control-plane
 */

import type { AdminDomain, AdminExecutionMode, AdminRiskLevel } from './AdminEnums.js';

/**
 * Scoped action identifier: `domain:action-family:verb`.
 *
 * Examples:
 * - `provisioning-rollout:saga:launch`
 * - `entra-control:group:create`
 * - `sharepoint-control:site:repair`
 * - `standards-config:config:apply`
 */
export type AdminActionKey = `${AdminDomain}:${string}:${string}`;

/**
 * Descriptor for a registered admin action.
 *
 * Used in the action catalog to declare what the control plane can do,
 * what risk it carries, and how it should be executed.
 */
export interface IAdminActionDescriptor {
  /** Scoped action identifier */
  readonly key: AdminActionKey;

  /** Human-readable action label */
  readonly label: string;

  /** Brief description of what the action does */
  readonly description: string;

  /** Admin domain this action belongs to */
  readonly domain: AdminDomain;

  /** Action family within the domain (e.g., 'saga', 'group', 'site') */
  readonly family: string;

  /** Action verb (e.g., 'launch', 'create', 'repair', 'detect') */
  readonly verb: string;

  /** Default risk level for this action */
  readonly riskLevel: AdminRiskLevel;

  /** Default execution mode for this action */
  readonly executionMode: AdminExecutionMode;

  /** Whether this action supports preview/dry-run before execution */
  readonly supportsPreview: boolean;

  /** Implementation phase where this action is expected to be delivered */
  readonly targetPhase: number;
}
