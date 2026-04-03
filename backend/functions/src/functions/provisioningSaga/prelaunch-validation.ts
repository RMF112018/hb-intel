/**
 * P7-03: Prelaunch Dependency Validation — typed validation model.
 *
 * Provides structured, operator-meaningful validation of all provisioning
 * prerequisites before the saga launches. Returns a typed result with
 * categorized failure codes instead of throwing opaque error strings.
 *
 * Replaces the throw-only path in validateProvisioningPrerequisites() for
 * callers that need structured results (HTTP handler synchronous preflight).
 * The saga orchestrator uses assertPrelaunchReady() which preserves fail-fast
 * behavior via the same validation logic.
 */

import type { IProvisionSiteRequest } from '@hbc/models';
import { shouldValidateConfig } from '../../utils/validate-config.js';
import { diagnosePermissionModel } from '../../utils/diagnose-permissions.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Categories of prelaunch validation failure. */
export type PrelaunchFailureCategory =
  | 'environment'
  | 'request-data'
  | 'permission'
  | 'configuration'
  | 'bootstrap'
  | 'entra-readiness';

/** A single prelaunch validation failure with operator-meaningful context. */
export interface IPrelaunchFailure {
  /** Machine-readable failure code (e.g. 'MISSING_ENV_SHAREPOINT_TENANT_URL'). */
  code: string;
  /** Failure category for grouping and display. */
  category: PrelaunchFailureCategory;
  /** Human-readable description of what is wrong. */
  message: string;
  /** Operator-facing remediation guidance. */
  remediation: string;
}

/** Result of prelaunch validation. */
export interface IPrelaunchValidationResult {
  /** True when all checks pass and provisioning may proceed. */
  ok: boolean;
  /** List of failures — empty when ok is true. */
  failures: IPrelaunchFailure[];
}

// ---------------------------------------------------------------------------
// Prerequisite definitions
// ---------------------------------------------------------------------------

interface EnvPrerequisite {
  name: string;
  expected?: string;
  code: string;
  category: PrelaunchFailureCategory;
  message: string;
  remediation: string;
}

const ENV_PREREQUISITES: EnvPrerequisite[] = [
  {
    name: 'GRAPH_GROUP_PERMISSION_CONFIRMED',
    expected: 'true',
    code: 'ENV_GRAPH_PERMISSION_NOT_CONFIRMED',
    category: 'permission',
    message: 'Entra ID Group.ReadWrite.All permission has not been confirmed.',
    remediation: 'IT must confirm Group.ReadWrite.All is granted and set GRAPH_GROUP_PERMISSION_CONFIRMED=true. See IT-Department-Setup-Guide.md §8.4.',
  },
  {
    name: 'AZURE_TENANT_ID',
    code: 'MISSING_ENV_AZURE_TENANT_ID',
    category: 'environment',
    message: 'AZURE_TENANT_ID is not configured.',
    remediation: 'Set AZURE_TENANT_ID to the Entra ID tenant identifier in the function app configuration.',
  },
  {
    name: 'SHAREPOINT_TENANT_URL',
    code: 'MISSING_ENV_SHAREPOINT_TENANT_URL',
    category: 'environment',
    message: 'SHAREPOINT_TENANT_URL is not configured.',
    remediation: 'Set SHAREPOINT_TENANT_URL to the root SharePoint tenant URL (e.g. https://contoso.sharepoint.com).',
  },
  {
    name: 'SHAREPOINT_HUB_SITE_ID',
    code: 'MISSING_ENV_SHAREPOINT_HUB_SITE_ID',
    category: 'environment',
    message: 'SHAREPOINT_HUB_SITE_ID is not configured.',
    remediation: 'Set SHAREPOINT_HUB_SITE_ID to the hub site GUID for Step 7 association.',
  },
  {
    name: 'SHAREPOINT_APP_CATALOG_URL',
    code: 'MISSING_ENV_SHAREPOINT_APP_CATALOG_URL',
    category: 'environment',
    message: 'SHAREPOINT_APP_CATALOG_URL is not configured.',
    remediation: 'Set SHAREPOINT_APP_CATALOG_URL to the tenant app catalog URL for Step 5 SPFx installation.',
  },
  {
    name: 'HB_INTEL_SPFX_APP_ID',
    code: 'MISSING_ENV_HB_INTEL_SPFX_APP_ID',
    category: 'environment',
    message: 'HB_INTEL_SPFX_APP_ID is not configured.',
    remediation: 'Set HB_INTEL_SPFX_APP_ID to the SPFx app package GUID deployed in the app catalog.',
  },
  {
    name: 'OPEX_MANAGER_UPN',
    code: 'MISSING_ENV_OPEX_MANAGER_UPN',
    category: 'environment',
    message: 'OPEX_MANAGER_UPN is not configured.',
    remediation: 'Set OPEX_MANAGER_UPN to the OpEx manager UPN for Step 6 Leaders group membership.',
  },
];

/**
 * P7-07: Bootstrap/install prerequisites — environment signals that indicate
 * the install/bootstrap process completed its infrastructure setup.
 * These are separate from provisioning-specific env vars because they represent
 * upstream dependencies that the install orchestrator (P6-05/06/07) is expected to configure.
 */
const BOOTSTRAP_PREREQUISITES: EnvPrerequisite[] = [
  {
    name: 'AZURE_TABLE_ENDPOINT',
    code: 'BOOTSTRAP_MISSING_TABLE_ENDPOINT',
    category: 'bootstrap',
    message: 'Azure Table Storage endpoint is not configured.',
    remediation: 'Run the install/setup wizard to deploy Azure resources. Table Storage is configured during the "Deploy Azure Resources" install step.',
  },
  {
    name: 'AZURE_CLIENT_ID',
    code: 'BOOTSTRAP_MISSING_CLIENT_ID',
    category: 'bootstrap',
    message: 'Entra app registration client ID is not configured.',
    remediation: 'Run the install/setup wizard to create the Entra app registration. AZURE_CLIENT_ID is configured during the "Create Entra App Registration" install step.',
  },
  {
    name: 'API_AUDIENCE',
    code: 'BOOTSTRAP_MISSING_API_AUDIENCE',
    category: 'bootstrap',
    message: 'API audience is not configured.',
    remediation: 'Run the install/setup wizard. API_AUDIENCE is configured during the "Create Entra App Registration" install step.',
  },
  {
    name: 'APPLICATIONINSIGHTS_CONNECTION_STRING',
    code: 'BOOTSTRAP_MISSING_APP_INSIGHTS',
    category: 'bootstrap',
    message: 'Application Insights telemetry is not configured.',
    remediation: 'Run the install/setup wizard to deploy Azure resources. Application Insights is configured during the "Deploy Azure Resources" install step.',
  },
];

// ---------------------------------------------------------------------------
// Validation logic
// ---------------------------------------------------------------------------

/**
 * Validate all provisioning prerequisites and return a structured result.
 *
 * Checks:
 * 1. Environment prerequisites (env vars and permission flags)
 * 2. Sites.Selected conditional gate
 * 3. Request data completeness (fields required by the saga beyond HTTP handler basics)
 *
 * Skips environment checks in mock/test mode (request-data checks always run).
 */
export function validatePrelaunchReadiness(
  request: IProvisionSiteRequest,
): IPrelaunchValidationResult {
  const failures: IPrelaunchFailure[] = [];

  // --- Environment prerequisites (skip in mock/test) ---
  if (shouldValidateConfig()) {
    for (const prereq of ENV_PREREQUISITES) {
      const value = process.env[prereq.name];
      if (prereq.expected !== undefined) {
        if (value !== prereq.expected) {
          failures.push({
            code: prereq.code,
            category: prereq.category,
            message: prereq.message,
            remediation: prereq.remediation,
          });
        }
      } else if (!value) {
        failures.push({
          code: prereq.code,
          category: prereq.category,
          message: prereq.message,
          remediation: prereq.remediation,
        });
      }
    }

    // Sites.Selected conditional gate
    const { model } = diagnosePermissionModel();
    if (model === 'sites-selected' && process.env.SITES_SELECTED_GRANT_CONFIRMED !== 'true') {
      failures.push({
        code: 'ENV_SITES_SELECTED_GRANT_NOT_CONFIRMED',
        category: 'permission',
        message: 'Sites.Selected (Path A) is active but the per-site grant workflow has not been confirmed.',
        remediation:
          'IT must confirm the manual grant workflow (Option A2) is operational and set ' +
          'SITES_SELECTED_GRANT_CONFIRMED=true. See sites-selected-validation.md §3 and tools/grant-site-access.sh.',
      });
    }

    // P7-07: Bootstrap/install infrastructure prerequisites
    for (const prereq of BOOTSTRAP_PREREQUISITES) {
      const value = process.env[prereq.name];
      if (!value) {
        failures.push({
          code: prereq.code,
          category: prereq.category,
          message: prereq.message,
          remediation: prereq.remediation,
        });
      }
    }
  }

  // --- Request data completeness ---
  if (!request.projectId) {
    failures.push({
      code: 'REQUEST_MISSING_PROJECT_ID',
      category: 'request-data',
      message: 'projectId is required.',
      remediation: 'Ensure the provisioning request includes a valid projectId (UUID).',
    });
  }

  if (!request.projectNumber) {
    failures.push({
      code: 'REQUEST_MISSING_PROJECT_NUMBER',
      category: 'request-data',
      message: 'projectNumber is required.',
      remediation: 'Ensure the provisioning request includes a projectNumber in ##-###-## format.',
    });
  } else if (!/^\d{2}-\d{3}-\d{2}$/.test(request.projectNumber)) {
    failures.push({
      code: 'REQUEST_INVALID_PROJECT_NUMBER_FORMAT',
      category: 'request-data',
      message: `projectNumber "${request.projectNumber}" does not match the required ##-###-## format.`,
      remediation: 'Correct the projectNumber to match the ##-###-## format (e.g. 24-001-01).',
    });
  }

  if (!request.projectName) {
    failures.push({
      code: 'REQUEST_MISSING_PROJECT_NAME',
      category: 'request-data',
      message: 'projectName is required.',
      remediation: 'Ensure the provisioning request includes a projectName.',
    });
  }

  if (!request.triggeredBy) {
    failures.push({
      code: 'REQUEST_MISSING_TRIGGERED_BY',
      category: 'request-data',
      message: 'triggeredBy identity is required.',
      remediation: 'This field is normally populated from the JWT claims. Verify the auth middleware is functioning.',
    });
  }

  if (!request.submittedBy) {
    failures.push({
      code: 'REQUEST_MISSING_SUBMITTED_BY',
      category: 'request-data',
      message: 'submittedBy identity is required for provisioning notifications and audit.',
      remediation: 'Ensure the provisioning request includes the submittedBy UPN.',
    });
  }

  if (!request.groupMembers || request.groupMembers.length === 0) {
    failures.push({
      code: 'REQUEST_EMPTY_GROUP_MEMBERS',
      category: 'request-data',
      message: 'groupMembers must contain at least one team member UPN for Step 6 group creation.',
      remediation: 'Ensure the provisioning request includes at least one groupMembers entry.',
    });
  }

  // P7-07: Entra readiness — verify department viewer configuration when department is specified.
  // Step 6 calls getDepartmentBackgroundViewers() which reads DEPT_BACKGROUND_ACCESS_{DEPARTMENT}.
  // If the department is set but the env var is missing, viewers group creation proceeds silently
  // with an empty membership — this check surfaces the gap at prelaunch.
  if (request.department && shouldValidateConfig()) {
    const envKey = `DEPT_BACKGROUND_ACCESS_${request.department.toUpperCase().replace(/-/g, '_')}`;
    if (!process.env[envKey]) {
      failures.push({
        code: 'ENTRA_MISSING_DEPT_VIEWER_CONFIG',
        category: 'entra-readiness',
        message: `Department viewer UPN configuration (${envKey}) is not set for department "${request.department}".`,
        remediation:
          `Set ${envKey} to a comma-separated list of background viewer UPNs, or remove the department ` +
          'from the request if department-specific viewers are not needed. See entra-group-definitions.ts.',
      });
    }
  }

  return {
    ok: failures.length === 0,
    failures,
  };
}

/**
 * Assert that all prelaunch prerequisites are satisfied.
 *
 * Convenience wrapper for saga-orchestrator.ts: calls validatePrelaunchReadiness()
 * and throws an aggregated error if any failures exist. Preserves the fail-fast
 * contract from the original validateProvisioningPrerequisites().
 */
export function assertPrelaunchReady(request: IProvisionSiteRequest): IPrelaunchValidationResult {
  const result = validatePrelaunchReadiness(request);

  if (!result.ok) {
    const lines = result.failures.map(
      (f) => `  - [${f.code}] ${f.message} → ${f.remediation}`,
    );
    throw new Error(
      [
        `[PrelaunchValidation] ${result.failures.length} issue(s) must be resolved before provisioning:`,
        ...lines,
        '',
        'Provisioning cannot proceed until all prerequisites are met.',
        'See backend/functions/README.md "Provisioning Staging Gates" for the full checklist.',
      ].join('\n'),
    );
  }

  return result;
}
