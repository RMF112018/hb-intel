import { computeProjectHealthPulse, type IComputeProjectHealthPulseInput } from '../computors/index.js';
import {
  validateHealthPulseAdminConfig,
  type IHealthPulseConfigValidationIssue,
} from '../governance/index.js';
import type {
  IHealthPulseAdminConfig,
  IProjectHealthPulse,
  IProjectHealthTelemetry,
} from '../types/index.js';

/**
 * SF21 hooks boundary.
 * Hooks orchestrate deterministic computors/governance modules and keep side effects out.
 */
export const HEALTH_PULSE_HOOKS_SCOPE = 'health-pulse/hooks';

export interface IProjectHealthPulseDerivationMetadata {
  confidenceReasonCodes: string[];
  governanceReasonCodes: string[];
  hasManualInfluence: boolean;
  evaluatedAt: string | null;
}

export interface IUseProjectHealthPulseResult {
  pulse: IProjectHealthPulse | null;
  telemetry: IProjectHealthTelemetry | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  derivation: IProjectHealthPulseDerivationMetadata;
}

export interface IHealthPulseAdminConfigValidationIssue {
  path: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface IUseHealthPulseAdminConfigResult {
  config: IHealthPulseAdminConfig | null;
  draft: IHealthPulseAdminConfig | null;
  isLoading: boolean;
  isSaving: boolean;
  isValid: boolean;
  error: Error | null;
  validationIssues: IHealthPulseAdminConfigValidationIssue[];
  save: (nextConfig: IHealthPulseAdminConfig) => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

export interface IUseProjectHealthPulseInput extends Omit<IComputeProjectHealthPulseInput, 'computedAt'> {
  now?: () => Date;
}

const mapValidationIssues = (
  issues: IHealthPulseConfigValidationIssue[]
): IHealthPulseAdminConfigValidationIssue[] => issues;

const hasManualInfluence = (pulse: IProjectHealthPulse | null): boolean => {
  if (!pulse) return false;

  return (['cost', 'time', 'field', 'office'] as const).some((key) =>
    pulse.dimensions[key].metrics.some((metric) => metric.isManualEntry)
  );
};

export const useProjectHealthPulse = (
  input: IUseProjectHealthPulseInput
): IUseProjectHealthPulseResult => {
  const now = input.now ?? (() => new Date());
  const computation = computeProjectHealthPulse({
    ...input,
    computedAt: now().toISOString(),
  });

  const refresh = async (): Promise<void> => {};

  const derivation: IProjectHealthPulseDerivationMetadata = {
    confidenceReasonCodes: computation.pulse.overallConfidence.reasons,
    governanceReasonCodes: [],
    hasManualInfluence: hasManualInfluence(computation.pulse),
    evaluatedAt: computation.pulse.computedAt,
  };

  return {
    pulse: computation.pulse,
    telemetry: computation.telemetry,
    isLoading: false,
    error: null,
    refresh,
    derivation,
  };
};

export interface IUseHealthPulseAdminConfigInput {
  initialConfig: IHealthPulseAdminConfig;
}

export const useHealthPulseAdminConfig = (
  input: IUseHealthPulseAdminConfigInput
): IUseHealthPulseAdminConfigResult => {
  let config = input.initialConfig;
  let draft = input.initialConfig;
  let error: Error | null = null;

  const validationResult = validateHealthPulseAdminConfig(draft);

  const save = async (nextConfig: IHealthPulseAdminConfig): Promise<void> => {
    const validation = validateHealthPulseAdminConfig(nextConfig);
    if (!validation.isValid) {
      error = new Error('Cannot save invalid health pulse admin config.');
      return;
    }
    config = nextConfig;
    draft = nextConfig;
    error = null;
  };

  const reset = (): void => {
    draft = config;
    error = null;
  };

  const refresh = async (): Promise<void> => {
    draft = config;
  };

  return {
    config,
    draft,
    isLoading: false,
    isSaving: false,
    isValid: validationResult.isValid,
    error,
    validationIssues: mapValidationIssues(validationResult.issues),
    save,
    reset,
    refresh,
  };
};
