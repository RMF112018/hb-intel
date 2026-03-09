import * as React from 'react';
import { useComplexity } from '@hbc/complexity';
import type { ComplexityTier } from '@hbc/complexity';
import { useStepWizard } from '../hooks/useStepWizard';
import { WizardSidebar } from './shared/WizardSidebar';
import type { IStepWizardConfig } from '../types/IStepWizard';

// ── Props ───────────────────────────────────────────────────────────────────

export interface HbcStepSidebarProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  activeStepId: string;
  onStepSelect: (stepId: string) => void;
  /** Override complexity tier for Storybook/testing. */
  complexityTier?: ComplexityTier;
}

// ── Component ───────────────────────────────────────────────────────────────

export function HbcStepSidebar<T>({
  item,
  config,
  activeStepId,
  onStepSelect,
  complexityTier,
}: HbcStepSidebarProps<T>): React.ReactElement {
  const { tier: contextTier, showCoaching } = useComplexity();
  const tier = complexityTier ?? contextTier;

  // Uses useStepWizard to get derived state — does not manage navigation internally
  const { state, getValidationError } = useStepWizard(config, item);

  return (
    <WizardSidebar
      steps={state.steps}
      activeStepId={activeStepId}
      tier={tier}
      orderMode={config.orderMode}
      showCoaching={showCoaching}
      onStepClick={onStepSelect}
      getValidationError={getValidationError}
    />
  );
}
