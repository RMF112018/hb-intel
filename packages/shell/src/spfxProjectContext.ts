/**
 * Phase 3 Stage 4.2 — SPFx host-aware project context resolution.
 *
 * Resolves project identity from the SharePoint site URL in SPFx webparts.
 * The caller fetches the registry record via `getBySiteUrl()` and passes
 * the result here for validation and context extraction.
 *
 * Governing: P3-B1 §2.3 (SPFx context resolution), §3 (context lifecycle)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Input / Output contracts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input for SPFx project context resolution.
 *
 * The caller is responsible for:
 * 1. Reading the site URL from `WebPartContext.pageContext.web.url`
 * 2. Calling `registryService.getBySiteUrl(siteUrl)`
 * 3. Passing the result here
 */
export interface SpfxProjectContextInput {
  /** The SharePoint site URL from the page context */
  siteUrl: string;
  /** Registry record resolved via getBySiteUrl (null if not found) */
  registryRecord: {
    projectId: string;
    projectName: string;
    projectNumber: string;
    department: string;
  } | null;
}

/**
 * Result of SPFx project context resolution.
 */
export interface SpfxProjectContextResult {
  /** Whether the project was successfully resolved */
  resolved: boolean;
  /** Canonical project ID (only set when resolved=true) */
  projectId?: string;
  /** Project display name (only set when resolved=true) */
  projectName?: string;
  /** Project number (only set when resolved=true) */
  projectNumber?: string;
  /** The site URL that was resolved */
  siteUrl: string;
  /** Whether the site URL was not found in the registry */
  notFound: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve SPFx project context from a site URL and pre-fetched registry record.
 *
 * Per P3-B1 §2.3: if the site URL is not in the registry, return not-found
 * — NEVER fabricate a project context.
 */
export function resolveSpfxProjectContext(
  input: SpfxProjectContextInput,
): SpfxProjectContextResult {
  const { siteUrl, registryRecord } = input;

  if (!siteUrl || !siteUrl.trim()) {
    return {
      resolved: false,
      siteUrl: siteUrl ?? '',
      notFound: true,
    };
  }

  if (!registryRecord) {
    return {
      resolved: false,
      siteUrl,
      notFound: true,
    };
  }

  return {
    resolved: true,
    projectId: registryRecord.projectId,
    projectName: registryRecord.projectName,
    projectNumber: registryRecord.projectNumber,
    siteUrl,
    notFound: false,
  };
}
