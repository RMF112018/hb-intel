# SF03-T05 — Components: `HbcComplexityGate` & `HbcComplexityDial`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-04 (unmount + keepMounted), D-06 (locked dial), D-07 (showCoaching toggle), D-09 (CSS fade-in)
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T01, T02, T03, T04

---

## Objective

Implement the two UI components that every module author interacts with directly:
- `HbcComplexityGate` — declarative render gate with unmount-by-default, `keepMounted` escape hatch, and CSS fade-in animation.
- `HbcComplexityDial` — tier selector in header and settings variants; disabled/locked state; `showCoaching` toggle in settings variant.

---

## 3-Line Plan

1. Implement `HbcComplexityGate` with unmount default, `keepMounted` prop, `fallback` prop, and CSS fade-in keyframe on appearing children.
2. Implement `HbcComplexityDial` with header pill and settings cards variants; locked state rendering; `showCoaching` toggle.
3. Verify all gate conditions render/unmount correctly and the dial persists tier changes via `setTier`.

---

## CSS Definitions (D-09)

Add to the package's CSS or inject via `<style>` tag in the gate component. These are the only CSS rules the package owns.

```css
/* packages/complexity/src/components/complexity.css */

@keyframes hbc-complexity-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.hbc-complexity-gate__content--entering {
  animation: hbc-complexity-fade-in 150ms ease-out forwards;
}

/* Locked dial */
.hbc-complexity-dial--locked {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.hbc-complexity-dial--locked .hbc-complexity-dial__segment {
  cursor: not-allowed;
}

/* Header pill variant */
.hbc-complexity-dial--header {
  display: inline-flex;
  border-radius: 9999px;
  border: 1px solid var(--hbc-color-border-subtle);
  overflow: hidden;
}

.hbc-complexity-dial__segment {
  padding: 4px 12px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background-color 120ms ease;
  border: none;
  background: none;
}

.hbc-complexity-dial__segment--active {
  background-color: var(--hbc-color-primary);
  color: var(--hbc-color-on-primary);
  font-weight: 600;
}

/* Settings cards variant */
.hbc-complexity-dial--settings {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.hbc-complexity-dial__card {
  padding: 16px;
  border: 2px solid var(--hbc-color-border-subtle);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 120ms ease;
}

.hbc-complexity-dial__card--active {
  border-color: var(--hbc-color-primary);
}
```

---

## `src/components/HbcComplexityGate.tsx`

```tsx
import React, { useRef, useState, useEffect } from 'react';
import './complexity.css';
import { useComplexityGate } from '../hooks/useComplexityGate';
import type { IComplexityGateCondition } from '../types/IComplexity';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcComplexityGateProps extends IComplexityGateCondition {
  children: React.ReactNode;
  /**
   * Rendered when the gate is closed (current tier does not meet min/maxTier).
   * When absent, nothing renders when gate is closed.
   */
  fallback?: React.ReactNode;
  /**
   * When true, children remain mounted in the DOM when the gate closes (D-04).
   * Hidden via aria-hidden + display:none instead of unmounting.
   *
   * Only use this when local React state inside children MUST be preserved
   * across tier changes (e.g., a partially filled sub-form).
   *
   * WARNING: keepMounted prevents cleanup of network requests and event listeners
   * in gated children. Never use it as a performance optimization — it is the
   * opposite of performant for complex children.
   */
  keepMounted?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Declarative complexity gate. Renders children only when the current tier
 * satisfies the minTier/maxTier conditions.
 *
 * Default behavior: children UNMOUNT when the gate closes (D-04).
 * Appearing children fade in over 150ms (D-09).
 *
 * @example — Show only in Expert
 * <HbcComplexityGate minTier="expert">
 *   <AuditTrailPanel />
 * </HbcComplexityGate>
 *
 * @example — Show coaching prompt only through Standard; hide in Expert
 * <HbcComplexityGate maxTier="standard" fallback={null}>
 *   <CoachingCallout message="Complete all sections before submitting." />
 * </HbcComplexityGate>
 *
 * @example — Preserve form state across tier changes (rare — document the reason)
 * <HbcComplexityGate minTier="standard" keepMounted>
 *   <AdvancedFilterForm /> {/* keepMounted: preserves user-typed filter values */}
 * </HbcComplexityGate>
 */
export function HbcComplexityGate({
  minTier,
  maxTier,
  children,
  fallback = null,
  keepMounted = false,
}: HbcComplexityGateProps): React.ReactElement | null {
  const isOpen = useComplexityGate({ minTier, maxTier });

  // Track previous open state to detect transitions (for fade-in animation)
  const prevOpenRef = useRef(isOpen);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    // D-09: Detect gate opening (false → true) to trigger fade-in
    if (!prevOpenRef.current && isOpen) {
      setIsEntering(true);
      const timer = setTimeout(() => setIsEntering(false), 150);
      prevOpenRef.current = isOpen;
      return () => clearTimeout(timer);
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // ── keepMounted path (D-04) ──────────────────────────────────────────────
  if (keepMounted) {
    return (
      <>
        <div
          aria-hidden={!isOpen}
          style={{ display: isOpen ? undefined : 'none' }}
          className={isEntering ? 'hbc-complexity-gate__content--entering' : undefined}
        >
          {children}
        </div>
        {!isOpen && fallback}
      </>
    );
  }

  // ── Default unmount path (D-04) ──────────────────────────────────────────
  if (!isOpen) {
    return fallback as React.ReactElement | null;
  }

  return (
    <div
      className={isEntering ? 'hbc-complexity-gate__content--entering' : undefined}
    >
      {children}
    </div>
  );
}
```

---

## `src/components/HbcComplexityDial.tsx`

```tsx
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
```

---

## Usage Examples for Module Authors

```tsx
// ── Gate: show audit trail in Expert only ────────────────────────────────
<HbcComplexityGate minTier="expert">
  <AuditTrailPanel itemId={item.id} />
</HbcComplexityGate>

// ── Gate: coaching prompt through Standard; silent in Expert ─────────────
<HbcComplexityGate maxTier="standard">
  <CoachingCallout message="Complete all required sections before submitting." />
</HbcComplexityGate>

// ── Gate: Essential-only simplified view with Standard+ fallback ─────────
<HbcComplexityGate
  minTier="essential"
  maxTier="essential"
  fallback={<FullScorecardView scorecard={scorecard} />}
>
  <SimplifiedScorecardSummary scorecard={scorecard} />
</HbcComplexityGate>

// ── keepMounted: preserve filter form state across tier change ───────────
{/* keepMounted: user may have typed filter values; unmount would lose them */}
<HbcComplexityGate minTier="expert" keepMounted>
  <AdvancedFilterPanel />
</HbcComplexityGate>

// ── Dial in app header ───────────────────────────────────────────────────
<HbcComplexityDial variant="header" />

// ── Dial in user settings with coaching toggle ───────────────────────────
<HbcComplexityDial variant="settings" showCoachingToggle />
```

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/complexity typecheck

# 2. Component unit tests (written in T08)
pnpm --filter @hbc/complexity test -- HbcComplexityGate
pnpm --filter @hbc/complexity test -- HbcComplexityDial

# 3. Confirm exports
node -e "
  import('@hbc/complexity').then(m => {
    console.log('HbcComplexityGate:', typeof m.HbcComplexityGate);
    console.log('HbcComplexityDial:', typeof m.HbcComplexityDial);
  });
"
```
