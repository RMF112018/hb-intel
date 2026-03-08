import React from 'react';
import './complexity.css';
import { useComplexity } from '../hooks/useComplexity';
import type { ComplexityTier } from '../types/IComplexity';
import { TIER_ORDER } from '../types/IComplexity';

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
  className = '',
}: HbcComplexityDialProps): React.ReactElement {
  const { tier, isLocked, lockedBy, lockedUntil, setTier, showCoaching, setShowCoaching } =
    useComplexity();

  const lockedTitle = buildLockedTooltip(lockedBy, lockedUntil);

  return (
    <div className={`hbc-complexity-dial-wrapper ${className}`}>
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
  return (
    <div
      className={`hbc-complexity-dial hbc-complexity-dial--header ${isLocked ? 'hbc-complexity-dial--locked' : ''}`}
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
            className={`hbc-complexity-dial__segment ${isActive ? 'hbc-complexity-dial__segment--active' : ''}`}
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
          className="hbc-complexity-dial__lock-icon"
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
  return (
    <div>
      {isLocked && (
        <p
          className="hbc-complexity-dial__lock-notice"
          role="alert"
          aria-live="polite"
        >
          🔒 {lockedTitle}
        </p>
      )}

      <div
        className={`hbc-complexity-dial hbc-complexity-dial--settings ${isLocked ? 'hbc-complexity-dial--locked' : ''}`}
        role="radiogroup"
        aria-label="Complexity level"
      >
        {TIER_ORDER.map((tier) => {
          const meta = TIER_META[tier];
          const isActive = tier === currentTier;
          return (
            <button
              key={tier}
              className={`hbc-complexity-dial__card ${isActive ? 'hbc-complexity-dial__card--active' : ''}`}
              role="radio"
              aria-checked={isActive}
              onClick={() => !isLocked && onSelect(tier)}
              disabled={isLocked}
              type="button"
            >
              <div className="hbc-complexity-dial__card-header">
                <strong>{meta.label}</strong>
                {isActive && <span aria-hidden="true"> ✓</span>}
              </div>
              <p className="hbc-complexity-dial__card-audience">{meta.audience}</p>
              <p className="hbc-complexity-dial__card-description">{meta.description}</p>
              <p className="hbc-complexity-dial__card-example">
                <em>Example: {meta.example}</em>
              </p>
            </button>
          );
        })}
      </div>

      {/* D-07: showCoaching independent toggle */}
      {showCoachingToggle && (
        <label className="hbc-complexity-dial__coaching-toggle">
          <input
            type="checkbox"
            checked={showCoaching}
            onChange={(e) => onShowCoachingChange(e.target.checked)}
            aria-label="Show guidance prompts"
          />
          <span>Show guidance prompts</span>
          <span className="hbc-complexity-dial__coaching-hint">
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
