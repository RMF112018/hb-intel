import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@griffel/react';
import { TRANSITION_FAST } from '@hbc/ui-kit/theme';
import { useComplexityGate } from '../hooks/useComplexityGate';
import type { IComplexityGateCondition } from '../types/IComplexity';

// ─────────────────────────────────────────────────────────────────────────────
// Griffel styles
// ─────────────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  entering: {
    animationName: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animationDuration: TRANSITION_FAST,
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
});

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
 *   <AdvancedFilterForm /> {/* keepMounted: preserves user-typed filter values *\/}
 * </HbcComplexityGate>
 */
export function HbcComplexityGate({
  minTier,
  maxTier,
  children,
  fallback = null,
  keepMounted = false,
}: HbcComplexityGateProps): React.ReactElement | null {
  const styles = useStyles();
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
          className={isEntering ? styles.entering : undefined}
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
      className={isEntering ? styles.entering : undefined}
    >
      {children}
    </div>
  );
}
