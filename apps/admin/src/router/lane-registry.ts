/**
 * P5-02: Canonical lane registry for the Admin operator console.
 *
 * This is the single source of truth for lane metadata, route paths,
 * navigation labels, and ordering. All navigation rendering and route
 * definitions should derive from this registry.
 */

/** Lane status indicates whether the lane has real content or is a scaffold placeholder. */
export type LaneStatus = 'active' | 'scaffold';

/** A single operator-console lane definition. */
export interface LaneDefinition {
  /** Unique lane identifier (kebab-case). */
  readonly id: string;
  /** Route path (must start with /). */
  readonly path: string;
  /** Navigation label shown in the operator-console shell. */
  readonly label: string;
  /** Sort order in navigation (lower = higher). */
  readonly order: number;
  /** Whether the lane has real page content or is a placeholder. */
  readonly status: LaneStatus;
  /** Permission required to access this lane (undefined = no guard). */
  readonly permission: string | undefined;
  /** Whether this lane accepts search params (e.g., ?projectId=). */
  readonly hasSearchParams: boolean;
  /** Which phase delivers the content for scaffold lanes. */
  readonly deliversIn?: string;
  /** Short description for scaffold empty states. */
  readonly scaffoldMessage?: string;
}

/** Permission required for all admin lanes (except index redirect). */
const ADMIN_PERMISSION = 'admin:access-control:view';

/**
 * Canonical lane definitions, ordered by operator workflow priority.
 *
 * Lane set frozen by P5-02 route taxonomy:
 * - Setup / Install, Validation, Runs / History, SharePoint Control,
 *   Entra Control, Standards / Config, Health / Alerts, Error / Audit
 */
export const LANES: readonly LaneDefinition[] = [
  {
    id: 'setup',
    path: '/setup',
    label: 'Setup',
    order: 1,
    status: 'scaffold',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
    deliversIn: 'Phase 6',
    scaffoldMessage: 'Backend install and bootstrap will be available here.',
  },
  {
    id: 'validation',
    path: '/validation',
    label: 'Validation',
    order: 2,
    status: 'scaffold',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
    deliversIn: 'Phase 7',
    scaffoldMessage: 'Pre-execution validation checks will be available here.',
  },
  {
    id: 'runs',
    path: '/runs',
    label: 'Runs',
    order: 3,
    status: 'active',
    permission: ADMIN_PERMISSION,
    hasSearchParams: true,
  },
  {
    id: 'sharepoint',
    path: '/sharepoint',
    label: 'SharePoint',
    order: 4,
    status: 'scaffold',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
    deliversIn: 'Phase 7',
    scaffoldMessage: 'SharePoint site and app catalog operations will be available here.',
  },
  {
    id: 'entra',
    path: '/entra',
    label: 'Entra',
    order: 5,
    status: 'scaffold',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
    deliversIn: 'Phase 9',
    scaffoldMessage: 'Entra ID app registration and permission management will be available here.',
  },
  {
    id: 'config',
    path: '/config',
    label: 'Config',
    order: 6,
    status: 'active',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
  },
  {
    id: 'health',
    path: '/health',
    label: 'Health',
    order: 7,
    status: 'active',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
  },
  {
    id: 'errors',
    path: '/errors',
    label: 'Errors',
    order: 8,
    status: 'scaffold',
    permission: ADMIN_PERMISSION,
    hasSearchParams: false,
    deliversIn: 'SF17-T05',
    scaffoldMessage: 'Error logging and audit trail will be available here.',
  },
] as const;

/** Legacy routes that redirect to new lane paths for backward compatibility. */
export interface LegacyRedirect {
  /** Old route path. */
  readonly from: string;
  /** New lane route path. */
  readonly to: string;
  /** Whether search params should be preserved through the redirect. */
  readonly preserveSearch: boolean;
}

export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  { from: '/provisioning-failures', to: '/runs', preserveSearch: true },
  { from: '/dashboards', to: '/health', preserveSearch: false },
  { from: '/error-log', to: '/errors', preserveSearch: false },
] as const;

/** Get a lane definition by its id. */
export function getLane(id: string): LaneDefinition | undefined {
  return LANES.find((lane) => lane.id === id);
}

/** Get all lanes sorted by navigation order. */
export function getNavigationLanes(): readonly LaneDefinition[] {
  return LANES;
}

/** Get only lanes with active content. */
export function getActiveLanes(): readonly LaneDefinition[] {
  return LANES.filter((lane) => lane.status === 'active');
}

/** Get only scaffold (placeholder) lanes. */
export function getScaffoldLanes(): readonly LaneDefinition[] {
  return LANES.filter((lane) => lane.status === 'scaffold');
}
