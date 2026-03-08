import React, { useEffect } from 'react';
import type { BicComplexityVariant } from '../types/IBicNextMove';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcBicBlockedBannerProps {
  blockedReason: string;
  /**
   * Link to the blocking item if cross-module (D-09).
   * Rendered via onNavigate callback (SPA) or plain <a> fallback.
   */
  blockedByItem?: { label: string; href: string };
  /**
   * Router-agnostic navigation handler (D-09).
   * Pass router.navigate in PWA contexts.
   * Omit in SPFx contexts — plain <a> fallback applies.
   * A dev-mode warning is emitted if absent and blockedByItem.href is a relative path.
   */
  onNavigate?: (href: string) => void;
  /** Complexity override (D-05) */
  forceVariant?: BicComplexityVariant;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity tier rendering matrix (D-05)
//
// Essential: Reason text only
// Standard:  Reason text + blocked-by link (via onNavigate / <a>)
// Expert:    Reason text + blocked-by link + escalation path note
// ─────────────────────────────────────────────────────────────────────────────

export function HbcBicBlockedBanner({
  blockedReason,
  blockedByItem,
  onNavigate,
  forceVariant,
  className = '',
}: HbcBicBlockedBannerProps): React.ReactElement {
  // D-09: Dev-mode warning when onNavigate is absent and href is relative
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && blockedByItem && !onNavigate) {
      const isRelative = blockedByItem.href.startsWith('/');
      if (isRelative) {
        console.warn(
          '[bic-next-move] HbcBicBlockedBanner: onNavigate is not provided but blockedByItem.href ' +
          `("${blockedByItem.href}") appears to be a relative PWA route. ` +
          'Falling back to <a> tag which will cause a full page reload in SPA context. ' +
          'Pass onNavigate={(href) => router.navigate({ to: href })} from your PWA context.'
        );
      }
    }
  }, [blockedByItem, onNavigate]);

  // Resolve variant — banner inherits forceVariant when passed from HbcBicDetail
  const variant = forceVariant ?? 'standard';

  return (
    <div
      className={`hbc-bic-blocked-banner ${className}`}
      role="alert"
      aria-live="polite"
      aria-label="Item is blocked"
    >
      <span className="hbc-bic-blocked-banner__icon" aria-hidden="true">🔒</span>

      <div className="hbc-bic-blocked-banner__content">
        {/* Reason — all variants */}
        <p className="hbc-bic-blocked-banner__reason">{blockedReason}</p>

        {/* Blocked-by link — Standard and Expert only (D-05) */}
        {variant !== 'essential' && blockedByItem && (
          <BlockedByLink
            item={blockedByItem}
            onNavigate={onNavigate}
          />
        )}

        {/* Escalation note — Expert only (D-05) */}
        {variant === 'expert' && (
          <p className="hbc-bic-blocked-banner__escalation-note">
            This item cannot advance until the blocking condition is resolved.
            If unresolved, it will escalate to the assigned escalation owner.
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Blocked-by link sub-component (D-09)
// ─────────────────────────────────────────────────────────────────────────────

interface BlockedByLinkProps {
  item: { label: string; href: string };
  onNavigate?: (href: string) => void;
}

function BlockedByLink({ item, onNavigate }: BlockedByLinkProps): React.ReactElement {
  if (onNavigate) {
    // SPA navigation — no page reload (D-09)
    return (
      <button
        className="hbc-bic-blocked-banner__link hbc-bic-blocked-banner__link--spa"
        onClick={() => onNavigate(item.href)}
        type="button"
      >
        View blocking item: {item.label}
      </button>
    );
  }

  // Plain anchor fallback — SPFx and non-SPA contexts (D-09)
  return (
    <a
      className="hbc-bic-blocked-banner__link hbc-bic-blocked-banner__link--anchor"
      href={item.href}
    >
      View blocking item: {item.label}
    </a>
  );
}
