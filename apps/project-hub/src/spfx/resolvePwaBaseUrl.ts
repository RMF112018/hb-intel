interface ProjectHubWindow extends Window {
  _hbIntelPwaBaseUrl?: string;
}

export function resolvePwaBaseUrl(): string {
  const tenantConfigured = (window as ProjectHubWindow)._hbIntelPwaBaseUrl;
  if (tenantConfigured) {
    return tenantConfigured.replace(/\/+$/, '');
  }

  const envConfigured = import.meta.env.VITE_PWA_BASE_URL;
  if (envConfigured) {
    return envConfigured.replace(/\/+$/, '');
  }

  return window.location.origin.replace(/\/+$/, '');
}
