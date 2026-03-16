import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import type { ComplexityTier } from '@hbc/complexity';
import {
  HBC_SURFACE_LIGHT,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_RADIUS_LG,
  body as bodyTypo,
  label as labelTypo,
} from '@hbc/ui-kit/theme';
import type { IStepRuntimeEntry, StepOrderMode } from '../../types/IStepWizard';
import { StepStatusIcon } from './StepStatusIcon';

// ── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  sidebar: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_LG,
    minWidth: '200px',
  },
  stepHint: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    listStyleType: 'none',
    marginTop: '0',
    marginBottom: '0',
    paddingLeft: '0',
  },
  stepRow: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  stepRowActive: {
    fontWeight: '700',
  },
  stepRowLocked: {
    opacity: 0.5,
  },
  stepRowOverdue: {
    // intentionally empty — overdue badge handles visual indication
  },
  connector: {
    position: 'absolute',
    left: '14px',
    top: '28px',
    bottom: '-4px',
    width: '2px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
  },
  stepBtn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    backgroundColor: 'transparent',
    ...shorthands.borderWidth('0'),
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    ':disabled': {
      cursor: 'not-allowed',
    },
  },
  stepLabel: {
    fontFamily: bodyTypo.fontFamily,
    fontSize: bodyTypo.fontSize,
    lineHeight: bodyTypo.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
    flexGrow: 1,
  },
  avatar: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    fontFamily: labelTypo.fontFamily,
    fontSize: '0.625rem',
    fontWeight: '600',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  overdueBadge: {
    color: '#D97706',
    fontSize: '0.75rem',
  },
  completedAt: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  validationDot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#D97706',
  },
  error: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    color: '#DC2626',
    paddingLeft: `${HBC_SPACE_SM + 20}px`,
    marginTop: '2px',
  },
});

// ── Inline helpers ──────────────────────────────────────────────────────────

function Avatar({
  displayName,
}: {
  userId: string;
  displayName: string;
  size: string;
}): React.ReactElement {
  const styles = useStyles();
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={styles.avatar} aria-label={displayName}>
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
  isLast: boolean;
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
  const styles = useStyles();

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
    <nav className={styles.sidebar} aria-label="Wizard steps">
      {tier === 'essential' && steps.length > 3 && (
        <p className={styles.stepHint} aria-live="polite">
          Showing step {steps.findIndex((s) => s.stepId === activeStepId) + 1} of{' '}
          {steps.length}
        </p>
      )}

      <ol className={styles.list} role="list">
        {visibleSteps.map((step, idx) => (
          <SidebarStepRow
            key={step.stepId}
            step={step}
            isActive={step.stepId === activeStepId}
            isLast={idx === visibleSteps.length - 1}
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
  isLast,
  tier,
  orderMode,
  onStepClick,
  validationError,
}: SidebarStepRowProps): React.ReactElement {
  const styles = useStyles();
  const isLocked = !step.isUnlocked;
  const isClickable = step.isUnlocked && !isLocked;

  return (
    <li
      className={mergeClasses(
        styles.stepRow,
        isActive && styles.stepRowActive,
        isLocked && styles.stepRowLocked,
        step.isOverdue && styles.stepRowOverdue,
      )}
      aria-current={isActive ? 'step' : undefined}
    >
      {/* Connector line between dots */}
      {!isLast && <div className={styles.connector} />}

      <button
        className={styles.stepBtn}
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

        <span className={styles.stepLabel}>{step.label}</span>

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
          <span className={styles.overdueBadge} aria-label="Overdue">
            ⚠
          </span>
        )}

        {/* Expert: completedAt timestamp (D-06) */}
        {tier === 'expert' && step.completedAt && (
          <time
            className={styles.completedAt}
            dateTime={step.completedAt}
          >
            {formatDateTime(step.completedAt)}
          </time>
        )}

        {/* Expert: inline validation warning indicator (D-06) */}
        {tier === 'expert' && validationError && step.status !== 'complete' && (
          <span
            className={styles.validationDot}
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
        <p className={styles.error} role="alert">
          {validationError}
        </p>
      )}
    </li>
  );
}
