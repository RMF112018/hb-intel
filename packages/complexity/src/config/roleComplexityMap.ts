import type { IRoleComplexityConfig } from '../types/IComplexity';

/**
 * Role-to-complexity-tier mapping config (D-02).
 *
 * Edit this file to change the initial tier assigned to user groups on first login.
 * Changes take effect on the next first login for new users — existing users are unaffected
 * (their preference is already stored).
 *
 * Mappings are evaluated in order — first match wins.
 * The adGroup value must match the Azure AD security group display name exactly.
 *
 * To add a new role mapping:
 * 1. Add an entry to the `mappings` array below.
 * 2. Commit the change — no code deploy required beyond the config update.
 * 3. Document the change in docs/how-to/administrator/complexity-role-mapping.md.
 */
export const ROLE_COMPLEXITY_CONFIG: IRoleComplexityConfig = {
  mappings: [
    // ── Essential tier ──────────────────────────────────────────────────
    {
      adGroup: 'HBC-NewHire',
      initialTier: 'essential',
      description: 'New hires (< 90 days) — maximum coaching and simplified views',
    },
    {
      adGroup: 'HBC-FieldStaff',
      initialTier: 'essential',
      description: 'Field staff who primarily review, not manage, records',
    },
    {
      adGroup: 'HBC-Reviewer',
      initialTier: 'essential',
      description: 'External reviewers and occasional users',
    },

    // ── Standard tier ───────────────────────────────────────────────────
    {
      adGroup: 'HBC-ProjectCoordinator',
      initialTier: 'standard',
      description: 'Project coordinators — full operational view',
    },
    {
      adGroup: 'HBC-Admin',
      initialTier: 'expert',
      description: 'Administrative staff — full diagnostic and recovery view',
    },
    {
      adGroup: 'HBIntelAdmin',
      initialTier: 'expert',
      description: 'HB Intel admin users — full diagnostic and recovery view',
    },
    {
      adGroup: 'HBC-ProjectManager',
      initialTier: 'standard',
      description: 'Project managers — full working view',
    },
    {
      adGroup: 'HBC-Estimator',
      initialTier: 'standard',
      description: 'Estimating team — full working view',
    },
    {
      adGroup: 'HBC-BusinessDevelopment',
      initialTier: 'standard',
      description: 'Business development team — full working view',
    },

    // ── Expert tier ─────────────────────────────────────────────────────
    {
      adGroup: 'HBC-Director',
      initialTier: 'expert',
      description: 'Directors — full information density',
    },
    {
      adGroup: 'HBC-VP',
      initialTier: 'expert',
      description: 'Vice Presidents — full information density',
    },
    {
      adGroup: 'HBC-Executive',
      initialTier: 'expert',
      description: 'Executive leadership — full information density',
    },
  ],

  /** Tier assigned when the user's AD groups match none of the above */
  fallbackTier: 'standard',
};

/**
 * Derives the initial complexity tier for a user from their Azure AD group memberships.
 * Returns the first matching tier, or fallbackTier if no match found.
 *
 * @param adGroups - Array of AD group display names from the user's token claims
 */
export function deriveInitialTier(adGroups: string[]): 'essential' | 'standard' | 'expert' {
  for (const mapping of ROLE_COMPLEXITY_CONFIG.mappings) {
    if (adGroups.includes(mapping.adGroup)) {
      return mapping.initialTier;
    }
  }
  return ROLE_COMPLEXITY_CONFIG.fallbackTier;
}
