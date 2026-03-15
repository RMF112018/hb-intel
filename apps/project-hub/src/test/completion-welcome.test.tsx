import { describe, it } from 'vitest';

/**
 * W0-G4-T08: Deferred completion welcome card tests.
 * Blocked on IActiveProject.provisionedAt — see DashboardPage.tsx line 25.
 *
 * G4-T05-009 and G4-T05-010 require the DashboardPage to detect recently
 * provisioned projects and display a welcome card. This is not possible
 * until IActiveProject gains a provisionedAt field.
 */
describe('Completion welcome card (deferred)', () => {
  it.todo(
    'G4-T05-009: Hub welcome card shown within 7 days of provisioning — blocked on IActiveProject.provisionedAt',
  );

  it.todo(
    'G4-T05-010: Hub welcome card dismissable via session state — blocked on IActiveProject.provisionedAt',
  );
});
