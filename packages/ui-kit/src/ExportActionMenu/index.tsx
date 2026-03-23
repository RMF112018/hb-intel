/**
 * ExportActionMenu — SF24-T05
 *
 * Normalized export entry surface with complexity-tier rendering,
 * recommended export badge, suppressed format hints, and BIC avatar
 * projection for review/handoff cues.
 *
 * Pure presentational — data-in, callbacks-out. No hooks or runtime state.
 *
 * Governing: SF24-T05, L-02 (BIC ownership), L-03 (complexity), L-05 (AI)
 */

import React from 'react';

// ── Prop Types ───────────────────────────────────────────────────────────

export interface ExportMenuOption {
  /** Export output format. */
  format: 'csv' | 'xlsx' | 'pdf' | 'print';
  /** Export intent classification. */
  intent: string;
  /** User-facing option label. */
  label: string;
  /** User-facing description of what this export produces. */
  description: string;
  /** Whether this option is currently available. */
  enabled: boolean;
  /** User-facing reason if disabled (null if enabled). */
  disabledReason: string | null;
}

export interface ExportMenuRecommendation {
  /** The recommended export option. */
  option: ExportMenuOption;
  /** User-facing reason why this option is recommended. */
  reason: string;
}

export interface ExportMenuSuppressedFormat {
  /** Suppressed format identifier. */
  format: string;
  /** User-facing reason for suppression. */
  reason: string;
}

export interface ExportMenuReviewOwner {
  /** Owner UPN. */
  upn: string;
  /** Owner display name. */
  displayName: string;
  /** Owner role. */
  role: string;
}

export interface ExportActionMenuProps {
  /** Available export options. */
  options: ExportMenuOption[];
  /** Top recommended export with reason (null if none). */
  recommended: ExportMenuRecommendation | null;
  /** Suppressed formats with user-facing reasons. */
  suppressedFormats: ExportMenuSuppressedFormat[];
  /** Complexity tier governing menu depth. */
  complexityTier: 'essential' | 'standard' | 'expert';
  /** Current BIC owner avatars for review/handoff cues. */
  reviewOwners: ExportMenuReviewOwner[];
  /** Whether the menu is in a loading state. */
  loading?: boolean;
  /** Whether the menu is disabled. */
  disabled?: boolean;
  /** Fired when user selects an export option. */
  onSelectOption: (option: ExportMenuOption) => void;
  /** Fired when user clicks composition entry (Expert tier only). */
  onOpenComposition?: () => void;
  /** Fired when user clicks configure link (Expert tier only). */
  onOpenConfigure?: () => void;
}

// ── Styles ───────────────────────────────────────────────────────────────

const menuContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: '220px',
};

const optionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 12px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  borderRadius: '4px',
  width: '100%',
};

const disabledStyle: React.CSSProperties = {
  ...optionStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const recommendedBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#0078d4',
  marginLeft: '8px',
};

const suppressedStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#797775',
  padding: '4px 12px',
  fontStyle: 'italic',
};

const reviewOwnerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#484644',
  padding: '4px 12px',
};

const avatarStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  background: '#0078d4',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  fontWeight: 600,
};

const sectionLinkStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  color: '#0078d4',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  textAlign: 'left',
};

// ── Component ────────────────────────────────────────────────────────────

/**
 * Export action menu with complexity-tier rendering.
 *
 * - Essential: single primary button for highest-value format
 * - Standard: full dropdown with all formats, recommended badge, suppressed hints
 * - Expert: standard + composition entry + configure link
 */
export function ExportActionMenu({
  options,
  recommended,
  suppressedFormats,
  complexityTier,
  reviewOwners,
  loading = false,
  disabled = false,
  onSelectOption,
  onOpenComposition,
  onOpenConfigure,
}: ExportActionMenuProps): React.ReactElement {
  if (loading) {
    return <div style={menuContainerStyle}>Loading export options...</div>;
  }

  // Essential tier: single button for recommended or first enabled option
  if (complexityTier === 'essential') {
    const primaryOption = recommended?.option ?? options.find(o => o.enabled);
    if (!primaryOption) {
      return <div style={menuContainerStyle}>No export options available</div>;
    }
    return (
      <div style={menuContainerStyle}>
        <button
          style={optionStyle}
          disabled={disabled}
          onClick={() => onSelectOption(primaryOption)}
        >
          <span style={{ fontWeight: 600 }}>{primaryOption.label}</span>
          <span style={{ fontSize: '12px', color: '#484644' }}>{primaryOption.description}</span>
        </button>
      </div>
    );
  }

  // Standard + Expert tier: full menu
  return (
    <div style={menuContainerStyle}>
      {/* Export options */}
      {options.map((option) => {
        const isRecommended = recommended?.option.format === option.format
          && recommended?.option.intent === option.intent;

        return (
          <button
            key={`${option.format}-${option.intent}`}
            style={option.enabled ? optionStyle : disabledStyle}
            disabled={disabled || !option.enabled}
            onClick={() => option.enabled && onSelectOption(option)}
            title={option.disabledReason ?? undefined}
          >
            <span>
              <span style={{ fontWeight: 600 }}>{option.label}</span>
              {isRecommended && (
                <span style={recommendedBadgeStyle}>Recommended</span>
              )}
            </span>
            <span style={{ fontSize: '12px', color: '#484644' }}>{option.description}</span>
            {!option.enabled && option.disabledReason && (
              <span style={{ fontSize: '11px', color: '#a4262c' }}>{option.disabledReason}</span>
            )}
            {isRecommended && recommended?.reason && (
              <span style={{ fontSize: '11px', color: '#0078d4' }}>{recommended.reason}</span>
            )}
          </button>
        );
      })}

      {/* Suppressed format hints */}
      {suppressedFormats.map((sf) => (
        <div key={sf.format} style={suppressedStyle}>
          {sf.format}: {sf.reason}
        </div>
      ))}

      {/* BIC review owner projection */}
      {reviewOwners.length > 0 && reviewOwners.map((owner) => (
        <div key={owner.upn} style={reviewOwnerStyle}>
          <span style={avatarStyle}>{owner.displayName.charAt(0)}</span>
          <span>{owner.displayName} ({owner.role})</span>
        </div>
      ))}

      {/* Expert tier: composition + configure */}
      {complexityTier === 'expert' && (
        <>
          {onOpenComposition && (
            <button style={sectionLinkStyle} onClick={onOpenComposition}>
              Compose report...
            </button>
          )}
          {onOpenConfigure && (
            <button style={sectionLinkStyle} onClick={onOpenConfigure}>
              Configure export...
            </button>
          )}
        </>
      )}
    </div>
  );
}
