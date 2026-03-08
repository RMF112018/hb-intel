import { resolveAuthMode } from '@hbc/auth';

/**
 * Resolves the base URL for the Project Hub webpart (D-PH7-BW-6).
 *
 * - SPFx mode: reads from `window._hbIntelProjectHubUrl` (set by tenant config),
 *   falls back to `/sites/project-hub`.
 * - Dev/mock mode: points to local project-hub dev server.
 */
export function resolveProjectHubUrl(): string {
  const mode = resolveAuthMode();
  if (mode === 'spfx') {
    return (window as Window & { _hbIntelProjectHubUrl?: string })._hbIntelProjectHubUrl
      ?? '/sites/project-hub';
  }
  return 'http://localhost:4003';
}
