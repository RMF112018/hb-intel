import * as React from 'react';
import { useComplexity } from '@hbc/complexity';
import type { ComplexityTier } from '@hbc/complexity';
import { HbcCoachingCallout } from '@hbc/ui-kit';
import type { IStepWizardConfig, IUseStepWizardReturn } from '../types/IStepWizard';
import { useStepWizard } from '../hooks/useStepWizard';
import { WizardSidebar } from './shared/WizardSidebar';

// ── Props ───────────────────────────────────────────────────────────────────

export interface HbcStepWizardProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  /** Render function for the active step's body content. */
  renderStep: (stepId: string, item: T) => React.ReactNode;
  /** 'horizontal' = top progress bar (modal flows); 'vertical' = sidebar nav (detail pages). */
  variant?: 'horizontal' | 'vertical';
  /** Override complexity tier for Storybook/testing. Uses useComplexity() if absent. */
  complexityTier?: ComplexityTier;
}

interface VariantProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  renderStep: (stepId: string, item: T) => React.ReactNode;
  tier: ComplexityTier;
  showCoaching: boolean;
  wizard: IUseStepWizardReturn;
}

type VerticalWizardProps<T> = VariantProps<T>;
type HorizontalWizardProps<T> = VariantProps<T>;

interface WizardNavProps<T> {
  wizard: IUseStepWizardReturn;
  config: IStepWizardConfig<T>;
  item: T;
  tier: ComplexityTier;
  validationError: string | null;
}

// ── Root Component ──────────────────────────────────────────────────────────

export function HbcStepWizard<T>({
  item,
  config,
  renderStep,
  variant = 'vertical',
  complexityTier,
}: HbcStepWizardProps<T>): React.ReactElement {
  const { tier: contextTier, showCoaching } = useComplexity();
  const tier = complexityTier ?? contextTier;
  const wizard = useStepWizard(config, item);

  const props: VariantProps<T> = { item, config, renderStep, tier, showCoaching, wizard };

  return variant === 'horizontal' ? (
    <HorizontalWizard {...props} />
  ) : (
    <VerticalWizard {...props} />
  );
}

// ── Vertical Variant ────────────────────────────────────────────────────────

function VerticalWizard<T>({
  item,
  config,
  renderStep,
  tier,
  showCoaching,
  wizard,
}: VerticalWizardProps<T>): React.ReactElement {
  const activeStep = wizard.state.steps.find(
    (s) => s.stepId === wizard.state.activeStepId,
  );

  return (
    <div className="hbc-wizard hbc-wizard--vertical">
      <WizardSidebar
        steps={wizard.state.steps}
        activeStepId={wizard.state.activeStepId}
        tier={tier}
        orderMode={config.orderMode}
        showCoaching={showCoaching}
        onStepClick={wizard.goTo}
        getValidationError={wizard.getValidationError}
      />

      <div className="hbc-wizard__content" role="main">
        {/* Essential coaching callout (D-06) */}
        {tier === 'essential' && showCoaching && activeStep && (
          <HbcCoachingCallout
            message={`Complete "${activeStep.label}" to continue.`}
          />
        )}

        {/* Step body via render prop */}
        {wizard.state.activeStepId && (
          <div
            className="hbc-wizard__step-body"
            key={wizard.state.activeStepId}
            role="region"
            aria-label={activeStep?.label ?? 'Step'}
          >
            {renderStep(wizard.state.activeStepId, item)}
          </div>
        )}

        {/* Navigation footer */}
        <WizardNav
          wizard={wizard}
          config={config}
          item={item}
          tier={tier}
          validationError={
            wizard.state.activeStepId
              ? wizard.getValidationError(wizard.state.activeStepId)
              : null
          }
        />
      </div>
    </div>
  );
}

// ── Horizontal Variant ──────────────────────────────────────────────────────

function HorizontalWizard<T>({
  item,
  config,
  renderStep,
  tier,
  showCoaching,
  wizard,
}: HorizontalWizardProps<T>): React.ReactElement {
  const totalSteps = wizard.state.steps.length;
  const activeIdx = wizard.state.steps.findIndex(
    (s) => s.stepId === wizard.state.activeStepId,
  );
  const activeStep = wizard.state.steps[activeIdx];

  return (
    <div className="hbc-wizard hbc-wizard--horizontal">
      {/* Top progress bar with step dots */}
      <div
        className="hbc-wizard__progress-header"
        role="navigation"
        aria-label="Step progress"
      >
        <div className="hbc-wizard__progress-track">
          {wizard.state.steps.map((step, idx) => (
            <React.Fragment key={step.stepId}>
              <button
                className={[
                  'hbc-wizard__step-dot',
                  step.stepId === wizard.state.activeStepId &&
                    'hbc-wizard__step-dot--active',
                  step.status === 'complete' && 'hbc-wizard__step-dot--complete',
                  !step.isUnlocked && 'hbc-wizard__step-dot--locked',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => wizard.goTo(step.stepId)}
                disabled={!step.isUnlocked}
                aria-current={
                  step.stepId === wizard.state.activeStepId ? 'step' : undefined
                }
                aria-label={`Step ${idx + 1}: ${step.label} — ${step.status}`}
              >
                {step.status === 'complete' ? '✓' : idx + 1}
              </button>
              {idx < totalSteps - 1 && (
                <div
                  className={[
                    'hbc-wizard__progress-line',
                    step.status === 'complete' &&
                      'hbc-wizard__progress-line--complete',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <p className="hbc-wizard__step-label" aria-live="polite">
          Step {activeIdx + 1} of {totalSteps}: {activeStep?.label}
        </p>
      </div>

      {/* Step body */}
      {tier === 'essential' && showCoaching && activeStep && (
        <HbcCoachingCallout
          message={`Complete "${activeStep.label}" to continue.`}
        />
      )}
      <div
        className="hbc-wizard__step-body"
        key={wizard.state.activeStepId}
        role="region"
        aria-label={activeStep?.label ?? 'Step'}
      >
        {wizard.state.activeStepId && renderStep(wizard.state.activeStepId, item)}
      </div>

      {/* Bottom nav */}
      <WizardNav
        wizard={wizard}
        config={config}
        item={item}
        tier={tier}
        validationError={
          wizard.state.activeStepId
            ? wizard.getValidationError(wizard.state.activeStepId)
            : null
        }
      />
    </div>
  );
}

// ── WizardNav — Shared Navigation Footer ────────────────────────────────────

function WizardNav<T>({
  wizard,
  config,
  item: _item,
  tier,
  validationError,
}: WizardNavProps<T>): React.ReactElement {
  const activeIdx = wizard.state.steps.findIndex(
    (s) => s.stepId === wizard.state.activeStepId,
  );
  const canGoBack = activeIdx > 0;
  const isLastStep = activeIdx >= wizard.state.steps.length - 1;
  const activeStepEntry = wizard.state.steps.find(
    (s) => s.stepId === wizard.state.activeStepId,
  );
  const isComplete = wizard.state.isComplete;

  return (
    <div className="hbc-wizard__nav" role="group" aria-label="Step navigation">
      {validationError && (
        <p className="hbc-wizard__nav-error" role="alert">
          {/* D-06: simplified message at Essential; full message at Standard+ */}
          {tier === 'essential' ? 'This step is incomplete.' : validationError}
        </p>
      )}

      <div className="hbc-wizard__nav-actions">
        {canGoBack && (
          <button
            onClick={() => {
              const prev = wizard.state.steps[activeIdx - 1];
              if (prev) wizard.goTo(prev.stepId);
            }}
            className="hbc-btn hbc-btn--ghost"
          >
            Back
          </button>
        )}

        {!isComplete && (
          <>
            <button
              onClick={() => wizard.markComplete(wizard.state.activeStepId!)}
              className="hbc-btn hbc-btn--primary"
            >
              {isLastStep ? 'Complete' : 'Mark Complete & Next'}
            </button>

            {config.allowForceComplete && activeStepEntry?.validationError && (
              <button
                onClick={() =>
                  wizard.markComplete(wizard.state.activeStepId!, true)
                }
                className="hbc-btn hbc-btn--ghost"
              >
                Complete Anyway
              </button>
            )}
          </>
        )}

        {isComplete && (
          <p className="hbc-wizard__complete-msg" role="status">
            ✓ All steps complete
          </p>
        )}
      </div>
    </div>
  );
}
