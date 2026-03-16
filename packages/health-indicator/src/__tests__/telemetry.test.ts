import {
  createHealthIndicatorKpiSnapshot,
  getHealthIndicatorTelemetryView,
  healthIndicatorKpiEmitter,
  type IHealthIndicatorTelemetrySnapshot,
} from '../telemetry.js';

// ---------------------------------------------------------------------------
// createHealthIndicatorKpiSnapshot
// ---------------------------------------------------------------------------

describe('createHealthIndicatorKpiSnapshot', () => {
  const fixedTime = '2026-03-16T12:00:00.000Z';

  it('returns all null metrics when called with empty object', () => {
    const snapshot = createHealthIndicatorKpiSnapshot({}, fixedTime);

    expect(snapshot.timeToReadinessMs).toBeNull();
    expect(snapshot.blockerResolutionLatencyMs).toBeNull();
    expect(snapshot.readyToBidRate).toBeNull();
    expect(snapshot.submissionErrorRateReduction).toBeNull();
    expect(snapshot.checklistCes).toBeNull();
  });

  it('normalizes numeric values to 4 decimal places', () => {
    const snapshot = createHealthIndicatorKpiSnapshot(
      {
        timeToReadinessMs: 1234.56789012,
        readyToBidRate: 0.123456789,
      },
      fixedTime,
    );

    expect(snapshot.timeToReadinessMs).toBe(1234.5679);
    expect(snapshot.readyToBidRate).toBe(0.1235);
  });

  it('handles NaN values as null', () => {
    const snapshot = createHealthIndicatorKpiSnapshot(
      {
        timeToReadinessMs: NaN,
        blockerResolutionLatencyMs: NaN,
      },
      fixedTime,
    );

    expect(snapshot.timeToReadinessMs).toBeNull();
    expect(snapshot.blockerResolutionLatencyMs).toBeNull();
  });

  it('sets emittedAt timestamp', () => {
    const snapshot = createHealthIndicatorKpiSnapshot({}, fixedTime);
    expect(snapshot.emittedAt).toBe(fixedTime);
  });

  it('uses current time when emittedAt is not provided', () => {
    const before = new Date().toISOString();
    const snapshot = createHealthIndicatorKpiSnapshot({});
    const after = new Date().toISOString();

    expect(snapshot.emittedAt >= before).toBe(true);
    expect(snapshot.emittedAt <= after).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getHealthIndicatorTelemetryView
// ---------------------------------------------------------------------------

describe('getHealthIndicatorTelemetryView', () => {
  const fullSnapshot: IHealthIndicatorTelemetrySnapshot = {
    timeToReadinessMs: 5000,
    blockerResolutionLatencyMs: 3000,
    readyToBidRate: 0.85,
    submissionErrorRateReduction: 0.12,
    checklistCes: 4.5,
    emittedAt: '2026-03-16T12:00:00.000Z',
  };

  it('returns full snapshot for Expert complexity', () => {
    const view = getHealthIndicatorTelemetryView(fullSnapshot, {
      complexity: 'Expert',
      audience: 'canvas',
    });

    expect(view).toEqual(fullSnapshot);
  });

  it('returns full snapshot for admin audience regardless of complexity', () => {
    const view = getHealthIndicatorTelemetryView(fullSnapshot, {
      complexity: 'Essential',
      audience: 'admin',
    });

    expect(view).toEqual(fullSnapshot);
  });

  it('returns limited snapshot for Essential complexity (nulls out most fields)', () => {
    const view = getHealthIndicatorTelemetryView(fullSnapshot, {
      complexity: 'Essential',
      audience: 'canvas',
    });

    expect(view.timeToReadinessMs).toBeNull();
    expect(view.blockerResolutionLatencyMs).toBeNull();
    expect(view.submissionErrorRateReduction).toBeNull();
    expect(view.checklistCes).toBeNull();
    // readyToBidRate is preserved
    expect(view.readyToBidRate).toBe(0.85);
    expect(view.emittedAt).toBe(fullSnapshot.emittedAt);
  });

  it('returns Standard-level snapshot for Standard complexity', () => {
    const view = getHealthIndicatorTelemetryView(fullSnapshot, {
      complexity: 'Standard',
      audience: 'governance',
    });

    // Standard keeps all fields including checklistCes
    expect(view.timeToReadinessMs).toBe(5000);
    expect(view.blockerResolutionLatencyMs).toBe(3000);
    expect(view.readyToBidRate).toBe(0.85);
    expect(view.checklistCes).toBe(4.5);
    expect(view.emittedAt).toBe(fullSnapshot.emittedAt);
  });
});

// ---------------------------------------------------------------------------
// healthIndicatorKpiEmitter
// ---------------------------------------------------------------------------

describe('healthIndicatorKpiEmitter', () => {
  it('emit() stores snapshot and returns it', () => {
    const result = healthIndicatorKpiEmitter.emit({
      timeToReadinessMs: 2000,
      readyToBidRate: 0.9,
    });

    expect(result.timeToReadinessMs).toBe(2000);
    expect(result.readyToBidRate).toBe(0.9);
    expect(result.blockerResolutionLatencyMs).toBeNull();
  });

  it('getLatest() returns last emitted snapshot', () => {
    healthIndicatorKpiEmitter.emit({ readyToBidRate: 0.5 });
    healthIndicatorKpiEmitter.emit({ readyToBidRate: 0.75 });

    const latest = healthIndicatorKpiEmitter.getLatest();
    expect(latest.readyToBidRate).toBe(0.75);
  });

  it('getView() applies complexity/audience filtering', () => {
    healthIndicatorKpiEmitter.emit({
      timeToReadinessMs: 1000,
      readyToBidRate: 0.6,
      checklistCes: 3.2,
    });

    const view = healthIndicatorKpiEmitter.getView({
      complexity: 'Essential',
      audience: 'canvas',
    });

    expect(view.timeToReadinessMs).toBeNull();
    expect(view.readyToBidRate).toBe(0.6);
    expect(view.checklistCes).toBeNull();
  });

  it('reset() clears to default empty snapshot', () => {
    healthIndicatorKpiEmitter.emit({ readyToBidRate: 0.95 });
    healthIndicatorKpiEmitter.reset();

    const latest = healthIndicatorKpiEmitter.getLatest();
    expect(latest.readyToBidRate).toBeNull();
    expect(latest.timeToReadinessMs).toBeNull();
    expect(latest.blockerResolutionLatencyMs).toBeNull();
  });
});
