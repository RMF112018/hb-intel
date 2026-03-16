import React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import {
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_RADIUS_FULL,
  HBC_RADIUS_XL,
  TRANSITION_FAST,
} from '@hbc/ui-kit/theme';
import { useComplexity } from '../hooks/useComplexity';
import type { ComplexityTier } from '../types/IComplexity';
import { TIER_ORDER } from '../types/IComplexity';

// ─────────────────────────────────────────────────────────────────────────────
// Griffel styles
// ─────────────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  wrapper: {},

  // Header pill variant
  headerDial: {
    display: 'inline-flex',
    borderRadius: HBC_RADIUS_FULL,
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    overflow: 'hidden',
  },

  segment: {
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '120ms',
    transitionTimingFunction: 'ease',
    border: 'none',
    backgroundColor: 'transparent',
  },

  segmentActive: {
    backgroundColor: HBC_PRIMARY_BLUE,
    color: '#FFFFFF',
    fontWeight: 600,
  },

  // Settings cards variant
  settingsDial: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },

  card: {
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    border: `2px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_XL,
    cursor: 'pointer',
    transitionProperty: 'border-color',
    transitionDuration: '120ms',
    transitionTimingFunction: 'ease',
    backgroundColor: 'transparent',
    textAlign: 'start' as const,
  },

  cardActive: {
    ...shorthands.borderColor(HBC_PRIMARY_BLUE),
  },

  cardHeader: {},
  cardAudience: {},
  cardDescription: {},
  cardExample: {},

  // Locked state
  locked: {
    opacity: 0.6,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  },

  lockedSegment: {
    cursor: 'not-allowed',
  },

  lockIcon: {},

  lockNotice: {},

  // Coaching toggle
  coachingToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
    cursor: 'pointer',
  },

  coachingHint: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Tier metadata
// ─────────────────────────────────────────────────────────────────────────────

const TIER_META: Record<ComplexityTier, {
  label: string;
  description: string;
  audience: string;
  example: string;
}> = {
  essential: {
    label: 'Essential',
    description: 'Minimum information to complete the current task.',
    audience: 'New users, field staff, occasional reviewers',
    example: 'Shows active fields only; prominent coaching prompts.',
  },
  standard: {
    label: 'Standard',
    description: 'Full working view for day-to-day users.',
    audience: 'Project coordinators, most Project Managers',
    example: 'All operational fields visible; advanced options collapsed.',
  },
  expert: {
    label: 'Expert',
    description: 'Full information density with all history and configuration.',
    audience: 'Power users, Senior PMs, estimators, VPs',
    example: 'All fields, audit trail, and configuration options exposed.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcComplexityDialProps {
  /**
   * 'header' — compact three-segment pill for the app header.
   * 'settings' — full description cards for the user settings panel.
   * @default 'header'
   */
  variant?: 'header' | 'settings';
  /** Whether to show the showCoaching toggle (settings variant only, D-07) */
  showCoachingToggle?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tier selector rendered in the app header or user settings panel.
 *
 * Renders as disabled (D-06) when the tier is locked by admin or onboarding.
 * The locked tooltip explains why the dial is inactive.
 *
 * @example — App header
 * <HbcComplexityDial variant="header" />
 *
 * @example — Settings page (with coaching toggle)
 * <HbcComplexityDial variant="settings" showCoachingToggle />
 */
export function HbcComplexityDial({
  variant = 'header',
  showCoachingToggle = false,
  className,
}: HbcComplexityDialProps): React.ReactElement {
  const styles = useStyles();
  const { tier, isLocked, lockedBy, lockedUntil, setTier, showCoaching, setShowCoaching } =
    useComplexity();

  const lockedTitle = buildLockedTooltip(lockedBy, lockedUntil);

  return (
    <div className={mergeClasses(styles.wrapper, className)}>
      {variant === 'header' ? (
        <HeaderDial
          currentTier={tier}
          isLocked={isLocked}
          lockedTitle={lockedTitle}
          onSelect={setTier}
        />
      ) : (
        <SettingsDial
          currentTier={tier}
          isLocked={isLocked}
          lockedTitle={lockedTitle}
          onSelect={setTier}
          showCoachingToggle={showCoachingToggle}
          showCoaching={showCoaching}
          onShowCoachingChange={setShowCoaching}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header variant — compact three-segment pill
// ─────────────────────────────────────────────────────────────────────────────

interface HeaderDialProps {
  currentTier: ComplexityTier;
  isLocked: boolean;
  lockedTitle: string;
  onSelect: (tier: ComplexityTier) => void;
}

function HeaderDial({ currentTier, isLocked, lockedTitle, onSelect }: HeaderDialProps): React.ReactElement {
  const styles = useStyles();

  return (
    <div
      className={mergeClasses(
        styles.headerDial,
        isLocked && styles.locked,
      )}
      role="group"
      aria-label="Complexity level"
      title={isLocked ? lockedTitle : undefined}
    >
      {TIER_ORDER.map((tier) => {
        const meta = TIER_META[tier];
        const isActive = tier === currentTier;
        return (
          <button
            key={tier}
            className={mergeClasses(
              styles.segment,
              isActive && styles.segmentActive,
              isLocked && styles.lockedSegment,
            )}
            aria-pressed={isActive}
            aria-label={`${meta.label} — ${meta.description}`}
            title={`${meta.label}: ${meta.description}`}
            onClick={() => !isLocked && onSelect(tier)}
            disabled={isLocked}
            type="button"
          >
            {meta.label}
          </button>
        );
      })}
      {isLocked && (
        <span
          className={styles.lockIcon}
          aria-label="Complexity level is managed by your organization"
        >
          🔒
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings variant — full description cards
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsDialProps extends HeaderDialProps {
  showCoachingToggle: boolean;
  showCoaching: boolean;
  onShowCoachingChange: (show: boolean) => void;
}

function SettingsDial({
  currentTier,
  isLocked,
  lockedTitle,
  onSelect,
  showCoachingToggle,
  showCoaching,
  onShowCoachingChange,
}: SettingsDialProps): React.ReactElement {
  const styles = useStyles();

  return (
    <div>
      {isLocked && (
        <p
          className={styles.lockNotice}
          role="alert"
          aria-live="polite"
        >
          🔒 {lockedTitle}
        </p>
      )}

      <div
        className={mergeClasses(
          styles.settingsDial,
          isLocked && styles.locked,
        )}
        role="radiogroup"
        aria-label="Complexity level"
      >
        {TIER_ORDER.map((tier) => {
          const meta = TIER_META[tier];
          const isActive = tier === currentTier;
          return (
            <button
              key={tier}
              className={mergeClasses(
                styles.card,
                isActive && styles.cardActive,
              )}
              role="radio"
              aria-checked={isActive}
              onClick={() => !isLocked && onSelect(tier)}
              disabled={isLocked}
              type="button"
            >
              <div className={styles.cardHeader}>
                <strong>{meta.label}</strong>
                {isActive && <span aria-hidden="true"> ✓</span>}
              </div>
              <p className={styles.cardAudience}>{meta.audience}</p>
              <p className={styles.cardDescription}>{meta.description}</p>
              <p className={styles.cardExample}>
                <em>Example: {meta.example}</em>
              </p>
            </button>
          );
        })}
      </div>

      {/* D-07: showCoaching independent toggle */}
      {showCoachingToggle && (
        <label className={styles.coachingToggle}>
          <input
            type="checkbox"
            checked={showCoaching}
            onChange={(e) => onShowCoachingChange(e.target.checked)}
            aria-label="Show guidance prompts"
          />
          <span>Show guidance prompts</span>
          <span className={styles.coachingHint}>
            Coaching callouts can be enabled at any complexity level.
          </span>
        </label>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lock tooltip builder (D-06)
// ─────────────────────────────────────────────────────────────────────────────

function buildLockedTooltip(
  lockedBy: 'admin' | 'onboarding' | undefined,
  lockedUntil: string | undefined
): string {
  if (!lockedBy) return '';

  const base = 'Your complexity level is managed by your organization.';
  const contact = 'Contact your administrator to change it.';

  if (!lockedUntil) return `${base} ${contact}`;

  const expiry = new Date(lockedUntil).toLocaleDateString();
  return `${base} This setting will unlock automatically on ${expiry}. ${contact}`;
}
