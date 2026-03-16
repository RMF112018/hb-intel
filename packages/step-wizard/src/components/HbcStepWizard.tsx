import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { useComplexity } from '@hbc/complexity';
import type { ComplexityTier } from '@hbc/complexity';
import { HbcCoachingCallout } from '@hbc/ui-kit';
import {
  HBC_ACCENT_ORANGE,
  HBC_ACCENT_ORANGE_HOVER,
  HBC_ACCENT_ORANGE_PRESSED,
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_RADIUS_MD,
  HBC_RADIUS_FULL,
  body as bodyTypo,
} from '@hbc/ui-kit/theme';
import type { IStepWizardConfig, IUseStepWizardReturn } from '../types/IStepWizard';
import { useStepWizard } from '../hooks/useStepWizard';
import { WizardSidebar } from './shared/WizardSidebar';

// ── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  wizardVertical: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: `${HBC_SPACE_MD}px`,
  },
  wizardHorizontal: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: `${HBC_SPACE_MD}px`,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  stepBody: {
    flexGrow: 1,
  },
  progressHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    rowGap: `${HBC_SPACE_SM}px`,
  },
  progressTrack: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: `${HBC_SPACE_SM}px`,
  },
  stepDot: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: HBC_RADIUS_FULL,
    ...shorthands.border('2px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    fontWeight: '500',
    color: HBC_SURFACE_LIGHT['text-muted'],
    cursor: 'pointer',
    ':disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  stepDotActive: {
    ...shorthands.borderColor(HBC_ACCENT_ORANGE),
    color: HBC_ACCENT_ORANGE,
    fontWeight: '700',
  },
  stepDotComplete: {
    ...shorthands.borderColor(HBC_STATUS_COLORS.success),
    backgroundColor: HBC_STATUS_COLORS.success,
    color: '#FFFFFF',
  },
  stepDotLocked: {
    opacity: 0.4,
  },
  progressLine: {
    width: '24px',
    height: '2px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
  },
  progressLineComplete: {
    backgroundColor: HBC_STATUS_COLORS.success,
  },
  stepLabel: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    lineHeight: bodyTypo.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  navError: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    color: HBC_STATUS_COLORS.error,
  },
  navActions: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: `${HBC_SPACE_SM}px`,
    justifyContent: 'flex-end',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.borderWidth('0'),
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_ACCENT_ORANGE_HOVER,
    },
    ':active': {
      backgroundColor: HBC_ACCENT_ORANGE_PRESSED,
    },
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_MD,
    ...shorthands.borderWidth('0'),
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  completeMsg: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    color: HBC_STATUS_COLORS.success,
    fontWeight: '600',
  },
});

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
  const styles = useStyles();
  const activeStep = wizard.state.steps.find(
    (s) => s.stepId === wizard.state.activeStepId,
  );

  return (
    <div className={styles.wizardVertical}>
      <WizardSidebar
        steps={wizard.state.steps}
        activeStepId={wizard.state.activeStepId}
        tier={tier}
        orderMode={config.orderMode}
        showCoaching={showCoaching}
        onStepClick={wizard.goTo}
        getValidationError={wizard.getValidationError}
      />

      <div className={styles.content} role="main">
        {/* Essential coaching callout (D-06) */}
        {tier === 'essential' && showCoaching && activeStep && (
          <HbcCoachingCallout
            message={`Complete "${activeStep.label}" to continue.`}
          />
        )}

        {/* Step body via render prop */}
        {wizard.state.activeStepId && (
          <div
            className={styles.stepBody}
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
  const styles = useStyles();
  const totalSteps = wizard.state.steps.length;
  const activeIdx = wizard.state.steps.findIndex(
    (s) => s.stepId === wizard.state.activeStepId,
  );
  const activeStep = wizard.state.steps[activeIdx];

  return (
    <div className={styles.wizardHorizontal}>
      {/* Top progress bar with step dots */}
      <div
        className={styles.progressHeader}
        role="navigation"
        aria-label="Step progress"
      >
        <div className={styles.progressTrack}>
          {wizard.state.steps.map((step, idx) => (
            <React.Fragment key={step.stepId}>
              <button
                className={mergeClasses(
                  styles.stepDot,
                  step.stepId === wizard.state.activeStepId && styles.stepDotActive,
                  step.status === 'complete' && styles.stepDotComplete,
                  !step.isUnlocked && styles.stepDotLocked,
                )}
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
                  className={mergeClasses(
                    styles.progressLine,
                    step.status === 'complete' && styles.progressLineComplete,
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <p className={styles.stepLabel} aria-live="polite">
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
        className={styles.stepBody}
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
  const styles = useStyles();
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
    <div className={styles.nav} role="group" aria-label="Step navigation">
      {validationError && (
        <p className={styles.navError} role="alert">
          {/* D-06: simplified message at Essential; full message at Standard+ */}
          {tier === 'essential' ? 'This step is incomplete.' : validationError}
        </p>
      )}

      <div className={styles.navActions}>
        {canGoBack && (
          <button
            onClick={() => {
              const prev = wizard.state.steps[activeIdx - 1];
              if (prev) wizard.goTo(prev.stepId);
            }}
            className={styles.btnGhost}
          >
            Back
          </button>
        )}

        {!isComplete && (
          <>
            <button
              onClick={() => wizard.markComplete(wizard.state.activeStepId!)}
              className={styles.btnPrimary}
            >
              {isLastStep ? 'Complete' : 'Mark Complete & Next'}
            </button>

            {config.allowForceComplete && activeStepEntry?.validationError && (
              <button
                onClick={() =>
                  wizard.markComplete(wizard.state.activeStepId!, true)
                }
                className={styles.btnGhost}
              >
                Complete Anyway
              </button>
            )}
          </>
        )}

        {isComplete && (
          <p className={styles.completeMsg} role="status">
            ✓ All steps complete
          </p>
        )}
      </div>
    </div>
  );
}
