import * as React from 'react';
import type { ComplexityTier } from '@hbc/complexity';
import type { IStepRuntimeEntry, StepOrderMode } from '../../types/IStepWizard';
import { StepStatusIcon } from './StepStatusIcon';

// ── Inline helpers (following @hbc/acknowledgment pattern) ──────────────────

function Avatar({
  displayName,
}: {
  userId: string;
  displayName: string;
  size: string;
}): React.ReactElement {
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="hbc-wizard-avatar" aria-label={displayName}>
      {initials}
    </span>
  );
}

function LockIcon({ 'aria-label': ariaLabel }: { 'aria-label': string }): React.ReactElement {
  return (
    <span role="img" aria-label={ariaLabel}>
      🔒
    </span>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

// ── Props ───────────────────────────────────────────────────────────────────

interface WizardSidebarProps {
  steps: IStepRuntimeEntry[];
  activeStepId: string | null;
  tier: ComplexityTier;
  orderMode: StepOrderMode;
  showCoaching: boolean;
  onStepClick: (stepId: string) => void;
  getValidationError: (stepId: string) => string | null;
}

interface SidebarStepRowProps {
  step: IStepRuntimeEntry;
  isActive: boolean;
  tier: ComplexityTier;
  orderMode: StepOrderMode;
  onStepClick: (stepId: string) => void;
  validationError: string | null;
}

// ── WizardSidebar ───────────────────────────────────────────────────────────

export function WizardSidebar({
  steps,
  activeStepId,
  tier,
  orderMode,
  showCoaching: _showCoaching,
  onStepClick,
  getValidationError,
}: WizardSidebarProps): React.ReactElement {
  // D-06: Essential = adjacent steps only (current + prev/next)
  const visibleSteps = React.useMemo(() => {
    if (tier !== 'essential') return steps;
    const activeIdx = steps.findIndex((s) => s.stepId === activeStepId);
    if (activeIdx === -1) return steps.slice(0, 1);
    return steps.filter(
      (_, i) => i === activeIdx - 1 || i === activeIdx || i === activeIdx + 1,
    );
  }, [steps, activeStepId, tier]);

  return (
    <nav className="hbc-wizard-sidebar" aria-label="Wizard steps">
      {tier === 'essential' && steps.length > 3 && (
        <p className="hbc-wizard-sidebar__step-hint" aria-live="polite">
          Showing step {steps.findIndex((s) => s.stepId === activeStepId) + 1} of{' '}
          {steps.length}
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

// ── SidebarStepRow ──────────────────────────────────────────────────────────

function SidebarStepRow({
  step,
  isActive,
  tier,
  orderMode,
  onStepClick,
  validationError,
}: SidebarStepRowProps): React.ReactElement {
  const isLocked = !step.isUnlocked;
  const isClickable = step.isUnlocked && !isLocked;

  return (
    <li
      className={[
        'hbc-wizard-step-row',
        isActive && 'hbc-wizard-step-row--active',
        isLocked && 'hbc-wizard-step-row--locked',
        step.isOverdue && 'hbc-wizard-step-row--overdue',
      ]
        .filter(Boolean)
        .join(' ')}
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
        ]
          .filter(Boolean)
          .join(' ')}
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
          <span className="hbc-wizard-step-row__overdue-badge" aria-label="Overdue">
            ⚠
          </span>
        )}

        {/* Expert: completedAt timestamp (D-06) */}
        {tier === 'expert' && step.completedAt && (
          <time
            className="hbc-wizard-step-row__completed-at"
            dateTime={step.completedAt}
          >
            {formatDateTime(step.completedAt)}
          </time>
        )}

        {/* Expert: inline validation warning indicator (D-06) */}
        {tier === 'expert' && validationError && step.status !== 'complete' && (
          <span
            className="hbc-wizard-step-row__validation-dot"
            aria-label="Has validation issue"
          />
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
