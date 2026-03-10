import React, { useCallback, useRef, useState } from 'react';
import { useComplexity } from '@hbc/complexity';
import { useFieldAnnotation } from '../hooks/useFieldAnnotation';
import type { IFieldAnnotationConfig, AnnotationIntent } from '../types/IFieldAnnotation';
import { intentColorClass, resolveAnnotationConfig } from '../constants/annotationDefaults';
import { HbcAnnotationThread } from './HbcAnnotationThread';
import './HbcAnnotationMarker.css';

// ─────────────────────────────────────────────────────────────────────────────
// Derive the marker's visual state from open annotations (D-05)
// ─────────────────────────────────────────────────────────────────────────────

type MarkerVisualState =
  | 'hidden'          // No annotations on this field
  | 'open-clarification'
  | 'open-flag'
  | 'open-comment'
  | 'resolved-only';  // All annotations resolved

function resolveMarkerState(
  annotations: ReturnType<typeof useFieldAnnotation>['annotations']
): MarkerVisualState {
  if (annotations.length === 0) return 'hidden';

  const open = annotations.filter((a) => a.status === 'open');
  if (open.length === 0) return 'resolved-only';

  // Priority: clarification-request > flag-for-revision > comment
  if (open.some((a) => a.intent === 'clarification-request')) return 'open-clarification';
  if (open.some((a) => a.intent === 'flag-for-revision')) return 'open-flag';
  return 'open-comment';
}

function markerStateToIntent(state: MarkerVisualState): AnnotationIntent | 'resolved' | null {
  switch (state) {
    case 'open-clarification': return 'clarification-request';
    case 'open-flag': return 'flag-for-revision';
    case 'open-comment': return 'comment';
    case 'resolved-only': return 'resolved';
    default: return null;
  }
}

function buildTooltipText(openCount: number, state: MarkerVisualState): string {
  if (state === 'resolved-only') return 'All annotations resolved';
  if (openCount === 1) return '1 open annotation';
  return `${openCount} open annotations`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HbcAnnotationMarker
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcAnnotationMarkerProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: IFieldAnnotationConfig;
  canAnnotate?: boolean;
  canResolve?: boolean;
  forceVariant?: 'essential' | 'standard' | 'expert';
}

export function HbcAnnotationMarker({
  recordType,
  recordId,
  fieldKey,
  fieldLabel,
  config,
  canAnnotate = false,
  canResolve = false,
  forceVariant,
}: HbcAnnotationMarkerProps) {
  const { tier: contextTier } = useComplexity();
  const variant = forceVariant ?? contextTier;

  const resolvedConfig = resolveAnnotationConfig(config);

  // In Essential mode, render nothing (D-05)
  if (variant === 'essential') return null;

  // For read-only viewers where visibleToViewers is false, render nothing
  const isViewer = !canAnnotate && !canResolve;
  if (isViewer && !resolvedConfig.visibleToViewers) return null;

  return (
    <HbcAnnotationMarkerInner
      recordType={recordType}
      recordId={recordId}
      fieldKey={fieldKey}
      fieldLabel={fieldLabel}
      config={resolvedConfig}
      canAnnotate={canAnnotate}
      canResolve={canResolve}
      variant={variant}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner — always mounted when complexity check passes
// ─────────────────────────────────────────────────────────────────────────────

interface InnerProps {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  config: Required<IFieldAnnotationConfig>;
  canAnnotate: boolean;
  canResolve: boolean;
  variant: 'standard' | 'expert';
}

function HbcAnnotationMarkerInner({
  recordType,
  recordId,
  fieldKey,
  fieldLabel,
  config,
  canAnnotate,
  canResolve,
  variant,
}: InnerProps) {
  const { annotations, openCount } = useFieldAnnotation(recordType, recordId, fieldKey);
  const [threadOpen, setThreadOpen] = useState(false);
  const markerRef = useRef<HTMLButtonElement>(null);

  const markerState = resolveMarkerState(annotations);
  const intent = markerStateToIntent(markerState);
  const tooltipText = buildTooltipText(openCount, markerState);

  // Zero DOM footprint when no annotations exist and user cannot annotate (D-09)
  if (markerState === 'hidden' && !canAnnotate) return null;

  const colorClass = intent ? intentColorClass[intent] ?? 'grey' : 'transparent';
  const dotClass = markerState === 'hidden'
    ? 'hbc-annotation-marker--add-only'
    : `hbc-annotation-marker--${colorClass}`;

  const handleClick = useCallback(() => {
    setThreadOpen((prev) => !prev);
  }, []);

  const handleThreadClose = useCallback(() => {
    setThreadOpen(false);
  }, []);

  return (
    <>
      <button
        ref={markerRef}
        type="button"
        className={`hbc-annotation-marker ${dotClass}`}
        aria-label={markerState === 'hidden' ? 'Add annotation' : tooltipText}
        aria-expanded={threadOpen}
        aria-haspopup="dialog"
        title={markerState === 'hidden' ? 'Add annotation' : tooltipText}
        onClick={handleClick}
        data-testid="hbc-annotation-marker"
      >
        {/* Expert mode: open count badge (D-05) */}
        {variant === 'expert' && openCount > 0 && (
          <span className="hbc-annotation-marker__count" aria-hidden="true">
            {openCount}
          </span>
        )}

        {/* Resolved-only: checkmark indicator */}
        {markerState === 'resolved-only' && (
          <span className="hbc-annotation-marker__resolved-icon" aria-hidden="true">✓</span>
        )}
      </button>

      {/* Thread popover — anchored to the marker button (D-06) */}
      {threadOpen && (
        <HbcAnnotationThread
          recordType={recordType}
          recordId={recordId}
          fieldKey={fieldKey}
          fieldLabel={fieldLabel}
          config={config}
          canAnnotate={canAnnotate}
          canResolve={canResolve}
          anchorRef={markerRef}
          onClose={handleThreadClose}
        />
      )}
    </>
  );
}
