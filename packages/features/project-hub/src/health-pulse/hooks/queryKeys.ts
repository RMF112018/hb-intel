export const HEALTH_PULSE_QUERY_KEY_ROOT = ['project-health-pulse'] as const;

export const HEALTH_PULSE_ADMIN_CONFIG_QUERY_KEY = [
  ...HEALTH_PULSE_QUERY_KEY_ROOT,
  'admin-config',
] as const;

export const getProjectHealthPulseQueryKey = (projectId: string) =>
  [...HEALTH_PULSE_QUERY_KEY_ROOT, projectId] as const;
