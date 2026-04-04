/**
 * HbcRecoveryGuidancePanel — Phase 11 recovery steps display
 */

export interface RecoveryStep {
  readonly order: number;
  readonly label: string;
  readonly description: string;
  readonly actionType: 'automatic' | 'manual' | 'external';
  readonly actionKey: string | null;
}

export interface RecoveryGuidance {
  readonly runId: string;
  readonly actionKey: string;
  readonly failureClass: string;
  readonly steps: readonly RecoveryStep[];
  readonly estimatedComplexity: 'simple' | 'moderate' | 'complex' | 'requires-support';
  readonly compensationAvailable: boolean;
  readonly externalActions: readonly string[];
}

export interface HbcRecoveryGuidancePanelProps {
  /** Recovery guidance from the backend */
  guidance: RecoveryGuidance;
  /** Callback when an automatic recovery action is triggered */
  onTriggerAction?: (actionKey: string) => void;
  /** Additional CSS class */
  className?: string;
}
