/**
 * HbcAiTrustMeter — SF15-T06 (D-03)
 *
 * Progressive confidence and rationale disclosure component
 * for Essential/Standard/Expert trust tiers.
 */
import { useMemo, type FC } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_STATUS_RAMP_AMBER,
  HBC_SPACE_SM,
  HBC_RADIUS_XL,
} from '@hbc/ui-kit/theme';

import type { AiTrustLevel, IAiConfidenceDetails } from '../types/index.js';

/** Props for the Trust Meter component. */
export interface HbcAiTrustMeterProps {
  readonly trustLevel: AiTrustLevel;
  readonly confidence: number;
  readonly confidenceDetails?: IAiConfidenceDetails;
  readonly variant?: 'badge' | 'inline' | 'expanded';
}

const TOKEN_COLORS: Record<string, string> = {
  high: HBC_STATUS_COLORS.success,
  medium: HBC_STATUS_RAMP_AMBER[50],
  low: HBC_STATUS_COLORS.error,
};

function tokenColorFromScore(score: number): string {
  if (score >= 0.7) return TOKEN_COLORS['high'] as string;
  if (score >= 0.4) return TOKEN_COLORS['medium'] as string;
  return TOKEN_COLORS['low'] as string;
}

const useStyles = makeStyles({
  badge: {
    display: 'inline-block',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_XL,
    fontSize: '0.75em',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['surface-0'],
  },
  disclaimer: {
    marginLeft: `${HBC_SPACE_SM}px`,
    fontSize: '0.8em',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  rationaleShort: {
    marginLeft: `${HBC_SPACE_SM}px`,
    fontSize: '0.85em',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  expertBlock: {
    marginTop: '6px',
    fontSize: '0.85em',
  },
  score: {
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  rationale: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '2px',
  },
  detailsSummary: {
    cursor: 'pointer',
    color: HBC_PRIMARY_BLUE,
  },
  detailsParagraph: {
    marginTop: '4px',
    marginBottom: '0',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  sourcesList: {
    marginTop: '4px',
    marginBottom: '0',
    paddingLeft: '18px',
  },
  modelInfo: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '2px',
  },
});

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
  const styles = useStyles();
  const badgeLevel = confidenceDetails?.confidenceBadge;

  const badgeColor = useMemo(() => {
    if (badgeLevel) return TOKEN_COLORS[badgeLevel] ?? TOKEN_COLORS['medium'] as string;
    return tokenColorFromScore(confidence);
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
        className={styles.badge}
        style={{ background: badgeColor }}
      >
        {badgeLabel}
      </span>

      {/* Essential: disclaimer only */}
      {trustLevel === 'essential' ? (
        <span
          data-testid="ai-trust-meter-disclaimer"
          className={styles.disclaimer}
        >
          AI-generated content. Verify before use.
        </span>
      ) : null}

      {/* Standard: rationaleShort */}
      {trustLevel === 'standard' && confidenceDetails?.rationaleShort ? (
        <span
          data-testid="ai-trust-meter-rationale-short"
          className={styles.rationaleShort}
        >
          {confidenceDetails.rationaleShort}
        </span>
      ) : null}

      {/* Expert: full details */}
      {trustLevel === 'expert' ? (
        <div data-testid="ai-trust-meter-expert" className={styles.expertBlock}>
          <div data-testid="ai-trust-meter-score" className={styles.score}>
            Score: {confidenceDetails?.confidenceScore ?? confidence}
          </div>

          {confidenceDetails?.rationaleShort ? (
            <div data-testid="ai-trust-meter-rationale-short" className={styles.rationale}>
              {confidenceDetails.rationaleShort}
            </div>
          ) : null}

          {confidenceDetails?.rationaleLong ? (
            <details data-testid="ai-trust-meter-rationale-long" style={{ marginTop: '4px' }}>
              <summary className={styles.detailsSummary}>Full rationale</summary>
              <p className={styles.detailsParagraph}>{confidenceDetails.rationaleLong}</p>
            </details>
          ) : null}

          {confidenceDetails?.citedSources && confidenceDetails.citedSources.length > 0 ? (
            <ul data-testid="ai-trust-meter-sources" className={styles.sourcesList}>
              {confidenceDetails.citedSources.map((src) => (
                <li key={src.key}>{src.label}</li>
              ))}
            </ul>
          ) : null}

          {confidenceDetails?.modelDeploymentName ? (
            <div data-testid="ai-trust-meter-model" className={styles.modelInfo}>
              Model: {confidenceDetails.modelDeploymentName} v{confidenceDetails.modelDeploymentVersion}
            </div>
          ) : null}

          {confidenceDetails?.tokenUsage ? (
            <div data-testid="ai-trust-meter-token-usage" className={styles.modelInfo}>
              Tokens: {confidenceDetails.tokenUsage.prompt} prompt + {confidenceDetails.tokenUsage.completion} completion = {confidenceDetails.tokenUsage.total} total
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

HbcAiTrustMeter.displayName = 'HbcAiTrustMeter';
