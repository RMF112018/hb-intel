/**
 * SignalR affects only operationalReadiness in health/ready (computeReadiness),
 * not Safety rollout gates (safetyRolloutReadiness).
 *
 * Default remains strict: missing AzureSignalRConnectionString keeps the SignalR
 * dimension unsatisfied (operational tier stays degraded when other tiers are ready).
 *
 * Set OPERATIONAL_READINESS_SIGNALR_MODE=optional only when operators explicitly
 * accept degraded integrations.signalR while pursuing Safety-only closure.
 */
export function isSignalRAcceptableForOperationalTier(): boolean {
  const mode = (process.env.OPERATIONAL_READINESS_SIGNALR_MODE ?? 'required').toLowerCase().trim();
  if (mode === 'optional') {
    return true;
  }
  const v = process.env.AzureSignalRConnectionString;
  return v !== undefined && String(v).trim() !== '';
}
