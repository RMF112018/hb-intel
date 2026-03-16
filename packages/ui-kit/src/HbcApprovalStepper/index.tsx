/**
 * HbcApprovalStepper — Vertical/horizontal approval workflow stepper
 * PH4.13 §13.3 | Blueprint §1d
 *
 * Reused across Scorecards (approval chain sidebar) and Turnover (signature stepper).
 * Each step shows avatar, name/role, decision badge, and optional timestamp/comment.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_STATUS_COLORS, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_RADIUS_FULL } from '../theme/radii.js';
import { HBC_SPACE_SM, HBC_SPACE_LG, HBC_SPACE_XL } from '../theme/grid.js';
import type { ApprovalStep, HbcApprovalStepperProps } from './types.js';

const DECISION_COLOR_MAP: Record<string, string> = {
  approved: HBC_STATUS_COLORS.success,
  rejected: HBC_STATUS_COLORS.error,
  pending: HBC_STATUS_COLORS.pending,
  skipped: HBC_STATUS_COLORS.neutral,
};

const DECISION_LABEL_MAP: Record<string, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  skipped: 'Skipped',
};

const useStyles = makeStyles({
  rootVertical: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  rootHorizontal: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  stepVertical: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    position: 'relative',
    paddingBottom: `${HBC_SPACE_LG}px`,
  },
  stepHorizontal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    position: 'relative',
    paddingRight: `${HBC_SPACE_XL}px`,
    flex: 1,
  },
  connectorVertical: {
    position: 'absolute',
    left: '19px',
    top: '40px',
    bottom: '0',
    width: '2px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
  },
  connectorHorizontal: {
    position: 'absolute',
    top: '19px',
    left: '40px',
    right: '0',
    height: '2px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: HBC_RADIUS_FULL,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#FFFFFF',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  userRole: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  decisionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: '12px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    width: 'fit-content',
    marginTop: '4px',
  },
  timestamp: {
    fontSize: '0.6875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '2px',
  },
  comment: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: '4px',
    fontStyle: 'italic',
  },
});

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 45%)`;
}

function StepItem({
  step,
  isLast,
  orientation,
}: {
  step: ApprovalStep;
  isLast: boolean;
  orientation: 'vertical' | 'horizontal';
}): React.JSX.Element {
  const styles = useStyles();
  const isVertical = orientation === 'vertical';
  const decisionColor = step.decision
    ? DECISION_COLOR_MAP[step.decision]
    : DECISION_COLOR_MAP.pending;

  return (
    <div className={isVertical ? styles.stepVertical : styles.stepHorizontal}>
      {/* Connector line */}
      {!isLast && (
        <div
          className={
            isVertical ? styles.connectorVertical : styles.connectorHorizontal
          }
        />
      )}

      {/* Avatar */}
      <div
        className={styles.avatar}
        style={{ backgroundColor: getAvatarColor(step.userName) }}
      >
        {step.avatarUrl ? (
          <img
            className={styles.avatarImg}
            src={step.avatarUrl}
            alt={step.userName}
          />
        ) : (
          getInitials(step.userName)
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <span className={styles.userName}>{step.userName}</span>
        <span className={styles.userRole}>{step.userRole}</span>
        {step.decision && (
          <span
            className={styles.decisionBadge}
            style={{
              backgroundColor: `${decisionColor}20`,
              color: decisionColor,
            }}
          >
            {DECISION_LABEL_MAP[step.decision]}
          </span>
        )}
        {step.timestamp && (
          <span className={styles.timestamp}>
            {new Date(step.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        {step.comment && (
          <span className={styles.comment}>&ldquo;{step.comment}&rdquo;</span>
        )}
      </div>
    </div>
  );
}

export function HbcApprovalStepper({
  steps,
  orientation = 'vertical',
  className,
}: HbcApprovalStepperProps): React.JSX.Element {
  const styles = useStyles();

  return (
    <div
      data-hbc-ui="approval-stepper"
      className={mergeClasses(
        orientation === 'vertical' ? styles.rootVertical : styles.rootHorizontal,
        className,
      )}
      role="list"
      aria-label="Approval steps"
    >
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          step={step}
          isLast={index === steps.length - 1}
          orientation={orientation}
        />
      ))}
    </div>
  );
}

export type { ApprovalStep, HbcApprovalStepperProps } from './types.js';
