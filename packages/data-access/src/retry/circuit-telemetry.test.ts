import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CircuitState,
  emitCircuitStateChange,
  emitCircuitFallbackUsed,
  type CircuitStateChangeEvent,
  type CircuitFallbackUsedEvent,
} from './circuit-telemetry.js';

describe('CircuitState enum', () => {
  it('has correct values', () => {
    expect(CircuitState.Closed).toBe('closed');
    expect(CircuitState.Open).toBe('open');
    expect(CircuitState.HalfOpen).toBe('half-open');
  });
});

describe('emitCircuitStateChange', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('emits circuit.state.change with all required fields', () => {
    const event: CircuitStateChangeEvent = {
      domain: 'leads',
      routeGroup: '/api/leads',
      previousState: CircuitState.Closed,
      newState: CircuitState.Open,
      correlationId: 'corr-123',
      environment: 'staging',
      failureCount: 5,
      windowDurationMs: 30000,
    };

    emitCircuitStateChange(event);

    expect(logSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(logged._telemetryType).toBe('customEvent');
    expect(logged.name).toBe('circuit.state.change');
    expect(logged.domain).toBe('leads');
    expect(logged.routeGroup).toBe('/api/leads');
    expect(logged.previousState).toBe('closed');
    expect(logged.newState).toBe('open');
    expect(logged.correlationId).toBe('corr-123');
    expect(logged.environment).toBe('staging');
    expect(logged.failureCount).toBe(5);
    expect(logged.windowDurationMs).toBe(30000);
  });

  it('emits half-open → closed transition', () => {
    emitCircuitStateChange({
      domain: 'projects',
      routeGroup: '/api/projects',
      previousState: CircuitState.HalfOpen,
      newState: CircuitState.Closed,
      correlationId: 'corr-456',
      environment: 'production',
      failureCount: 0,
      windowDurationMs: 60000,
    });

    const logged = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(logged.previousState).toBe('half-open');
    expect(logged.newState).toBe('closed');
  });
});

describe('emitCircuitFallbackUsed', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('emits circuit.fallback.used with cache fallback', () => {
    const event: CircuitFallbackUsedEvent = {
      domain: 'leads',
      routeGroup: '/api/leads',
      correlationId: 'corr-789',
      fallbackType: 'cache',
      environment: 'staging',
    };

    emitCircuitFallbackUsed(event);

    expect(logSpy).toHaveBeenCalledOnce();
    const logged = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(logged._telemetryType).toBe('customEvent');
    expect(logged.name).toBe('circuit.fallback.used');
    expect(logged.domain).toBe('leads');
    expect(logged.routeGroup).toBe('/api/leads');
    expect(logged.correlationId).toBe('corr-789');
    expect(logged.fallbackType).toBe('cache');
    expect(logged.environment).toBe('staging');
  });

  it('emits circuit.fallback.used with degraded fallback', () => {
    emitCircuitFallbackUsed({
      domain: 'schedule',
      routeGroup: '/api/projects/p1/schedules',
      correlationId: 'corr-abc',
      fallbackType: 'degraded',
      environment: 'production',
    });

    const logged = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(logged.fallbackType).toBe('degraded');
  });
});
