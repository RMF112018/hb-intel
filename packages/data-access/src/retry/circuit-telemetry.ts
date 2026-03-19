/**
 * P1-C3 §2.2.3: Circuit breaker telemetry contracts.
 *
 * Provides typed event interfaces and emission functions for circuit breaker
 * state transitions and fallback activation. The circuit breaker implementation
 * is D1 scope — these contracts are ready for D1 to call when the state machine
 * is wired.
 *
 * Events use the same structured `_telemetryType: 'customEvent'` pattern as
 * proxy.request.* events in ProxyHttpClient.
 */

// ─── Circuit State ───────────────────────────────────────────────────────────

export enum CircuitState {
  /** Normal operation — requests pass through. */
  Closed = 'closed',
  /** Circuit tripped — requests are rejected immediately. */
  Open = 'open',
  /** Probe period — limited requests allowed to test recovery. */
  HalfOpen = 'half-open',
}

// ─── Event Interfaces ────────────────────────────────────────────────────────

export interface CircuitStateChangeEvent {
  /** Domain area (e.g., 'leads', 'schedule', 'auth'). */
  domain: string;
  /** Route group that the circuit protects (e.g., '/api/leads'). */
  routeGroup: string;
  /** State before the transition. */
  previousState: CircuitState;
  /** State after the transition. */
  newState: CircuitState;
  /** Correlation ID for request tracing. */
  correlationId: string;
  /** Deployment environment (e.g., 'staging', 'production'). */
  environment: string;
  /** Number of failures that triggered the transition (closed → open). */
  failureCount: number;
  /** Duration of the failure window in milliseconds. */
  windowDurationMs: number;
}

export interface CircuitFallbackUsedEvent {
  /** Domain area (e.g., 'leads', 'schedule'). */
  domain: string;
  /** Route group that the circuit protects. */
  routeGroup: string;
  /** Correlation ID for request tracing. */
  correlationId: string;
  /** Type of fallback activated. */
  fallbackType: 'cache' | 'degraded';
  /** Deployment environment. */
  environment: string;
}

// ─── Emission Functions ──────────────────────────────────────────────────────

/**
 * Emit a circuit.state.change telemetry event.
 * Called by D1 circuit breaker when the circuit transitions between states.
 *
 * Feeds the "Circuit Breaker Open" P1-severity alert rule (C3 §2.4).
 */
export function emitCircuitStateChange(event: CircuitStateChangeEvent): void {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      _telemetryType: 'customEvent',
      name: 'circuit.state.change',
      ...event,
    }),
  );
}

/**
 * Emit a circuit.fallback.used telemetry event.
 * Called by D1 circuit breaker when fallback behavior is activated
 * (serving cached data or degraded response while circuit is open).
 */
export function emitCircuitFallbackUsed(event: CircuitFallbackUsedEvent): void {
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify({
      _telemetryType: 'customEvent',
      name: 'circuit.fallback.used',
      ...event,
    }),
  );
}
