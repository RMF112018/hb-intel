import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { useFieldAnnotations } from '../hooks/useFieldAnnotations';
import type { IFieldAnnotation, IFieldAnnotationConfig } from '../types/IFieldAnnotation';
import { intentLabel, intentColorClass } from '../constants/annotationDefaults';
import './HbcAnnotationSummary.css';

export interface HbcAnnotationSummaryProps {
  recordType: string;
  recordId: string;
  config: IFieldAnnotationConfig;
  /** Called when user clicks a summary item to scroll the form to that field (D-09) */
  onFieldFocus?: (fieldKey: string) => void;
  forceVariant?: 'standard' | 'expert';
}

export function HbcAnnotationSummary({
  recordType,
  recordId,
  config: _config,
  onFieldFocus,
  forceVariant,
}: HbcAnnotationSummaryProps) {
  const { tier: contextTier } = useComplexity();
  const variant = forceVariant ?? contextTier;

  // All hooks called before any early return (React Rules of Hooks)
  const { annotations, counts, isLoading } = useFieldAnnotations(recordType, recordId);

  // D-05: Essential hides summary; D-06: Not rendered in SPFx (consumer responsibility)
  if (variant === 'essential') return null;

  const openAnnotations = annotations.filter((a) => a.status === 'open');

  // Group open annotations by fieldKey
  const byField = openAnnotations.reduce<Record<string, IFieldAnnotation[]>>((acc, a) => {
    if (!acc[a.fieldKey]) acc[a.fieldKey] = [];
    acc[a.fieldKey].push(a);
    return acc;
  }, {});

  const fieldKeys = Object.keys(byField);
  const isExpanded = variant === 'expert';

  if (isLoading) {
    return (
      <aside className="hbc-annotation-summary hbc-annotation-summary--loading" aria-busy="true">
        <span className="hbc-annotation-summary__loading-text">Loading annotations…</span>
      </aside>
    );
  }

  if (counts.totalOpen === 0) {
    return (
      <aside className="hbc-annotation-summary hbc-annotation-summary--empty">
        <span className="hbc-annotation-summary__empty-text">
          No open annotations
        </span>
        {counts.totalResolved > 0 && (
          <span className="hbc-annotation-summary__resolved-count">
            {counts.totalResolved} resolved
          </span>
        )}
      </aside>
    );
  }

  return (
    <aside
      className={`hbc-annotation-summary ${isExpanded ? 'hbc-annotation-summary--expanded' : ''}`}
      aria-label="Open annotations"
    >
      {/* Summary header with counts */}
      <header className="hbc-annotation-summary__header">
        <h3 className="hbc-annotation-summary__title">
          {counts.totalOpen} open annotation{counts.totalOpen !== 1 ? 's' : ''}
        </h3>
        <div className="hbc-annotation-summary__breakdown">
          {counts.openClarificationRequests > 0 && (
            <span className="hbc-annotation-summary__breakdown-item hbc-annotation-summary__breakdown-item--red">
              {counts.openClarificationRequests} clarification{counts.openClarificationRequests !== 1 ? 's' : ''}
            </span>
          )}
          {counts.openRevisionFlags > 0 && (
            <span className="hbc-annotation-summary__breakdown-item hbc-annotation-summary__breakdown-item--amber">
              {counts.openRevisionFlags} revision flag{counts.openRevisionFlags !== 1 ? 's' : ''}
            </span>
          )}
          {counts.openComments > 0 && (
            <span className="hbc-annotation-summary__breakdown-item hbc-annotation-summary__breakdown-item--blue">
              {counts.openComments} comment{counts.openComments !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* Per-field breakdown (D-05: Standard shows count only; Expert shows full breakdown) */}
      {isExpanded && fieldKeys.length > 0 && (
        <ul className="hbc-annotation-summary__field-list" aria-label="Annotations by field">
          {fieldKeys.map((fieldKey) => {
            const fieldAnnotations = byField[fieldKey];
            const topAnnotation = fieldAnnotations[0];

            return (
              <li
                key={fieldKey}
                className="hbc-annotation-summary__field-item"
              >
                <button
                  type="button"
                  className="hbc-annotation-summary__field-btn"
                  onClick={() => onFieldFocus?.(fieldKey)}
                  aria-label={`Go to ${topAnnotation.fieldLabel} — ${fieldAnnotations.length} open annotation${fieldAnnotations.length !== 1 ? 's' : ''}`}
                >
                  <span className="hbc-annotation-summary__field-label">
                    {topAnnotation.fieldLabel}
                  </span>
                  <span className="hbc-annotation-summary__field-count">
                    {fieldAnnotations.length}
                  </span>
                </button>

                {/* Intent badges for annotations on this field */}
                <ul className="hbc-annotation-summary__annotation-list">
                  {fieldAnnotations.map((annotation) => (
                    <li
                      key={annotation.annotationId}
                      className="hbc-annotation-summary__annotation-row"
                    >
                      <span
                        className={`hbc-annotation-badge hbc-annotation-badge--${intentColorClass[annotation.intent]}`}
                      >
                        {intentLabel[annotation.intent]}
                      </span>
                      <span className="hbc-annotation-summary__annotation-author">
                        {annotation.author.displayName}
                      </span>
                      <span className="hbc-annotation-summary__annotation-excerpt">
                        {annotation.body.length > 60
                          ? `${annotation.body.slice(0, 60)}…`
                          : annotation.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}

      {/* Standard mode: show field count only (D-05) */}
      {!isExpanded && fieldKeys.length > 0 && (
        <p className="hbc-annotation-summary__field-count-summary">
          Across {fieldKeys.length} field{fieldKeys.length !== 1 ? 's' : ''}
        </p>
      )}
    </aside>
  );
}
