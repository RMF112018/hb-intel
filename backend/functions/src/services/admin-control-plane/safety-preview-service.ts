/**
 * Admin Control Plane — Phase 11 reusable preview/dry-run/impact-summary pipeline.
 *
 * This service generates safety-aware preview results for any admin action.
 * Domain-specific preview logic is supplied via preview providers; this service
 * handles the framework concerns: safety profile lookup, scope assembly,
 * warning generation, evidence capture, and audit recording.
 *
 * Design: the pipeline is domain-neutral. Each admin domain registers a
 * preview provider that knows how to inspect the target system and produce
 * impact items and warnings. This service wraps that output in the full
 * safety preview contract.
 *
 * @module admin-control-plane/services
 */

import {
  AdminRiskLevel,
  AdminAuditEventType,
  AdminEvidenceType,
  AdminSafetyControl,
} from '@hbc/models/admin-control-plane';
import type {
  AdminActionKey,
  AdminDomain,
  IAdminActorContext,
  IAdminSafetyPreviewResult,
  IAdminSafetyImpactItem,
  IAdminSafetyWarning,
  IAdminExecutionScope,
  IAdminSafetyProfile,
} from '@hbc/models/admin-control-plane';
import type { IAdminAuditService, IAdminEvidenceService } from './types.js';
import { getSafetyProfile } from './safety-policy-registry.js';

// ─── Preview Provider Interface ────────────────────────────────────────────────

/**
 * Domain-specific preview provider.
 *
 * Each admin domain implements this interface to supply the domain-specific
 * preview logic. The safety preview service calls the provider and wraps
 * the result in the full safety preview contract.
 */
export interface IPreviewProvider {
  /** Generate domain-specific impact items by inspecting the target system. */
  generateImpactItems(input: IPreviewProviderInput): Promise<IPreviewProviderOutput>;
}

/** Input to a preview provider. */
export interface IPreviewProviderInput {
  /** Action key being previewed */
  readonly actionKey: AdminActionKey;
  /** Domain-specific command payload */
  readonly commandInput: Record<string, unknown>;
  /** Target entity ID (if applicable) */
  readonly targetEntityId: string | null;
  /** Whether this is a dry-run (simulated execution) vs preview (inspection) */
  readonly dryRun: boolean;
}

/** Output from a preview provider. */
export interface IPreviewProviderOutput {
  /** Domain-specific impact items */
  readonly impactItems: readonly IAdminSafetyImpactItem[];
  /** Domain-specific warnings */
  readonly warnings: readonly IAdminSafetyWarning[];
  /** Advisory notes (non-blocking) */
  readonly advisoryNotes: readonly string[];
  /** Scope details from the domain's perspective */
  readonly scope: IPreviewProviderScope;
  /** Limitations the provider could not assess */
  readonly limitations: readonly IPreviewLimitation[];
}

/** Scope information from a preview provider. */
export interface IPreviewProviderScope {
  readonly targetEntityId: string | null;
  readonly targetEntityLabel: string | null;
  readonly affectedResourceCount: number;
  readonly scopeDescription: string;
}

/** A limitation that prevents full preview accuracy. */
export interface IPreviewLimitation {
  /** What could not be assessed */
  readonly area: string;
  /** Why it could not be assessed */
  readonly reason: string;
}

// ─── Preview Provider Registry ─────────────────────────────────────────────────

const providerRegistry = new Map<string, IPreviewProvider>();

/**
 * Register a preview provider for an action key or domain.
 * Action-key-specific providers take priority over domain providers.
 */
export function registerPreviewProvider(key: string, provider: IPreviewProvider): void {
  providerRegistry.set(key, provider);
}

/** Look up a preview provider. Tries action key first, then domain. */
export function getPreviewProvider(actionKey: AdminActionKey, domain: AdminDomain): IPreviewProvider | null {
  return providerRegistry.get(actionKey) ?? providerRegistry.get(domain) ?? null;
}

/** Clear the provider registry (for testing). */
export function clearPreviewProviders(): void {
  providerRegistry.clear();
}

// ─── Preview Pipeline ──────────────────────────────────────────────────────────

/** Input to the safety preview pipeline. */
export interface ISafetyPreviewRequest {
  readonly actionKey: AdminActionKey;
  readonly commandInput: Record<string, unknown>;
  readonly targetEntityId?: string;
  readonly dryRun?: boolean;
}

/** Result from the safety preview pipeline. */
export interface ISafetyPreviewPipelineResult {
  readonly preview: IAdminSafetyPreviewResult;
  readonly evidenceId: string;
}

/**
 * Execute the full safety preview pipeline:
 *
 * 1. Look up safety profile for the action
 * 2. Resolve preview provider
 * 3. Generate domain-specific impact items
 * 4. Assemble safety-aware preview result with scope, warnings, limitations
 * 5. Capture evidence
 * 6. Record audit event
 *
 * Returns the preview result and evidence ID for downstream linkage.
 */
export async function executeSafetyPreview(
  request: ISafetyPreviewRequest,
  actor: IAdminActorContext,
  auditService?: IAdminAuditService,
  evidenceService?: IAdminEvidenceService,
): Promise<ISafetyPreviewPipelineResult> {
  const now = new Date().toISOString();
  const evidenceId = crypto.randomUUID();
  const dryRun = request.dryRun ?? false;

  // 1. Look up safety profile
  const profile = getSafetyProfile(request.actionKey);
  const riskLevel = profile?.riskLevel ?? AdminRiskLevel.Moderate;
  const domain = profile?.domain;

  // 2. Resolve preview provider
  const provider = domain
    ? getPreviewProvider(request.actionKey, domain)
    : null;

  let providerOutput: IPreviewProviderOutput;

  if (provider) {
    // 3. Call domain-specific provider
    providerOutput = await provider.generateImpactItems({
      actionKey: request.actionKey,
      commandInput: request.commandInput,
      targetEntityId: request.targetEntityId ?? null,
      dryRun,
    });
  } else {
    // No provider — generate a truthful "no preview available" result
    providerOutput = buildNoProviderOutput(request, profile);
  }

  // 4. Assemble safety-aware preview
  const warnings = assembleWarnings(providerOutput, profile, dryRun);
  const scope = assembleScope(providerOutput.scope, domain);
  const proceedRecommended = computeProceedRecommendation(providerOutput, warnings);

  const preview: IAdminSafetyPreviewResult = {
    actionKey: request.actionKey,
    dryRun,
    scope,
    riskLevel,
    impactItems: providerOutput.impactItems,
    warnings,
    advisoryNotes: providerOutput.advisoryNotes,
    proceedRecommended,
    previewedAt: now,
    evidenceId,
  };

  // 5. Capture evidence
  if (evidenceService) {
    evidenceService.recordEvidence(
      {
        evidenceId,
        evidenceType: AdminEvidenceType.PreviewResult,
        label: `${dryRun ? 'Dry-run' : 'Preview'} for ${request.actionKey}`,
        runId: null,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-preview/${request.actionKey}/${now}`,
      },
      'operational',
      {
        actionKey: request.actionKey,
        dryRun,
        riskLevel,
        impactItemCount: providerOutput.impactItems.length,
        warningCount: warnings.length,
        limitationCount: providerOutput.limitations.length,
        proceedRecommended,
        scope,
      },
    ).catch(() => {});
  }

  // 6. Record audit event
  if (auditService) {
    auditService.recordEvent({
      auditId: crypto.randomUUID(),
      eventType: AdminAuditEventType.RunStarted, // preview is a precursor to a run
      timestamp: now,
      domain: domain ?? ('' as AdminDomain),
      actionKey: request.actionKey,
      runId: null,
      checkpointInstanceId: null,
      actor,
      rationale: null,
      evidenceRef: {
        evidenceId,
        evidenceType: AdminEvidenceType.PreviewResult,
        label: `${dryRun ? 'Dry-run' : 'Preview'} result`,
        runId: null,
        stepNumber: null,
        capturedAt: now,
        storageLocator: `inline://safety-preview/${request.actionKey}/${now}`,
      },
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: `Safety ${dryRun ? 'dry-run' : 'preview'} for ${request.actionKey}: ${providerOutput.impactItems.length} impact items, ${warnings.length} warnings`,
    }).catch(() => {});
  }

  return { preview, evidenceId };
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

function buildNoProviderOutput(
  request: ISafetyPreviewRequest,
  profile: IAdminSafetyProfile | null,
): IPreviewProviderOutput {
  const limitations: IPreviewLimitation[] = [{
    area: 'full-preview',
    reason: 'No domain-specific preview provider is registered for this action. Impact assessment is based on the action safety profile only.',
  }];

  if (request.dryRun) {
    limitations.push({
      area: 'dry-run',
      reason: profile?.supportsDryRun
        ? 'Dry-run is supported but no provider is available to simulate execution.'
        : 'Dry-run is not technically supported for this action.',
    });
  }

  return {
    impactItems: [],
    warnings: [],
    advisoryNotes: [],
    scope: {
      targetEntityId: request.targetEntityId ?? null,
      targetEntityLabel: null,
      affectedResourceCount: 0,
      scopeDescription: profile?.scopeDescription ?? 'Scope unknown — no preview provider available.',
    },
    limitations,
  };
}

function assembleWarnings(
  providerOutput: IPreviewProviderOutput,
  profile: IAdminSafetyProfile | null,
  dryRun: boolean,
): readonly IAdminSafetyWarning[] {
  const warnings: IAdminSafetyWarning[] = [...providerOutput.warnings];

  // Add limitation warnings (truthfulness rule)
  for (const limitation of providerOutput.limitations) {
    warnings.push({
      severity: 'warning',
      code: 'preview-limitation',
      message: `${limitation.area}: ${limitation.reason}`,
      resource: null,
    });
  }

  // Warn if dry-run was requested but not supported
  if (dryRun && profile && !profile.supportsDryRun) {
    warnings.push({
      severity: 'warning',
      code: 'dry-run-unavailable',
      message: 'Dry-run was requested but is not technically supported for this action. The result is a preview (inspection) only.',
      resource: null,
    });
  }

  // Add risk-tier warning for destructive/tenant-sensitive actions
  if (profile && (profile.riskLevel === AdminRiskLevel.High || profile.riskLevel === AdminRiskLevel.Critical)) {
    const hasIrreversibleItems = providerOutput.impactItems.some(item => !item.reversible);
    if (hasIrreversibleItems) {
      warnings.push({
        severity: 'critical',
        code: 'contains-irreversible-changes',
        message: 'This action includes changes that cannot be automatically reversed.',
        resource: null,
      });
    }
  }

  // Warn about required controls that must be satisfied
  if (profile?.requiredControls.includes(AdminSafetyControl.PostRunValidation)) {
    warnings.push({
      severity: 'info',
      code: 'post-run-validation-required',
      message: 'Post-run validation is required after this action completes.',
      resource: null,
    });
  }

  return warnings;
}

function assembleScope(
  providerScope: IPreviewProviderScope,
  domain?: AdminDomain,
): IAdminExecutionScope {
  return {
    domain: domain ?? ('' as AdminDomain),
    targetEntityId: providerScope.targetEntityId,
    targetEntityLabel: providerScope.targetEntityLabel,
    affectedResourceCount: providerScope.affectedResourceCount,
    scopeDescription: providerScope.scopeDescription,
  };
}

function computeProceedRecommendation(
  providerOutput: IPreviewProviderOutput,
  warnings: readonly IAdminSafetyWarning[],
): boolean {
  // Do not recommend proceeding if there are critical warnings
  const hasCriticalWarnings = warnings.some(w => w.severity === 'critical');
  // Do not recommend if there are unresolvable limitations
  const hasBlockingLimitations = providerOutput.limitations.some(
    l => l.area === 'full-preview',
  );

  return !hasCriticalWarnings && !hasBlockingLimitations;
}
