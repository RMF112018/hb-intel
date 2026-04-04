/**
 * SafetyWorkflowOrchestrator — Phase 11 multi-step safety flow wrapper.
 *
 * Orchestrates the full safety pipeline: Preview → Confirm → Execute → Validate → Recover.
 * Renders the appropriate panel per step and manages step transitions.
 *
 * @design P11-06
 */
import * as React from 'react';
import { useState, useCallback } from 'react';
import type {
  IAdminSafetyProfile,
  IAdminSafetyPreviewResult,
  IAdminPostRunValidationSummary,
  IAdminRecoveryGuidance,
  IAdminExecutionScope,
} from '@hbc/models/admin-control-plane';
import { HbcRecoveryGuidancePanel, HbcEvidenceSummaryBar } from '@hbc/ui-kit';
import { SafetyPreviewPanel } from './SafetyPreviewPanel.js';
import { SafetyConfirmationDialog } from './SafetyConfirmationDialog.js';
import { SafetyActionSummaryCard } from './SafetyActionSummaryCard.js';
import { PostRunValidationPanel } from './PostRunValidationPanel.js';

export type SafetyWorkflowStep = 'preview' | 'confirm' | 'execute' | 'validate' | 'recover' | 'complete';

export interface SafetyWorkflowOrchestratorProps {
  /** Safety profile for the action */
  readonly profile: IAdminSafetyProfile;
  /** Preview result (required before confirm step) */
  readonly previewResult?: IAdminSafetyPreviewResult | null;
  /** Execution scope */
  readonly scope?: IAdminExecutionScope;
  /** Post-run validation result */
  readonly validationResult?: IAdminPostRunValidationSummary | null;
  /** Recovery guidance (shown on failure) */
  readonly recoveryGuidance?: IAdminRecoveryGuidance | null;
  /** Current step override (otherwise managed internally) */
  readonly currentStep?: SafetyWorkflowStep;
  /** Callback when step changes */
  readonly onStepChange?: (step: SafetyWorkflowStep) => void;
  /** Callback when operator confirms */
  readonly onConfirm?: (acknowledgment: string) => void;
  /** Callback when operator cancels at any step */
  readonly onCancel?: () => void;
  /** Callback when operator accepts validation outcome */
  readonly onAcceptValidation?: () => void;
  /** Callback when operator rejects validation outcome */
  readonly onRejectValidation?: () => void;
  /** Callback when a recovery action is triggered */
  readonly onTriggerRecovery?: (actionKey: string) => void;
  /** Content rendered during the execute step */
  readonly children?: React.ReactNode;
  /** Whether an async operation is in progress */
  readonly loading?: boolean;
}

export const SafetyWorkflowOrchestrator: React.FC<SafetyWorkflowOrchestratorProps> = ({
  profile,
  previewResult,
  scope,
  validationResult,
  recoveryGuidance,
  currentStep: controlledStep,
  onStepChange,
  onConfirm,
  onCancel,
  onAcceptValidation,
  onRejectValidation,
  onTriggerRecovery,
  children,
  loading = false,
}) => {
  const [internalStep, setInternalStep] = useState<SafetyWorkflowStep>('preview');
  const step = controlledStep ?? internalStep;

  const goToStep = useCallback(
    (next: SafetyWorkflowStep) => {
      if (!controlledStep) setInternalStep(next);
      onStepChange?.(next);
    },
    [controlledStep, onStepChange],
  );

  const defaultScope: IAdminExecutionScope = scope ?? {
    domain: profile.domain,
    targetEntityId: null,
    targetEntityLabel: null,
    affectedResourceCount: 0,
    scopeDescription: profile.scopeDescription,
  };

  const riskLevel = profile.riskLevel as 'read-only' | 'low' | 'moderate' | 'high' | 'critical';

  return (
    <div data-hbc-ui="safety-workflow-orchestrator" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SafetyActionSummaryCard profile={profile} />

      {step === 'preview' && previewResult && (
        <SafetyPreviewPanel
          preview={previewResult}
          onProceed={() => goToStep('confirm')}
          onCancel={onCancel}
          loading={loading}
        />
      )}

      {step === 'confirm' && (
        <SafetyConfirmationDialog
          open={true}
          profile={profile}
          scope={defaultScope}
          onConfirm={(ack) => {
            onConfirm?.(ack);
            goToStep('execute');
          }}
          onCancel={() => {
            onCancel?.();
            goToStep('preview');
          }}
          loading={loading}
        />
      )}

      {step === 'execute' && children}

      {step === 'validate' && validationResult && (
        <PostRunValidationPanel
          validation={validationResult}
          onAccept={() => {
            onAcceptValidation?.();
            goToStep('complete');
          }}
          onReject={() => {
            onRejectValidation?.();
            goToStep('recover');
          }}
        />
      )}

      {step === 'recover' && recoveryGuidance && (
        <HbcRecoveryGuidancePanel
          guidance={{
            runId: recoveryGuidance.runId,
            actionKey: recoveryGuidance.actionKey,
            failureClass: recoveryGuidance.failureClass,
            steps: recoveryGuidance.steps.map(s => ({
              order: s.order,
              label: s.label,
              description: s.description,
              actionType: s.actionType,
              actionKey: s.actionKey,
            })),
            estimatedComplexity: recoveryGuidance.estimatedComplexity,
            compensationAvailable: recoveryGuidance.compensationAvailable,
            externalActions: [...recoveryGuidance.externalActions],
          }}
          onTriggerAction={onTriggerRecovery}
        />
      )}
    </div>
  );
};
