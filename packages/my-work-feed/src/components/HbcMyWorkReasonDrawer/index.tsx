/**
 * HbcMyWorkReasonDrawer — SF29-T06
 *
 * Explainability tearsheet with 2–3 steps depending on tier.
 * Essential: returns null. Standard: 2 steps (Why Surfaced, Lifecycle).
 * Expert: all 3 steps (+ Source Provenance) with score and dedupe detail.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcTearsheet, HbcTypography, HbcStatusBadge, HbcSpinner } from '@hbc/ui-kit';
import { useMyWorkReasoning } from '../../hooks/useMyWorkReasoning.js';
import type { TearsheetStep } from '@hbc/ui-kit';

export interface IHbcMyWorkReasonDrawerProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export function HbcMyWorkReasonDrawer({
  itemId,
  open,
  onClose,
  className,
}: IHbcMyWorkReasonDrawerProps): JSX.Element | null {
  const { tier } = useComplexity();
  const { reasoning, isLoading } = useMyWorkReasoning(itemId);

  if (tier === 'essential') return null;
  if (!open) return null;
  if (!itemId) return null;

  const steps: TearsheetStep[] = [];

  if (isLoading || !reasoning) {
    steps.push({
      id: 'loading',
      label: 'Loading',
      content: (
        <div className="hbc-my-work-reason-drawer__loading">
          <HbcSpinner size="md" />
        </div>
      ),
    });
  } else {
    // Step 1: Why Surfaced
    steps.push({
      id: 'why-surfaced',
      label: 'Why Surfaced',
      content: (
        <div className="hbc-my-work-reason-drawer__step">
          <HbcTypography intent="body">{reasoning.rankingReason.primaryReason}</HbcTypography>
          {reasoning.rankingReason.contributingReasons.length > 0 && (
            <ul className="hbc-my-work-reason-drawer__reasons">
              {reasoning.rankingReason.contributingReasons.map((reason, idx) => (
                <li key={idx}>
                  <HbcTypography intent="bodySmall">{reason}</HbcTypography>
                </li>
              ))}
            </ul>
          )}
          {tier === 'expert' && reasoning.rankingReason.score != null && (
            <HbcTypography intent="bodySmall">
              Score: {reasoning.rankingReason.score}
            </HbcTypography>
          )}
        </div>
      ),
    });

    // Step 2: Lifecycle & Permissions
    steps.push({
      id: 'lifecycle',
      label: 'Lifecycle & Permissions',
      content: (
        <div className="hbc-my-work-reason-drawer__step">
          {reasoning.lifecycle.currentStepLabel && (
            <HbcTypography intent="body">
              Current: {reasoning.lifecycle.currentStepLabel}
            </HbcTypography>
          )}
          {reasoning.lifecycle.nextStepLabel && (
            <HbcTypography intent="bodySmall">
              Next: {reasoning.lifecycle.nextStepLabel}
            </HbcTypography>
          )}
          {reasoning.lifecycle.blockedDependencyLabel && (
            <HbcStatusBadge variant="warning" label={reasoning.lifecycle.blockedDependencyLabel} />
          )}
          <HbcTypography intent="bodySmall">
            {reasoning.permissionState.canAct ? 'You can act on this item' : reasoning.permissionState.cannotActReason ?? 'You cannot act on this item'}
          </HbcTypography>
        </div>
      ),
    });

    // Step 3: Source Provenance (expert only)
    if (tier === 'expert') {
      steps.push({
        id: 'source-provenance',
        label: 'Source Provenance',
        content: (
          <div className="hbc-my-work-reason-drawer__step">
            {reasoning.sourceMeta.map((meta, idx) => (
              <div key={idx} className="hbc-my-work-reason-drawer__source">
                <HbcStatusBadge variant="info" label={meta.source} />
                {meta.explanation && (
                  <HbcTypography intent="bodySmall">{meta.explanation}</HbcTypography>
                )}
              </div>
            ))}
            {reasoning.dedupeInfo && (
              <HbcTypography intent="bodySmall">
                Dedupe: {reasoning.dedupeInfo.mergeReason}
              </HbcTypography>
            )}
            {reasoning.supersessionInfo && (
              <HbcTypography intent="bodySmall">
                Superseded: {reasoning.supersessionInfo.supersessionReason}
              </HbcTypography>
            )}
          </div>
        ),
      });
    }
  }

  return (
    <HbcTearsheet
      open={open}
      onClose={onClose}
      title={reasoning?.title ?? 'Reasoning'}
      steps={steps}
      className={className}
    />
  );
}
