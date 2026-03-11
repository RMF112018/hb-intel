/**
 * HbcAiTrustMeter — SF15-T06 (D-03)
 *
 * Progressive confidence and rationale disclosure component
 * for Essential/Standard/Expert trust tiers.
 */
import { useMemo, type FC } from 'react';

import type { AiTrustLevel, IAiConfidenceDetails } from '../types/index.js';

/** Props for the Trust Meter component. */
export interface HbcAiTrustMeterProps {
  readonly trustLevel: AiTrustLevel;
  readonly confidence: number;
  readonly confidenceDetails?: IAiConfidenceDetails;
  readonly variant?: 'badge' | 'inline' | 'expanded';
}

const BADGE_COLORS: Record<string, string> = {
  high: '#28a745',
  medium: '#ffc107',
  low: '#dc3545',
};

function badgeColorFromScore(score: number): string {
  if (score >= 0.7) return BADGE_COLORS['high'] as string;
  if (score >= 0.4) return BADGE_COLORS['medium'] as string;
  return BADGE_COLORS['low'] as string;
}

/**
 * HbcAiTrustMeter — renders confidence badge, rationale, and source
 * attribution with progressive disclosure by trust level.
 */
export const HbcAiTrustMeter: FC<HbcAiTrustMeterProps> = ({
  trustLevel,
  confidence,
  confidenceDetails,
  variant: _variant,
}) => {
  const badgeLevel = confidenceDetails?.confidenceBadge;

  const badgeColor = useMemo(() => {
    if (badgeLevel) return BADGE_COLORS[badgeLevel] ?? BADGE_COLORS['medium'] as string;
    return badgeColorFromScore(confidence);
  }, [badgeLevel, confidence]);

  const badgeLabel = useMemo(() => {
    if (badgeLevel) return badgeLevel.charAt(0).toUpperCase() + badgeLevel.slice(1);
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.4) return 'Medium';
    return 'Low';
  }, [badgeLevel, confidence]);

  return (
    <div data-testid="ai-trust-meter">
      {/* Badge pill — always shown */}
      <span
        data-testid="ai-trust-meter-badge"
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: '0.75em',
          fontWeight: 600,
          color: '#fff',
          background: badgeColor,
        }}
      >
        {badgeLabel}
      </span>

      {/* Essential: disclaimer only */}
      {trustLevel === 'essential' ? (
        <span
          data-testid="ai-trust-meter-disclaimer"
          style={{ marginLeft: 8, fontSize: '0.8em', color: '#666' }}
        >
          AI-generated content. Verify before use.
        </span>
      ) : null}

      {/* Standard: rationaleShort */}
      {trustLevel === 'standard' && confidenceDetails?.rationaleShort ? (
        <span
          data-testid="ai-trust-meter-rationale-short"
          style={{ marginLeft: 8, fontSize: '0.85em', color: '#555' }}
        >
          {confidenceDetails.rationaleShort}
        </span>
      ) : null}

      {/* Expert: full details */}
      {trustLevel === 'expert' ? (
        <div data-testid="ai-trust-meter-expert" style={{ marginTop: 6, fontSize: '0.85em' }}>
          <div data-testid="ai-trust-meter-score" style={{ color: '#333' }}>
            Score: {confidenceDetails?.confidenceScore ?? confidence}
          </div>

          {confidenceDetails?.rationaleShort ? (
            <div data-testid="ai-trust-meter-rationale-short" style={{ color: '#555', marginTop: 2 }}>
              {confidenceDetails.rationaleShort}
            </div>
          ) : null}

          {confidenceDetails?.rationaleLong ? (
            <details data-testid="ai-trust-meter-rationale-long" style={{ marginTop: 4 }}>
              <summary style={{ cursor: 'pointer', color: '#0066cc' }}>Full rationale</summary>
              <p style={{ margin: '4px 0', color: '#444' }}>{confidenceDetails.rationaleLong}</p>
            </details>
          ) : null}

          {confidenceDetails?.citedSources && confidenceDetails.citedSources.length > 0 ? (
            <ul data-testid="ai-trust-meter-sources" style={{ margin: '4px 0', paddingLeft: 18 }}>
              {confidenceDetails.citedSources.map((src) => (
                <li key={src.key}>{src.label}</li>
              ))}
            </ul>
          ) : null}

          {confidenceDetails?.modelDeploymentName ? (
            <div data-testid="ai-trust-meter-model" style={{ color: '#888', marginTop: 2 }}>
              Model: {confidenceDetails.modelDeploymentName} v{confidenceDetails.modelDeploymentVersion}
            </div>
          ) : null}

          {confidenceDetails?.tokenUsage ? (
            <div data-testid="ai-trust-meter-token-usage" style={{ color: '#888', marginTop: 2 }}>
              Tokens: {confidenceDetails.tokenUsage.prompt} prompt + {confidenceDetails.tokenUsage.completion} completion = {confidenceDetails.tokenUsage.total} total
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

HbcAiTrustMeter.displayName = 'HbcAiTrustMeter';
