/**
 * Wave 0 Environment Configuration Registry
 *
 * Typed registry of all environment variables required by Wave 0 backend functions.
 * Used by validate-config.ts (G2.6) to perform fail-fast startup validation.
 *
 * Two governance buckets:
 *   - infrastructure: Managed by platform/DevOps (Terraform, Key Vault, CI/CD)
 *   - business: Managed by product owner/admin (application settings)
 *
 * Reference: docs/reference/configuration/wave-0-config-registry.md
 */

/** Governance bucket classification for environment settings. */
export type ConfigBucket = 'infrastructure' | 'business';

/** Metadata for a single environment configuration entry. */
export interface IConfigEntry {
  /** Environment variable name (e.g., AZURE_TENANT_ID). */
  name: string;
  /** Governance bucket: infrastructure-controlled or business-controlled. */
  bucket: ConfigBucket;
  /** Human-readable description of the setting's purpose. */
  description: string;
  /** Whether this setting must be present in production environments. */
  requiredInProd: boolean;
  /** If present, this setting is only required when the named setting has a specific value. */
  conditionalOn?: string;
}

/**
 * Required configuration entries for Wave 0.
 * These must be present in production; validate-config checks them at startup.
 */
export const WAVE0_REQUIRED_CONFIG: readonly IConfigEntry[] = [
  // --- Infrastructure Connection (Bucket A) ---
  {
    name: 'AZURE_TENANT_ID',
    bucket: 'infrastructure',
    description: 'Entra ID tenant identifier',
    requiredInProd: true,
  },
  {
    name: 'AZURE_CLIENT_ID',
    bucket: 'infrastructure',
    description: 'Managed identity client ID (read by DefaultAzureCredential for outbound Azure resource auth). Also used as inbound API audience fallback when API_AUDIENCE is not set.',
    requiredInProd: true,
  },
  {
    name: 'AZURE_CLIENT_SECRET',
    bucket: 'infrastructure',
    description: 'App registration client secret (Key Vault in prod). Not required when using managed identity with DefaultAzureCredential.',
    requiredInProd: false,
  },
  {
    name: 'AZURE_TABLE_ENDPOINT',
    bucket: 'infrastructure',
    description: 'App-data Table Storage endpoint URL (production) or connection string (local dev)',
    requiredInProd: true,
  },
  {
    name: 'AzureSignalRConnectionString',
    bucket: 'infrastructure',
    description: 'SignalR Service connection string for real-time push. Deferred: only needed for provisioning real-time updates.',
    requiredInProd: false,
  },
  {
    name: 'APPLICATIONINSIGHTS_CONNECTION_STRING',
    bucket: 'infrastructure',
    description: 'Application Insights telemetry ingestion',
    requiredInProd: true,
  },
  {
    name: 'SHAREPOINT_TENANT_URL',
    bucket: 'infrastructure',
    description: 'Root SharePoint tenant URL (e.g. https://hedrickbrotherscom.sharepoint.com)',
    requiredInProd: true,
  },
  {
    name: 'SHAREPOINT_PROJECTS_SITE_URL',
    bucket: 'infrastructure',
    description: 'SharePoint site URL hosting the Projects list (e.g. https://hedrickbrotherscom.sharepoint.com/sites/HBCentral). Falls back to SHAREPOINT_TENANT_URL if not set.',
    requiredInProd: true,
  },
  {
    name: 'SHAREPOINT_HUB_SITE_ID',
    bucket: 'infrastructure',
    description: 'Hub site GUID for site provisioning association. Deferred: only needed for provisioning saga Step 7.',
    requiredInProd: false,
  },
  {
    name: 'EMAIL_DELIVERY_API_KEY',
    bucket: 'infrastructure',
    description: 'SendGrid API key for transactional email (Key Vault in prod). Deferred: only needed for email notifications.',
    requiredInProd: false,
  },
  {
    name: 'SHAREPOINT_APP_CATALOG_URL',
    bucket: 'infrastructure',
    description: 'Tenant or site-collection app catalog URL for SPFx deployment. Deferred: only needed for provisioning saga Step 5.',
    requiredInProd: false,
  },

  // --- Infrastructure Behavioral (Bucket A) ---
  {
    name: 'HBC_ADAPTER_MODE',
    bucket: 'infrastructure',
    description: 'Adapter mode: proxy (production) or mock (local dev/test). Legacy value "real" is accepted as alias for "proxy".',
    requiredInProd: true,
  },
  {
    name: 'HB_INTEL_SPFX_APP_ID',
    bucket: 'infrastructure',
    description: 'SPFx app package GUID for tenant-scoped deployment verification. Deferred: only needed for provisioning saga Step 5.',
    requiredInProd: false,
  },
  {
    name: 'NOTIFICATION_API_BASE_URL',
    bucket: 'infrastructure',
    description: 'Base URL for notification dispatch endpoint. Deferred: has localhost fallback; not consumed by Project Setup request lifecycle.',
    requiredInProd: false,
  },
  {
    name: 'EMAIL_FROM_ADDRESS',
    bucket: 'infrastructure',
    description: 'Sender address for transactional emails. Deferred: only needed for email notifications, not for Project Setup request lifecycle.',
    requiredInProd: false,
  },

  // --- Permission Confirmation Gates (Bucket A) ---
  {
    name: 'GRAPH_GROUP_PERMISSION_CONFIRMED',
    bucket: 'infrastructure',
    description:
      'Must be "true" after IT grants Group.ReadWrite.All to the Managed Identity. ' +
      'Provisioning Step 6 (Entra group creation and membership) is blocked until confirmed. ' +
      'See IT-Department-Setup-Guide.md §8.4. Deferred: only needed for provisioning saga.',
    requiredInProd: false,
  },

  // --- Business-Operational (Bucket B) ---
  {
    name: 'OPEX_MANAGER_UPN',
    bucket: 'business',
    description: 'UPN of the OpEx manager for provisioning saga Step 6. Deferred: only needed for provisioning, not for Project Setup request lifecycle.',
    requiredInProd: false,
  },
  {
    name: 'CONTROLLER_UPNS',
    bucket: 'business',
    description: 'Comma-separated UPNs of controllers for financial oversight. Has safe empty fallback; missing value degrades role resolution to submitter-only.',
    requiredInProd: false,
  },
  {
    name: 'ADMIN_UPNS',
    bucket: 'business',
    description: 'Comma-separated UPNs of platform administrators. Has safe empty fallback; missing value degrades role resolution to submitter-only.',
    requiredInProd: false,
  },
  {
    name: 'DEPT_BACKGROUND_ACCESS_COMMERCIAL',
    bucket: 'business',
    description: 'UPN(s) granted background read access to Commercial department sites. Deferred: only needed for provisioning.',
    requiredInProd: false,
    conditionalOn: 'department=commercial',
  },
  {
    name: 'DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL',
    bucket: 'business',
    description: 'UPN(s) granted background read access to Luxury Residential department sites. Deferred: only needed for provisioning.',
    requiredInProd: false,
    conditionalOn: 'department=luxury-residential',
  },
] as const;

/**
 * Optional configuration entries for Wave 0.
 * These have sensible defaults or are only needed in specific environments.
 */
export const WAVE0_OPTIONAL_CONFIG: readonly IConfigEntry[] = [
  // --- Local Dev Only (Bucket A) ---
  {
    name: 'AzureWebJobsStorage',
    bucket: 'infrastructure',
    description: 'Azure Functions host storage; UseDevelopmentStorage=true locally',
    requiredInProd: false,
  },
  {
    name: 'FUNCTIONS_WORKER_RUNTIME',
    bucket: 'infrastructure',
    description: 'Functions runtime identifier; always node',
    requiredInProd: false,
  },
  {
    name: 'WEBSITE_NODE_DEFAULT_VERSION',
    bucket: 'infrastructure',
    description: 'Node.js version hint; ~20',
    requiredInProd: false,
  },

  // --- Auth Split (Bucket A) ---
  {
    name: 'API_AUDIENCE',
    bucket: 'infrastructure',
    description:
      'Explicit inbound API audience for JWT validation (e.g. api://<app-registration-client-id>). ' +
      'When set, overrides the default api://${AZURE_CLIENT_ID} audience. Required when the managed ' +
      'identity client ID differs from the app registration client ID.',
    requiredInProd: false,
  },

  // --- Infrastructure Behavioral Optional (Bucket A) ---
  {
    name: 'PROVISIONING_STEP5_TIMEOUT_MS',
    bucket: 'infrastructure',
    description: 'Step 5 timeout override in milliseconds; defaults to 90000',
    requiredInProd: false,
  },
  {
    name: 'STRUCTURAL_OWNER_UPNS',
    bucket: 'business',
    description: 'Comma-separated UPNs of structural owners; empty if none',
    requiredInProd: false,
  },
  {
    name: 'SITES_PERMISSION_MODEL',
    bucket: 'infrastructure',
    description:
      'Permission model for SharePoint site access: sites-selected (default, Path A) or fullcontrol (Path B fallback, requires ADR)',
    requiredInProd: false,
  },

] as const;
