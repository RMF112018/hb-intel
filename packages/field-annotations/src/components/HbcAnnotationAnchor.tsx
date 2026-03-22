import React, { useCallback, useRef, useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useFieldAnnotation } from '../hooks/useFieldAnnotation';
import type { AnchorType, IFieldAnnotationConfig, AnnotationIntent } from '../types/IFieldAnnotation';
import { intentColorClass, resolveAnnotationConfig } from '../constants/annotationDefaults';
import { HbcAnnotationThread } from './HbcAnnotationThread';
import './HbcAnnotationAnchor.css';

// ─────────────────────────────────────────────────────────────────────────────
// Visual state resolution (mirrors HbcAnnotationMarker pattern)
// ─────────────────────────────────────────────────────────────────────────────

type IndicatorVisualState =
  | 'hidden'
  | 'open-clarification'
  | 'open-flag'
  | 'open-comment'
  | 'resolved-only';

function resolveIndicatorState(
  annotations: ReturnType<typeof useFieldAnnotation>['annotations']
): IndicatorVisualState {
  if (annotations.length === 0) return 'hidden';

  const open = annotations.filter((a) => a.status === 'open');
  if (open.length === 0) return 'resolved-only';

  if (open.some((a) => a.intent === 'clarification-request')) return 'open-clarification';
  if (open.some((a) => a.intent === 'flag-for-revision')) return 'open-flag';
  return 'open-comment';
}

function indicatorStateToIntent(state: IndicatorVisualState): AnnotationIntent | 'resolved' | null {
  switch (state) {
    case 'open-clarification': return 'clarification-request';
    case 'open-flag': return 'flag-for-revision';
    case 'open-comment': return 'comment';
    case 'resolved-only': return 'resolved';
    default: return null;
  }
}

function buildIndicatorTooltip(openCount: number, state: IndicatorVisualState): string {
  if (state === 'resolved-only') return 'All annotations resolved';
  if (openCount === 1) return '1 open annotation';
  return `${openCount} open annotations`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HbcAnnotationAnchor — section/block annotation wrapper
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcAnnotationAnchorProps {
  recordType: string;
  recordId: string;
  /** Anchor key using section/block convention (e.g., 'section:financial-summary') */
  anchorKey: string;
  /** Human-readable label for the anchored region (e.g., 'Financial Summary') */
  anchorLabel: string;
  /** Anchor type — must be 'section' or 'block' */
  anchorType: Exclude<AnchorType, 'field'>;
  config: IFieldAnnotationConfig;
  canAnnotate?: boolean;
  canResolve?: boolean;
  forceVariant?: 'essential' | 'standard' | 'expert';
  /** The section or block content this anchor wraps */
  children: React.ReactNode;
}

export function HbcAnnotationAnchor({
  recordType,
  recordId,
  anchorKey,
  anchorLabel,
  anchorType,
  config,
  canAnnotate = false,
  canResolve = false,
  forceVariant,
  children,
}: HbcAnnotationAnchorProps) {
  const { tier: contextTier } = useComplexity();
  const variant = forceVariant ?? contextTier;

  const resolvedConfig = resolveAnnotationConfig(config);

  // Essential mode: render children without any annotation UI (D-05)
  if (variant === 'essential') return <>{children}</>;

  // Read-only viewers where visibleToViewers is false: render children only
  const isViewer = !canAnnotate && !canResolve;
  if (isViewer && !resolvedConfig.visibleToViewers) return <>{children}</>;

  return (
    <HbcAnnotationAnchorInner
      recordType={recordType}
      recordId={recordId}
      anchorKey={anchorKey}
      anchorLabel={anchorLabel}
      anchorType={anchorType}
      config={resolvedConfig}
      canAnnotate={canAnnotate}
      canResolve={canResolve}
      variant={variant}
    >
      {children}
    </HbcAnnotationAnchorInner>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner — always mounted when complexity check passes
// ─────────────────────────────────────────────────────────────────────────────

interface InnerProps {
  recordType: string;
  recordId: string;
  anchorKey: string;
  anchorLabel: string;
  anchorType: Exclude<AnchorType, 'field'>;
  config: Required<IFieldAnnotationConfig>;
  canAnnotate: boolean;
  canResolve: boolean;
  variant: 'standard' | 'expert';
  children: React.ReactNode;
}

function HbcAnnotationAnchorInner({
  recordType,
  recordId,
  anchorKey,
  anchorLabel,
  anchorType,
  config,
  canAnnotate,
  canResolve,
  variant,
  children,
}: InnerProps) {
  const { annotations, openCount } = useFieldAnnotation(recordType, recordId, anchorKey);
  const [threadOpen, setThreadOpen] = useState(false);
  const indicatorRef = useRef<HTMLButtonElement>(null);

  const indicatorState = resolveIndicatorState(annotations);
  const intent = indicatorStateToIntent(indicatorState);
  const tooltipText = buildIndicatorTooltip(openCount, indicatorState);

  const hasIndicator = indicatorState !== 'hidden' || canAnnotate;

  const handleClick = useCallback(() => {
    setThreadOpen((prev) => !prev);
  }, []);

  const handleThreadClose = useCallback(() => {
    setThreadOpen(false);
  }, []);

  const colorClass = intent ? intentColorClass[intent] ?? 'grey' : 'transparent';
  const indicatorClass = indicatorState === 'hidden'
    ? 'hbc-annotation-anchor__indicator--add-only'
    : `hbc-annotation-anchor__indicator--${colorClass}`;

  return (
    <div
      className={`hbc-annotation-anchor hbc-annotation-anchor--${anchorType}${hasIndicator ? ' hbc-annotation-anchor--interactive' : ''}`}
      data-testid="hbc-annotation-anchor"
      data-anchor-type={anchorType}
    >
      {children}

      {hasIndicator && (
        <button
          ref={indicatorRef}
          type="button"
          className={`hbc-annotation-anchor__indicator ${indicatorClass}`}
          aria-label={indicatorState === 'hidden' ? `Add annotation to ${anchorLabel}` : tooltipText}
          aria-expanded={threadOpen}
          aria-haspopup="dialog"
          title={indicatorState === 'hidden' ? `Add annotation to ${anchorLabel}` : tooltipText}
          onClick={handleClick}
          data-testid="hbc-annotation-anchor-indicator"
        >
          {variant === 'expert' && openCount > 0 && (
            <span className="hbc-annotation-anchor__count" aria-hidden="true">
              {openCount}
            </span>
          )}

          {indicatorState === 'resolved-only' && (
            <span className="hbc-annotation-anchor__resolved-icon" aria-hidden="true">✓</span>
          )}
        </button>
      )}

      {threadOpen && (
        <HbcAnnotationThread
          recordType={recordType}
          recordId={recordId}
          fieldKey={anchorKey}
          fieldLabel={anchorLabel}
          config={config}
          canAnnotate={canAnnotate}
          canResolve={canResolve}
          anchorRef={indicatorRef}
          onClose={handleThreadClose}
        />
      )}
    </div>
  );
}
