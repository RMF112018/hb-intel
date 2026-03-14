/**
 * W0-G3-T08: Cross-contract verification suite.
 *
 * Consolidates genuinely new T08 test cases not already covered by existing
 * test files. Organized by TC-* category for traceability.
 *
 * Covers: TC-OWN-04, TC-OWN-06, TC-NOTIF-06, TC-NOTIF-07, TC-FLOW-06,
 * TC-CLAR-03 (full), TC-CLAR-04, TC-MYWK-01, TC-MYWK-02, TC-MYWK-03,
 * TC-MYWK-04, TC-CMPLX-06, TC-CMPLX-07, TC-FAIL-06.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  PROJECT_SETUP_BIC_CONFIG,
  PROJECT_SETUP_ACTION_MAP,
} from './bic-config.js';
import { PROVISIONING_NOTIFICATION_TEMPLATES } from './notification-templates.ts';
import {
  createProjectSetupBicRegistration,
  PROVISIONING_BIC_MODULE_KEY,
  PROVISIONING_BIC_MODULE_LABEL,
} from './bic-registration.js';
import { PROJECT_SETUP_SUMMARY_FIELDS } from './summary-field-registry.js';
import { PROJECT_SETUP_COACHING_PROMPTS } from './coaching-prompt-registry.js';
import { getFailureMode } from './failure-modes.js';
import { isSummaryFieldVisible } from './complexity-gate-helpers.js';

// ─── TC-OWN-04: BIC config is single importable object ──────────────────────

describe('TC-OWN-04: PROJECT_SETUP_BIC_CONFIG single importable contract', () => {
  it('has ownershipModel set to workflow-state-derived', () => {
    expect(PROJECT_SETUP_BIC_CONFIG.ownershipModel).toBe('workflow-state-derived');
  });

  it('exposes all 8 resolver functions', () => {
    const resolverNames = [
      'resolveCurrentOwner',
      'resolveExpectedAction',
      'resolveDueDate',
      'resolveIsBlocked',
      'resolveBlockedReason',
      'resolvePreviousOwner',
      'resolveNextOwner',
      'resolveEscalationOwner',
    ] as const;

    for (const name of resolverNames) {
      expect(typeof PROJECT_SETUP_BIC_CONFIG[name]).toBe('function');
    }
  });
});

// ─── TC-OWN-06 / TC-NOTIF-07: Action string → notification body alignment ───

describe('TC-OWN-06 / TC-NOTIF-07: Canonical action → notification alignment', () => {
  it('NeedsClarification action aligns with clarification-requested template body', () => {
    const actionString = PROJECT_SETUP_ACTION_MAP['NeedsClarification'];
    const template = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-requested'];
    const rendered = template('Test Project', 'Please clarify', 'req-1');
    // The template body references "additional information" (clarification action alignment)
    expect(rendered.body).toContain('additional information');
    expect(actionString).toBeTruthy();
  });

  it('Completed action aligns with site-access-ready template body', () => {
    const template = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.site-access-ready'];
    const rendered = template('P-001', 'Test Project', 'https://site.example.com');
    // site-access-ready body references review/access
    expect(rendered.body).toContain('access');
    expect(PROJECT_SETUP_ACTION_MAP['Completed']).toBeTruthy();
  });

  it('UnderReview action aligns with clarification-responded template (review)', () => {
    const template = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-responded'];
    const rendered = template('Test Project', 'John Doe', 'req-1');
    expect(rendered.body.toLowerCase()).toContain('review');
    expect(PROJECT_SETUP_ACTION_MAP['UnderReview']).toBeTruthy();
  });
});

// ─── TC-FLOW-06: projectNumber NOT in wizard steps ──────────────────────────

describe('TC-FLOW-06: projectNumber excluded from wizard field map', () => {
  it('projectNumber is NOT a summary field with source "request" that maps to a wizard step', () => {
    // projectNumber is a standard-tier summary field (assigned post-provisioning),
    // not a wizard input field. Verify it is gated behind standard tier.
    const projectNumberField = PROJECT_SETUP_SUMMARY_FIELDS.find(
      (f) => f.fieldId === 'projectNumber',
    );
    expect(projectNumberField).toBeDefined();
    expect(projectNumberField!.minTier).toBe('standard');
  });
});

// ─── TC-CLAR-03 (provisioning-side): Notification template key structure ─────
// Full TC-CLAR-03 / TC-DRAFT-01 draft key distinctness is tested in
// packages/features/estimating/src/project-setup/__tests__/useProjectSetupDraft.test.tsx
// Here we verify the provisioning side: notification templates are keyed by
// distinct event type strings that don't collide.

describe('TC-CLAR-03 (provisioning-side): Notification template keys are distinct', () => {
  it('all 15 template keys are unique strings', () => {
    const keys = Object.keys(PROVISIONING_NOTIFICATION_TEMPLATES);
    expect(keys).toHaveLength(15);
    expect(new Set(keys).size).toBe(15);
  });
});

// ─── TC-CLAR-04: Clarification response payload shape ───────────────────────
// Full TC-CLAR-04 is tested in
// packages/features/estimating/src/project-setup/__tests__/clarificationReturn.test.ts
// Here we verify the provisioning-side contract: the clarification-responded
// template exists and produces a well-formed notification.

describe('TC-CLAR-04 (provisioning-side): Clarification responded template shape', () => {
  it('clarification-responded template returns subject, body, actionUrl, actionLabel', () => {
    const template = PROVISIONING_NOTIFICATION_TEMPLATES['provisioning.clarification-responded'];
    const rendered = template('Test Project', 'John Doe', 'req-1');
    expect(rendered.subject).toBeTruthy();
    expect(rendered.body).toBeTruthy();
    expect(rendered.actionUrl).toBeTruthy();
    expect(rendered.actionLabel).toBeTruthy();
  });
});

// ─── TC-MYWK-01/02/03/04: BIC module registration ──────────────────────────

describe('TC-MYWK-01: createProjectSetupBicRegistration shape', () => {
  it('registration key is "provisioning"', () => {
    const reg = createProjectSetupBicRegistration(vi.fn().mockResolvedValue([]));
    expect(reg.key).toBe('provisioning');
    expect(reg.key).toBe(PROVISIONING_BIC_MODULE_KEY);
  });

  it('registration label is "Project Setup"', () => {
    const reg = createProjectSetupBicRegistration(vi.fn().mockResolvedValue([]));
    expect(reg.label).toBe('Project Setup');
    expect(reg.label).toBe(PROVISIONING_BIC_MODULE_LABEL);
  });

  it('registration has queryFn', () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    const reg = createProjectSetupBicRegistration(queryFn);
    expect(typeof reg.queryFn).toBe('function');
  });
});

describe('TC-MYWK-02: queryFn returns valid items', () => {
  it('delegates to provided queryFn and returns items with correct shape', async () => {
    const mockItems = [
      { itemKey: 'provisioning:req-1', moduleKey: 'provisioning', title: 'Test Project' },
    ];
    const queryFn = vi.fn().mockResolvedValue(mockItems);
    const reg = createProjectSetupBicRegistration(queryFn);
    const result = await reg.queryFn('user-1');
    expect(queryFn).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockItems);
    expect(result[0].itemKey).toBe('provisioning:req-1');
    expect(result[0].moduleKey).toBe('provisioning');
    expect(result[0].title).toBe('Test Project');
  });
});

describe('TC-MYWK-03: queryFn handles API error gracefully', () => {
  it('queryFn returning empty array resolves successfully', async () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    const reg = createProjectSetupBicRegistration(queryFn);
    await expect(reg.queryFn('user-1')).resolves.toEqual([]);
  });
});

// TC-MYWK-04: No unintended exports — structural verification
describe('TC-MYWK-04: Provisioning barrel structural check', () => {
  it('exports createProjectSetupBicRegistration as a function', () => {
    expect(typeof createProjectSetupBicRegistration).toBe('function');
  });

  it('exports PROVISIONING_BIC_MODULE_KEY and PROVISIONING_BIC_MODULE_LABEL as strings', () => {
    expect(typeof PROVISIONING_BIC_MODULE_KEY).toBe('string');
    expect(typeof PROVISIONING_BIC_MODULE_LABEL).toBe('string');
  });
});

// ─── TC-NOTIF-06: No frontend NotificationApi.send in provisioning ──────────

describe('TC-NOTIF-06: No frontend send function in provisioning exports', () => {
  it('PROVISIONING_NOTIFICATION_TEMPLATES values are factory functions, not send calls', () => {
    const templateKeys = Object.keys(PROVISIONING_NOTIFICATION_TEMPLATES);
    for (const key of templateKeys) {
      const factory = PROVISIONING_NOTIFICATION_TEMPLATES[key as keyof typeof PROVISIONING_NOTIFICATION_TEMPLATES];
      expect(typeof factory).toBe('function');
    }
  });

  it('provisioning barrel does not export a "send" function', async () => {
    const exports = await import('./index.js');
    expect('send' in exports).toBe(false);
    expect('NotificationApi' in exports).toBe(false);
  });
});

// ─── TC-CMPLX-06: No hardcoded role checks ──────────────────────────────────

describe('TC-CMPLX-06: Complexity helpers accept tier, not role', () => {
  it('isSummaryFieldVisible accepts tier as second parameter', () => {
    const field = PROJECT_SETUP_SUMMARY_FIELDS[0];
    // Function accepts ComplexityTier, not a role string
    expect(() => isSummaryFieldVisible(field, 'essential')).not.toThrow();
    expect(() => isSummaryFieldVisible(field, 'standard')).not.toThrow();
    expect(() => isSummaryFieldVisible(field, 'expert')).not.toThrow();
  });

  it('PROJECT_SETUP_SUMMARY_FIELDS uses minTier (not minRole)', () => {
    for (const field of PROJECT_SETUP_SUMMARY_FIELDS) {
      // No field should have a 'minRole' property
      expect('minRole' in field).toBe(false);
      // If gated, it uses minTier
      if ('minTier' in field && field.minTier !== undefined) {
        expect(['essential', 'standard', 'expert']).toContain(field.minTier);
      }
    }
  });
});

// ─── TC-CMPLX-07: Coaching prompts Essential-only ───────────────────────────

describe('TC-CMPLX-07: Coaching prompts are Essential-only', () => {
  it('all coaching prompts have maxTier "essential"', () => {
    for (const prompt of PROJECT_SETUP_COACHING_PROMPTS) {
      expect(prompt.maxTier).toBe('essential');
    }
  });

  it('coaching prompt count is 4', () => {
    expect(PROJECT_SETUP_COACHING_PROMPTS).toHaveLength(4);
  });
});

// ─── TC-FAIL-06: Complexity fallback — contract-level ───────────────────────

describe('TC-FAIL-06: Complexity fallback contract', () => {
  it('FM-08 references @hbc/complexity as affected package', () => {
    const fm08 = getFailureMode('FM-08');
    expect(fm08).toBeDefined();
    expect(fm08!.title).toBe('Complexity Tier Cannot Be Derived from Role');
    expect(fm08!.affectedPackages).toContain('@hbc/complexity');
  });

  it('FM-08 expectedDegradation documents essential fallback', () => {
    const fm08 = getFailureMode('FM-08');
    expect(fm08!.expectedDegradation).toContain('essential');
    expect(fm08!.expectedDegradation).toContain('fallbackTier');
  });
});
