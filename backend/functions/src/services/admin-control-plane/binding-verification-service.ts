/**
 * P6A-07: Binding verification and drift detection service.
 *
 * Implements structured verification checks for managed-app binding records,
 * following the Phase 6 install-verification-service pattern. Each check
 * evaluates one aspect of binding health and produces an IAppBindingDriftFinding
 * when drift is detected.
 *
 * Design: individual check functions are side-effect-free observers. The
 * orchestration wrapper (runAppBindingVerification) coordinates binding status
 * updates, audit recording, and evidence capture.
 *
 * @module admin-control-plane/services
 */

import {
  AppBindingStatus,
  AdminAuditEventType,
  AdminDomain,
  APP_BINDING_ACTION_KEYS,
  AdminRunStatus,
} from '@hbc/models/admin-control-plane';

import type {
  IAppBindingRecord,
  IAppBindingDriftFinding,
  IAppBindingVerificationResult,
  AppBindingVerificationOutcome,
  IAdminActorContext,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminAppBindingService,
  IAdminAuditService,
  IAdminEvidenceService,
} from './types.js';

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Staleness threshold in milliseconds (30 days). */
const STALENESS_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000;

// ─── Individual Check Functions ────────────────────────────────────────────────

/**
 * Helper to create a drift finding.
 */
function driftFinding(
  field: string,
  expected: string,
  observed: string,
  severity: 'critical' | 'warning' | 'info',
  message: string,
): IAppBindingDriftFinding {
  return { field, expected, observed, severity, message };
}

/**
 * Check: required binding fields are present and have valid format.
 */
export function checkRequiredFields(binding: IAppBindingRecord): IAppBindingDriftFinding[] {
  const findings: IAppBindingDriftFinding[] = [];

  if (!binding.functionAppUrl) {
    findings.push(driftFinding(
      'functionAppUrl',
      'non-empty URL',
      '',
      'critical',
      'Function App URL is empty',
    ));
  } else {
    try {
      new URL(binding.functionAppUrl);
    } catch {
      findings.push(driftFinding(
        'functionAppUrl',
        'valid URL',
        binding.functionAppUrl,
        'critical',
        `Function App URL is not a valid URL: ${binding.functionAppUrl}`,
      ));
    }
  }

  if (!binding.apiAudience) {
    findings.push(driftFinding(
      'apiAudience',
      'non-empty audience URI',
      '',
      'critical',
      'API audience is empty',
    ));
  } else if (!binding.apiAudience.startsWith('api://')) {
    findings.push(driftFinding(
      'apiAudience',
      'URI starting with api://',
      binding.apiAudience,
      'warning',
      `API audience does not follow expected api:// format: ${binding.apiAudience}`,
    ));
  }

  return findings;
}

/**
 * Check: Function App URL is reachable.
 *
 * In the current implementation, this performs format validation only.
 * Full HTTP health probes will be added when infrastructure adapters
 * are available (requires live Azure environment).
 */
export function checkFunctionAppReachable(binding: IAppBindingRecord): IAppBindingDriftFinding[] {
  if (!binding.functionAppUrl) return []; // Already caught by checkRequiredFields

  try {
    const url = new URL(binding.functionAppUrl);
    if (!url.hostname.includes('.')) {
      return [driftFinding(
        'functionAppUrl',
        'resolvable hostname',
        url.hostname,
        'warning',
        `Function App URL hostname may not be resolvable: ${url.hostname}`,
      )];
    }
  } catch {
    return []; // Already caught by checkRequiredFields
  }

  return [];
}

/**
 * Check: API audience has valid URI format.
 */
export function checkApiAudienceValid(binding: IAppBindingRecord): IAppBindingDriftFinding[] {
  if (!binding.apiAudience) return []; // Already caught by checkRequiredFields

  // Validate the client ID portion after api://
  if (binding.apiAudience.startsWith('api://')) {
    const clientId = binding.apiAudience.substring(6);
    if (!clientId || clientId.length < 8) {
      return [driftFinding(
        'apiAudience',
        'api://<valid-client-id>',
        binding.apiAudience,
        'warning',
        'API audience client ID appears too short to be a valid app registration',
      )];
    }
  }

  return [];
}

/**
 * Check: binding has been verified within the staleness threshold.
 */
export function checkBindingNotStale(binding: IAppBindingRecord): IAppBindingDriftFinding[] {
  if (!binding.lastVerifiedAt) {
    return [driftFinding(
      'staleness',
      'verified at least once',
      'never verified',
      'info',
      'Binding has never been verified against live infrastructure',
    )];
  }

  const lastVerified = new Date(binding.lastVerifiedAt).getTime();
  const age = Date.now() - lastVerified;

  if (age > STALENESS_THRESHOLD_MS) {
    const days = Math.floor(age / (24 * 60 * 60 * 1000));
    return [driftFinding(
      'staleness',
      'verified within 30 days',
      `last verified ${days} days ago`,
      'info',
      `Binding was last verified ${days} days ago — consider re-verifying`,
    )];
  }

  return [];
}

/**
 * Check: binding status is not Superseded or Error.
 */
export function checkBindingNotSuperseded(binding: IAppBindingRecord): IAppBindingDriftFinding[] {
  if (binding.status === AppBindingStatus.Superseded) {
    return [driftFinding(
      'status',
      'Active or PendingPublication',
      'Superseded',
      'warning',
      'Binding has been superseded — it may need to be replaced by Phase 10 configuration',
    )];
  }

  if (binding.status === AppBindingStatus.Error) {
    return [driftFinding(
      'status',
      'Active or PendingPublication',
      'Error',
      'warning',
      'Binding is in error state — publication or verification previously failed',
    )];
  }

  return [];
}

// ─── Execution Wrapper ─────────────────────────────────────────────────────────

/**
 * Executes all binding verification checks against a binding record.
 *
 * Returns an array of drift findings. Empty array means all checks passed.
 * Each check is independent — all checks run even if early checks fail.
 */
export function executeBindingVerificationChecks(
  binding: IAppBindingRecord,
): IAppBindingDriftFinding[] {
  return [
    ...checkRequiredFields(binding),
    ...checkFunctionAppReachable(binding),
    ...checkApiAudienceValid(binding),
    ...checkBindingNotStale(binding),
    ...checkBindingNotSuperseded(binding),
  ];
}

// ─── Orchestration ─────────────────────────────────────────────────────────────

/**
 * Runs full binding verification for a managed app, including:
 * - fetch binding
 * - execute all checks
 * - update binding status
 * - record audit event
 * - capture evidence
 *
 * Follows the Phase 6 install-verification-service pattern.
 */
export async function runAppBindingVerification(
  appId: string,
  bindingService: IAdminAppBindingService,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<IAppBindingVerificationResult> {
  const now = new Date().toISOString();

  // 1. Fetch binding
  const binding = await bindingService.getBinding(appId);

  if (!binding) {
    const result: IAppBindingVerificationResult = {
      appId,
      version: 0,
      outcome: 'inconclusive' as AppBindingVerificationOutcome,
      verifiedAt: now,
      findings: [driftFinding(
        'binding',
        'configured',
        'not-configured',
        'critical',
        `No binding record exists for app '${appId}'`,
      )],
      checksPassed: 0,
      checksTotal: 1,
    };

    // Record audit for missing binding
    if (auditService) {
      auditService.recordEvent({
        auditId: crypto.randomUUID(),
        eventType: AdminAuditEventType.BindingDriftDetected,
        timestamp: now,
        domain: AdminDomain.AppBinding,
        actionKey: APP_BINDING_ACTION_KEYS.VERIFY,
        runId: null,
        checkpointInstanceId: null,
        actor,
        rationale: null,
        evidenceRef: null,
        configSnapshotRef: null,
        runStatusAtEvent: AdminRunStatus.Completed,
        summary: `Binding verification for ${appId}: no binding configured`,
      }).catch(() => {});
    }

    return result;
  }

  // 2. Execute all checks
  const findings = executeBindingVerificationChecks(binding);

  // 3. Determine outcome
  const hasCritical = findings.some(f => f.severity === 'critical');
  const hasWarning = findings.some(f => f.severity === 'warning');
  const outcome: AppBindingVerificationOutcome =
    hasCritical ? 'drifted' :
    hasWarning ? 'drifted' :
    findings.length === 0 ? 'passed' : 'passed'; // info-only findings don't cause drift

  // Refine: info-only findings are not drift
  const driftFindings = findings.filter(f => f.severity !== 'info');
  const effectiveOutcome: AppBindingVerificationOutcome =
    driftFindings.length > 0 ? 'drifted' : 'passed';

  const checksTotal = 5; // required fields, function app reachable, API audience valid, staleness, status
  const checksPassed = checksTotal - findings.length;

  // 4. Build result
  const result: IAppBindingVerificationResult = {
    appId,
    version: binding.version,
    outcome: effectiveOutcome,
    verifiedAt: now,
    findings,
    checksPassed: Math.max(0, checksPassed),
    checksTotal,
  };

  // 5. Update binding status via the store's verifyBinding method
  // The store method handles status updates and persistence
  await bindingService.verifyBinding(appId);

  // 6. Record audit event
  if (auditService) {
    const eventType = effectiveOutcome === 'passed'
      ? AdminAuditEventType.BindingVerified
      : AdminAuditEventType.BindingDriftDetected;

    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType,
      timestamp: now,
      domain: AdminDomain.AppBinding,
      actionKey: APP_BINDING_ACTION_KEYS.VERIFY,
      runId: null,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: AdminRunStatus.Completed,
      summary: `Binding verification for ${appId} v${binding.version}: ${effectiveOutcome} (${findings.length} findings)`,
    }).catch(() => {});
  }

  // 7. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId: crypto.randomUUID(),
        evidenceType: 'post-validation-summary' as never,
        label: `Binding verification for ${appId} v${binding.version}`,
        runId: null,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://binding-verification/${appId}/${binding.version}`,
      },
      'operational',
      {
        appId,
        version: binding.version,
        outcome: effectiveOutcome,
        findings,
        checksPassed: result.checksPassed,
        checksTotal,
      },
    ).catch(() => {});
  }

  return result;
}
