/**
 * @hbc/health-indicator
 *
 * Canonical health-indicator runtime ownership for profile resolution,
 * deterministic summary composition, and KPI telemetry projection.
 *
 * @design D-SF18-T06
 */
export { resolveHealthIndicatorProfileConfig, buildHealthIndicatorSummary, } from './runtime.js';
export { createHealthIndicatorKpiSnapshot, getHealthIndicatorTelemetryView, healthIndicatorKpiEmitter, } from './telemetry.js';
//# sourceMappingURL=index.js.map