import { describe, expect, it } from 'vitest';

import {
  HEALTH_PULSE_COMPONENTS_SCOPE,
  HEALTH_PULSE_CONFIDENCE_SCOPE,
  HEALTH_PULSE_COMPOUND_RISK_SCOPE,
  HEALTH_PULSE_GOVERNANCE_SCOPE,
  HEALTH_PULSE_HOOKS_SCOPE,
  HEALTH_PULSE_OFFICE_SUPPRESSION_SCOPE,
  HEALTH_PULSE_RECOMMENDATION_SCOPE,
  HEALTH_PULSE_TELEMETRY_SCOPE,
  type IProjectHealthPulse,
} from '../../index.js';
import { createMockProjectHealthPulseSnapshot } from '../../../testing/index.js';

describe('SF21 scaffold boundaries', () => {
  it('exposes explicit health-pulse boundary scopes', () => {
    expect(HEALTH_PULSE_CONFIDENCE_SCOPE).toBe('health-pulse/confidence');
    expect(HEALTH_PULSE_COMPOUND_RISK_SCOPE).toBe('health-pulse/compound-risk');
    expect(HEALTH_PULSE_RECOMMENDATION_SCOPE).toBe('health-pulse/recommendation');
    expect(HEALTH_PULSE_OFFICE_SUPPRESSION_SCOPE).toBe('health-pulse/office-suppression');
    expect(HEALTH_PULSE_GOVERNANCE_SCOPE).toBe('health-pulse/governance');
    expect(HEALTH_PULSE_TELEMETRY_SCOPE).toBe('health-pulse/telemetry');
    expect(HEALTH_PULSE_HOOKS_SCOPE).toBe('health-pulse/hooks');
    expect(HEALTH_PULSE_COMPONENTS_SCOPE).toBe('health-pulse/components');
  });

  it('exposes deterministic testing fixtures through the public testing entrypoint', () => {
    const snapshot: IProjectHealthPulse = createMockProjectHealthPulseSnapshot();

    expect(snapshot.projectId).toBe('project-sf21-fixture');
    expect(snapshot.dimensions.field.label).toBe('Field');
    expect(snapshot.explainability.whyThisStatus[0]).toBe('SF21-T02 deterministic fixture');
  });
});
