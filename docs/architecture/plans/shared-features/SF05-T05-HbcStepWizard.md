# SF05-T05 — `HbcStepWizard`: Full Guided Stepper

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (locked sidebar rows), D-02 (terminal status rendering), D-03 (inline validation), D-06 (complexity-gated sidebar density), D-08 (overdue badge)
**Estimated Effort:** 0.75 sprint-weeks
**Wave:** 3

---

## Objective

Implement `HbcStepWizard` — the primary rendering component — in both `horizontal` and `vertical` variants, with correct complexity-gated sidebar rendering, all five step status icons, sequential-with-jumps locked rows, validation error display, and overdue indicators.

---

## 3-Line Plan

1. Implement the shared step status icon set and sidebar row component used by both variants.
2. Implement the `vertical` variant (sidebar nav + content area) with complexity-gated sidebar density (D-06).
3. Implement the `horizontal` variant (top progress bar + step dots + bottom navigation) for modal/focused flows.

---

## Props Interface

```typescript
interface HbcStepWizardProps<T> {
  item: T;
  config: IStepWizardConfig<T>;
  /** Render function for the active step's body content. */
  renderStep: (stepId: string, item: T) => React.ReactNode;
  /** 'horizontal' = top progress bar (modal flows); 'vertical' = sidebar nav (detail pages). */
  variant?: 'horizontal' | 'vertical';
  /** Override complexity tier for Storybook/testing. Uses useComplexity() if absent. */
  complexityTier?: ComplexityTier;
}
```

---

## Step Status Icon Set

```typescript
// components/shared/StepStatusIcon.tsx
const STATUS_ICONS: Record<StepStatus, { symbol: string; ariaLabel: string; colorClass: string }> = {
  'not-started': { symbol: '○',  ariaLabel: 'Not started', colorClass: 'hbc-step-icon--neutral' },
  'in-progress': { symbol: '◐',  ariaLabel: 'In progress',  colorClass: 'hbc-step-icon--active'  },
  'complete':    { symbol: '✓',  ariaLabel: 'Complete',     colorClass: 'hbc-step-icon--success' },
  'blocked':     { symbol: '🔒', ariaLabel: 'Blocked',      colorClass: 'hbc-step-icon--warning' },
  'skipped':     { symbol: '⊘',  ariaLabel: 'Skipped',      colorClass: 'hbc-step-icon--muted'   },
};

export function StepStatusIcon({ status }: { status: StepStatus }) {
  const { symbol, ariaLabel, colorClass } = STATUS_ICONS[status];
  return (
    <span className={`hbc-step-icon ${colorClass}`} aria-label={ariaLabel} role="img">
      {symbol}
    </span>
  );
}
```

---

## Complexity-Gated Sidebar Rendering (D-06)

```typescript
// components/shared/WizardSidebar.tsx

interface WizardSidebarProps {
  steps: IStepRuntimeEntry[];
  activeStepId: string | null;
  tier: ComplexityTier;
  orderMode: StepOrderMode;
  showCoaching: boolean;
  onStepClick: (stepId: string) => void;
  getValidationError: (stepId: string) => string | null;
}

export function WizardSidebar({
  steps, activeStepId, tier, orderMode, showCoaching, onStepClick, getValidationError
}: WizardSidebarProps) {

  // D-06: Essential = adjacent steps only (current + prev/next)
  const visibleSteps = React.useMemo(() => {
    if (tier !== 'essential') return steps;
    const activeIdx = steps.findIndex((s) => s.stepId === activeStepId);
    if (activeIdx === -1) return steps.slice(0, 1);
    return steps.filter((_, i) =>
      i === activeIdx - 1 || i === activeIdx || i === activeIdx + 1
    );
  }, [steps, activeStepId, tier]);

  return (
    <nav className="hbc-wizard-sidebar" aria-label="Wizard steps">
      {tier === 'essential' && steps.length > 3 && (
        <p className="hbc-wizard-sidebar__step-hint" aria-live="polite">
          Showing step {steps.findIndex(s => s.stepId === activeStepId) + 1} of {steps.length}
        </p>
      )}

      <ol className="hbc-wizard-sidebar__list" role="list">
        {visibleSteps.map((step) => (
          <SidebarStepRow
            key={step.stepId}
            step={step}
            isActive={step.stepId === activeStepId}
            tier={tier}
            orderMode={orderMode}
            onStepClick={onStepClick}
            validationError={getValidationError(step.stepId)}
          />
        ))}
      </ol>
    </nav>
  );
}

function SidebarStepRow({
  step, isActive, tier, orderMode, onStepClick, validationError
}: SidebarStepRowProps) {
  const isLocked = !step.isUnlocked;
  const isClickable = step.isUnlocked && !isLocked;

  return (
    <li
      className={[
        'hbc-wizard-step-row',
        isActive && 'hbc-wizard-step-row--active',
        isLocked && 'hbc-wizard-step-row--locked',
        step.isOverdue && 'hbc-wizard-step-row--overdue',
      ].filter(Boolean).join(' ')}
      aria-current={isActive ? 'step' : undefined}
    >
      <button
        className="hbc-wizard-step-row__btn"
        onClick={() => isClickable && onStepClick(step.stepId)}
        disabled={isLocked}
        aria-disabled={isLocked}
        aria-label={[
          step.label,
          step.status === 'blocked' ? '— Blocked' : '',
          isLocked ? '— Locked' : '',
          step.isOverdue ? '— Overdue' : '',
        ].filter(Boolean).join(' ')}
      >
        <StepStatusIcon status={isLocked ? 'not-started' : step.status} />

        <span className="hbc-wizard-step-row__label">{step.label}</span>

        {/* Assignee avatar — Standard+ only (D-06) */}
        {tier !== 'essential' && step.assignee && (
          <Avatar
            userId={step.assignee.userId}
            displayName={step.assignee.displayName}
            size="xs"
          />
        )}

        {/* Overdue indicator */}
        {step.isOverdue && (
          <span className="hbc-wizard-step-row__overdue-badge" aria-label="Overdue">⚠</span>
        )}

        {/* Expert: completedAt timestamp (D-06) */}
        {tier === 'expert' && step.completedAt && (
          <time className="hbc-wizard-step-row__completed-at" dateTime={step.completedAt}>
            {formatDateTime(step.completedAt)}
          </time>
        )}

        {/* Expert: inline validation warning indicator (D-06) */}
        {tier === 'expert' && validationError && step.status !== 'complete' && (
          <span className="hbc-wizard-step-row__validation-dot" aria-label="Has validation issue" />
        )}

        {/* Locked indicator for sequential-with-jumps (D-01) */}
        {isLocked && orderMode === 'sequential-with-jumps' && (
          <LockIcon aria-label="Complete preceding steps to unlock" />
        )}
      </button>

      {/* Inline validation error — shown on active step only (D-03) */}
      {isActive && validationError && (
        <p className="hbc-wizard-step-row__error" role="alert">
          {validationError}
        </p>
      )}
    </li>
  );
}
```

---

## Vertical Variant

```typescript
// components/HbcStepWizard.tsx — vertical branch
function VerticalWizard<T>({
  item, config, renderStep, tier, showCoaching, wizard
}: VerticalWizardProps<T>) {
  const activeStep = wizard.state.steps.find((s) => s.stepId === wizard.state.activeStepId);

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
          <CoachingCallout
            message={`Complete "${activeStep.label}" to continue.`}
          />
        )}

        {/* Step body via render prop */}
        {wizard.state.activeStepId && (
          <div
            className="hbc-wizard__step-body"
            key={wizard.state.activeStepId} // unmount/remount on step change
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
```

---

## Horizontal Variant

```typescript
// HbcStepWizard.tsx — horizontal branch
function HorizontalWizard<T>({
  item, config, renderStep, tier, showCoaching, wizard
}: HorizontalWizardProps<T>) {
  const totalSteps = wizard.state.steps.length;
  const activeIdx = wizard.state.steps.findIndex((s) => s.stepId === wizard.state.activeStepId);
  const activeStep = wizard.state.steps[activeIdx];

  return (
    <div className="hbc-wizard hbc-wizard--horizontal">
      {/* Top progress bar with step dots */}
      <div className="hbc-wizard__progress-header" role="navigation" aria-label="Step progress">
        <div className="hbc-wizard__progress-track">
          {wizard.state.steps.map((step, idx) => (
            <React.Fragment key={step.stepId}>
              <button
                className={[
                  'hbc-wizard__step-dot',
                  step.stepId === wizard.state.activeStepId && 'hbc-wizard__step-dot--active',
                  step.status === 'complete' && 'hbc-wizard__step-dot--complete',
                  !step.isUnlocked && 'hbc-wizard__step-dot--locked',
                ].filter(Boolean).join(' ')}
                onClick={() => wizard.goTo(step.stepId)}
                disabled={!step.isUnlocked}
                aria-current={step.stepId === wizard.state.activeStepId ? 'step' : undefined}
                aria-label={`Step ${idx + 1}: ${step.label} — ${step.status}`}
              >
                {step.status === 'complete' ? '✓' : idx + 1}
              </button>
              {idx < totalSteps - 1 && (
                <div
                  className={[
                    'hbc-wizard__progress-line',
                    step.status === 'complete' && 'hbc-wizard__progress-line--complete',
                  ].filter(Boolean).join(' ')}
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
        <CoachingCallout message={`Complete "${activeStep.label}" to continue.`} />
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
      <WizardNav wizard={wizard} config={config} item={item} tier={tier}
        validationError={wizard.state.activeStepId
          ? wizard.getValidationError(wizard.state.activeStepId)
          : null}
      />
    </div>
  );
}
```

---

## `WizardNav` — Shared Navigation Footer

```typescript
function WizardNav<T>({ wizard, config, item, tier, validationError }: WizardNavProps<T>) {
  const canGoBack = wizard.state.steps.findIndex(s => s.stepId === wizard.state.activeStepId) > 0;
  const isLastStep = !wizard.state.steps
    .find((_, i) => i > wizard.state.steps.findIndex(s => s.stepId === wizard.state.activeStepId));
  const activeStepEntry = wizard.state.steps.find(s => s.stepId === wizard.state.activeStepId);
  const activeStepConfig = config.steps.find(s => s.stepId === wizard.state.activeStepId);
  const isComplete = wizard.state.isComplete;

  return (
    <div className="hbc-wizard__nav" role="group" aria-label="Step navigation">
      {validationError && (
        <p className="hbc-wizard__nav-error" role="alert">
          {/* D-06: simplified message at Essential; full message at Standard+ */}
          {tier === 'essential'
            ? 'This step is incomplete.'
            : validationError}
        </p>
      )}

      <div className="hbc-wizard__nav-actions">
        {canGoBack && (
          <button
            onClick={() => {
              const idx = wizard.state.steps.findIndex(s => s.stepId === wizard.state.activeStepId);
              const prev = wizard.state.steps[idx - 1];
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
                onClick={() => wizard.markComplete(wizard.state.activeStepId!, true)}
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
```

---

## Root Component

```typescript
export function HbcStepWizard<T>({
  item, config, renderStep, variant = 'vertical', complexityTier,
}: HbcStepWizardProps<T>) {
  const { tier: contextTier, showCoaching } = useComplexity();
  const tier = complexityTier ?? contextTier;
  const wizard = useStepWizard(config, item);

  const props = { item, config, renderStep, tier, showCoaching, wizard };

  return variant === 'horizontal'
    ? <HorizontalWizard {...props} />
    : <VerticalWizard {...props} />;
}
```

---

## CSS Classes

```css
.hbc-wizard { display: flex; }
.hbc-wizard--vertical { flex-direction: row; gap: var(--hbc-spacing-6); }
.hbc-wizard--horizontal { flex-direction: column; gap: var(--hbc-spacing-4); }
.hbc-wizard__content { flex: 1; display: flex; flex-direction: column; gap: var(--hbc-spacing-4); }

.hbc-wizard-sidebar { width: 240px; flex-shrink: 0; }
.hbc-wizard-sidebar__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--hbc-spacing-1); }
.hbc-wizard-sidebar__step-hint { font-size: 0.8em; color: var(--hbc-color-neutral-500); }

.hbc-wizard-step-row__btn { display: flex; align-items: center; gap: var(--hbc-spacing-2); width: 100%; padding: var(--hbc-spacing-2); border-radius: var(--hbc-radius-sm); border: none; background: none; cursor: pointer; text-align: left; }
.hbc-wizard-step-row--active .hbc-wizard-step-row__btn { background: var(--hbc-color-primary-50); font-weight: 600; }
.hbc-wizard-step-row--locked .hbc-wizard-step-row__btn { opacity: 0.5; cursor: not-allowed; }
.hbc-wizard-step-row--overdue .hbc-wizard-step-row__btn { border-left: 3px solid var(--hbc-color-warning); }
.hbc-wizard-step-row__error { color: var(--hbc-color-danger); font-size: 0.85em; padding: var(--hbc-spacing-1) var(--hbc-spacing-8); }
.hbc-wizard-step-row__completed-at { font-size: 0.75em; color: var(--hbc-color-neutral-400); margin-left: auto; }
.hbc-wizard-step-row__validation-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--hbc-color-warning); margin-left: auto; }

.hbc-wizard__progress-header { display: flex; flex-direction: column; gap: var(--hbc-spacing-2); padding: var(--hbc-spacing-4); }
.hbc-wizard__progress-track { display: flex; align-items: center; gap: 0; }
.hbc-wizard__step-dot { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--hbc-color-neutral-300); background: white; cursor: pointer; font-size: 0.85em; }
.hbc-wizard__step-dot--active { border-color: var(--hbc-color-primary); background: var(--hbc-color-primary); color: white; }
.hbc-wizard__step-dot--complete { background: var(--hbc-color-success); border-color: var(--hbc-color-success); color: white; }
.hbc-wizard__step-dot--locked { opacity: 0.4; cursor: not-allowed; }
.hbc-wizard__progress-line { flex: 1; height: 2px; background: var(--hbc-color-neutral-200); }
.hbc-wizard__progress-line--complete { background: var(--hbc-color-success); }
.hbc-wizard__step-label { font-weight: 600; }

.hbc-wizard__nav { display: flex; flex-direction: column; gap: var(--hbc-spacing-3); padding-top: var(--hbc-spacing-4); border-top: 1px solid var(--hbc-color-neutral-200); }
.hbc-wizard__nav-actions { display: flex; gap: var(--hbc-spacing-3); }
.hbc-wizard__nav-error { color: var(--hbc-color-danger); font-size: 0.9em; }
.hbc-wizard__complete-msg { color: var(--hbc-color-success); font-weight: 600; }
```

---

## Verification Commands

```bash
pnpm --filter @hbc/step-wizard typecheck
pnpm --filter @hbc/step-wizard test -- --reporter=verbose components/HbcStepWizard
```
