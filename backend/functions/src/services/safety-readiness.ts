import {
  SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS,
  SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
  SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES,
} from '../config/safety-record-keeping-list-definitions.js';
import { formatSharePointTokenAcquisitionDiagnostic } from './managed-identity-token-service.js';
import { normalizeSiteUrl, toProvisioningErrorCode } from './sharepoint-common.js';
import { classifyIngestionFailure } from './safety-ingestion-failure-classifier.js';
import type { IGraphListDiscoveryService } from './graph-list-discovery-service.js';
import type {
  ISafetyProvisionDiagnostic,
  ISafetyReferenceListValidationResult,
} from './safety-provisioning-types.js';

/**
 * Safety-scoped readiness/validation helpers shared by the Safety provisioning
 * and Safety ingestion application services. These functions do not mutate
 * SharePoint state — they inspect configuration and Graph discovery results
 * to decide whether downstream work can proceed safely.
 */

/**
 * Verifies authoritative Safety/HBCentral site targets against repo constants
 * and environment overrides. Returns `null` and populates diagnostics when
 * the configuration is unsafe to use.
 */
export function resolveSafetyProvisioningTargets(
  diagnostics: ISafetyProvisionDiagnostic[],
): { safetySiteUrl: string; hbCentralSiteUrl: string } | null {
  const expected = SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS;
  const expectedSafety = normalizeSiteUrl(expected.safetySiteUrl);
  const expectedHbCentral = normalizeSiteUrl(expected.hbCentralSiteUrl);

  if (expectedSafety.pathname !== '/sites/safety') {
    diagnostics.push({
      code: 'INVALID_SAFETY_SITE_CONSTANT',
      message: `Expected Safety site path to be /sites/Safety, found ${expected.safetySiteUrl}`,
    });
  }
  if (expectedHbCentral.pathname !== '/sites/hbcentral') {
    diagnostics.push({
      code: 'INVALID_HBCENTRAL_SITE_CONSTANT',
      message: `Expected HBCentral site path to be /sites/HBCentral, found ${expected.hbCentralSiteUrl}`,
    });
  }
  if (expectedSafety.origin !== expectedHbCentral.origin) {
    diagnostics.push({
      code: 'SITE_ORIGIN_MISMATCH',
      message:
        'Safety and HBCentral site constants do not share the same SharePoint tenant origin.',
    });
  }

  const configuredProjectsSite = process.env.SHAREPOINT_PROJECTS_SITE_URL?.trim();
  if (configuredProjectsSite) {
    const configured = normalizeSiteUrl(configuredProjectsSite);
    if (configured.href !== expectedHbCentral.href) {
      diagnostics.push({
        code: 'SHAREPOINT_PROJECTS_SITE_URL_CONFLICT',
        message:
          `SHAREPOINT_PROJECTS_SITE_URL is ${configuredProjectsSite}, expected ${expected.hbCentralSiteUrl} for bounded Safety provisioning.`,
      });
    }
  }

  const configuredTenantUrl = process.env.SHAREPOINT_TENANT_URL?.trim();
  if (configuredTenantUrl) {
    const configuredTenant = normalizeSiteUrl(configuredTenantUrl);
    if (configuredTenant.origin !== expectedSafety.origin) {
      diagnostics.push({
        code: 'SHAREPOINT_TENANT_URL_CONFLICT',
        message:
          `SHAREPOINT_TENANT_URL origin ${configuredTenant.origin} does not match authoritative safety origin ${expectedSafety.origin}.`,
      });
    }
  }

  if (diagnostics.length > 0) {
    return null;
  }

  return {
    safetySiteUrl: expected.safetySiteUrl,
    hbCentralSiteUrl: expected.hbCentralSiteUrl,
  };
}

/**
 * Verifies the authoritative Safety reference lists exist on HBCentral. Returns
 * `true` when validation failed; pushes per-list results and diagnostics.
 */
export async function validateReferenceLists(
  graphDiscovery: IGraphListDiscoveryService,
  siteUrl: string,
  results: ISafetyReferenceListValidationResult[],
  diagnostics: ISafetyProvisionDiagnostic[],
): Promise<boolean> {
  let failed = false;
  for (const title of SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES) {
    let exists = false;
    try {
      exists = await graphDiscovery.listExists(siteUrl, title);
    } catch (err) {
      failed = true;
      const errorMessage = formatSharePointTokenAcquisitionDiagnostic(err);
      results.push({
        title,
        exists: false,
        outcome: 'failed',
        message: errorMessage,
      });
      diagnostics.push({
        code: toProvisioningErrorCode(err, 'REFERENCE_LIST_VALIDATION_ERROR'),
        message: `${title} validation failed on ${siteUrl}: ${errorMessage}`,
      });
      continue;
    }
    if (exists) {
      results.push({ title, exists: true, outcome: 'alreadyExisted' });
      continue;
    }
    failed = true;
    const message = `Required reference list "${title}" was not found on ${siteUrl}.`;
    results.push({ title, exists: false, outcome: 'failed', message });
    diagnostics.push({
      code: 'MISSING_REFERENCE_LIST',
      message,
    });
  }
  return failed;
}

/**
 * Verifies Safety list field contracts through the Graph discovery seam so a
 * schema drift on the target site surfaces as a diagnostic before ingestion
 * mutates anything.
 */
export async function validateSafetyIngestionContracts(
  graphDiscovery: IGraphListDiscoveryService,
): Promise<ISafetyProvisionDiagnostic[]> {
  const diagnostics: ISafetyProvisionDiagnostic[] = [];
  for (const definition of SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS) {
    if (definition.fields.length === 0 || definition.kind !== 'list') continue;
    try {
      const present = await graphDiscovery.getWritableColumnNames(definition.siteUrl, definition.title);
      const missing = definition.fields
        .map((field) => field.internalName)
        .filter((name) => name !== 'Title' && !present.has(name));
      if (missing.length > 0) {
        diagnostics.push({
          code: 'SAFETY_INGESTION_FIELD_CONTRACT_MISSING',
          message: `${definition.title} missing fields: ${missing.join(', ')}`,
          failureClass: 'field-contract-missing',
        });
      }
    } catch (err) {
      const classification = classifyIngestionFailure(err, 'SAFETY_INGESTION_FIELD_CONTRACT_FAILED');
      diagnostics.push({
        code: toProvisioningErrorCode(err, classification.errorCode),
        message: `${definition.title} contract check failed: ${formatSharePointTokenAcquisitionDiagnostic(err)}`,
        failureClass: classification.failureClass,
        graphContext: classification.graphContext,
      });
    }
  }
  return diagnostics;
}
