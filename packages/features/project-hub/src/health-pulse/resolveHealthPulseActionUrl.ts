/**
 * P2-C4 §3, Pattern 3: Health Pulse → Project Hub navigation URL.
 * Produces a relative URL for project-significance escalation.
 * Same relative-path contract as buildActionUrl (P2-C2 §7).
 */

export function resolveHealthPulseActionUrl(projectId: string): string {
  return `/project-hub?projectId=${encodeURIComponent(projectId)}&view=health`;
}
