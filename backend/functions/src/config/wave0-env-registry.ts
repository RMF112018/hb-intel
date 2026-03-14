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
    description: 'App registration client ID for backend identity',
    requiredInProd: true,
  },
  {
    name: 'AZURE_CLIENT_SECRET',
    bucket: 'infrastructure',
    description: 'App registration client secret (Key Vault in prod)',
    requiredInProd: true,
  },
  {
    name: 'AZURE_STORAGE_CONNECTION_STRING',
    bucket: 'infrastructure',
    description: 'Azure Storage connection string for table/blob/queue',
    requiredInProd: true,
  },
  {
    name: 'AzureSignalRConnectionString',
    bucket: 'infrastructure',
    description: 'SignalR Service connection string for real-time push',
    requiredInProd: true,
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
    description: 'Root SharePoint tenant URL',
    requiredInProd: true,
  },
  {
    name: 'SHAREPOINT_HUB_SITE_ID',
    bucket: 'infrastructure',
    description: 'Hub site GUID for site provisioning association',
    requiredInProd: true,
  },
  {
    name: 'EMAIL_DELIVERY_API_KEY',
    bucket: 'infrastructure',
    description: 'SendGrid API key for transactional email (Key Vault in prod)',
    requiredInProd: true,
  },
  {
    name: 'SHAREPOINT_APP_CATALOG_URL',
    bucket: 'infrastructure',
    description: 'Tenant or site-collection app catalog URL for SPFx deployment',
    requiredInProd: true,
  },

  // --- Infrastructure Behavioral (Bucket A) ---
  {
    name: 'HBC_ADAPTER_MODE',
    bucket: 'infrastructure',
    description: 'Adapter mode selector: live (production) or mock (local dev/test)',
    requiredInProd: true,
  },
  {
    name: 'HB_INTEL_SPFX_APP_ID',
    bucket: 'infrastructure',
    description: 'SPFx app package GUID for tenant-scoped deployment verification',
    requiredInProd: true,
  },
  {
    name: 'NOTIFICATION_API_BASE_URL',
    bucket: 'infrastructure',
    description: 'Base URL for notification dispatch endpoint',
    requiredInProd: true,
  },
  {
    name: 'EMAIL_FROM_ADDRESS',
    bucket: 'infrastructure',
    description: 'Sender address for transactional emails; must match verified sender',
    requiredInProd: true,
  },

  // --- Business-Operational (Bucket B) ---
  {
    name: 'OPEX_MANAGER_UPN',
    bucket: 'business',
    description: 'UPN of the OpEx manager for provisioning completion notifications',
    requiredInProd: true,
  },
  {
    name: 'CONTROLLER_UPNS',
    bucket: 'business',
    description: 'Comma-separated UPNs of controllers for financial oversight',
    requiredInProd: true,
  },
  {
    name: 'ADMIN_UPNS',
    bucket: 'business',
    description: 'Comma-separated UPNs of platform administrators',
    requiredInProd: true,
  },
  {
    name: 'DEPT_BACKGROUND_ACCESS_COMMERCIAL',
    bucket: 'business',
    description: 'UPN(s) granted background read access to Commercial department sites',
    requiredInProd: true,
    conditionalOn: 'department=commercial',
  },
  {
    name: 'DEPT_BACKGROUND_ACCESS_LUXURY_RESIDENTIAL',
    bucket: 'business',
    description: 'UPN(s) granted background read access to Luxury Residential department sites',
    requiredInProd: true,
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
] as const;
