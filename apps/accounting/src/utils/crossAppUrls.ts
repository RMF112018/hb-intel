/**
 * W0-G4-T07: Cross-app URL helpers.
 * Returns null when the env var is missing so callers can degrade gracefully.
 */
export function getAdminAppUrl(): string | null {
  const raw = import.meta.env.VITE_ADMIN_APP_URL;
  if (!raw || typeof raw !== 'string') return null;
  try {
    new URL(raw);
    return raw.replace(/\/+$/, '');
  } catch {
    return null;
  }
}
