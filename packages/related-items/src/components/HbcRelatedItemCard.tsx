/**
 * HbcRelatedItemCard — D-SF14-T06, D-05, D-07
 *
 * Deterministic related-item card renderer for SF14-T06.
 *
 * Depends on:
 * - SF14-T02 related item contracts
 * - SF14-T03 API metadata fields (relationship/version/bic/ai)
 * - SF14-T04 hook output shape and SF14-T05 panel composition
 */
import { useMemo, type FC, type ReactElement } from 'react';
import { useComplexity } from '@hbc/complexity';
import type { IRelatedItem } from '../types/index.js';

export interface HbcRelatedItemCardProps {
  item: IRelatedItem;
  showBicState?: boolean;
}

function formatRelationshipDirection(direction: IRelatedItem['relationship']): string {
  switch (direction) {
    case 'originated':
      return 'Originated';
    case 'converted-to':
      return 'Converted To';
    case 'has':
      return 'Has';
    case 'references':
      return 'References';
    case 'blocks':
      return 'Blocks';
    case 'is-blocked-by':
      return 'Blocked By';
    default:
      return 'Related';
  }
}

function renderModuleIcon(recordType: string, moduleIcon?: string): ReactElement {
  const iconToken = (moduleIcon || recordType || '?').trim().slice(0, 2).toUpperCase();
  return (
    <span
      aria-label={`Module ${moduleIcon || recordType}`}
      title={moduleIcon || recordType}
      style={{
        display: 'inline-flex',
        width: 24,
        height: 24,
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e6edf4',
        color: '#004b87',
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {iconToken}
    </span>
  );
}

/** Clickable card representing a single related item with deterministic metadata rendering. */
export const HbcRelatedItemCard: FC<HbcRelatedItemCardProps> = ({
  item,
  showBicState = true,
}) => {
  const { tier } = useComplexity();
  const safeLabel = item.label?.trim() || item.recordId;
  const safeRecordType = item.recordType?.trim() || 'related-record';
  const safeRelationshipLabel = item.relationshipLabel?.trim() || 'Related';
  const directionLabel = formatRelationshipDirection(item.relationship);

  const versionSummary = useMemo(() => {
    if (!item.versionChip) {
      return null;
    }

    const changedDate = new Date(item.versionChip.lastChanged);
    const changedLabel = Number.isNaN(changedDate.getTime())
      ? item.versionChip.lastChanged
      : changedDate.toLocaleDateString('en-US');

    return {
      changedLabel,
      author: item.versionChip.author,
    };
  }, [item.versionChip]);

  // Recommendation indicator intentionally uses two paths for deterministic UX:
  // explicit confidence signal, or AI-labeled relationship copy from upstream hooks/API.
  const isAiSuggestion =
    typeof item.aiConfidence === 'number' ||
    safeRelationshipLabel.toLowerCase().includes('ai');

  const containerStyles: React.CSSProperties = {
    display: 'block',
    border: '1px solid #d0d7de',
    borderRadius: 8,
    padding: 10,
    background: '#fff',
    textDecoration: 'none',
    color: 'inherit',
  };

  const content = (
    <article
      data-testid="related-item-card"
      data-record-id={item.recordId}
      style={{ display: 'grid', gap: 8 }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {renderModuleIcon(safeRecordType, item.moduleIcon)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{safeLabel}</p>
          <p style={{ margin: 0, color: '#57606a', fontSize: 12 }}>{safeRecordType}</p>
        </div>
        {item.status ? (
          <span
            data-testid="related-item-status"
            style={{ fontSize: 11, border: '1px solid #d0d7de', borderRadius: 999, padding: '2px 8px' }}
          >
            {item.status}
          </span>
        ) : null}
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <span
          data-testid="related-item-relationship"
          style={{ fontSize: 11, border: '1px solid #d0d7de', borderRadius: 999, padding: '2px 8px' }}
        >
          {safeRelationshipLabel}
        </span>

        <span
          data-testid="related-item-direction"
          style={{ fontSize: 11, border: '1px solid #d0d7de', borderRadius: 999, padding: '2px 8px' }}
        >
          {directionLabel}
        </span>

        {showBicState && item.bicState ? (
          <span
            data-testid="related-item-bic"
            style={{ fontSize: 11, border: '1px solid #d0d7de', borderRadius: 999, padding: '2px 8px' }}
          >
            BIC: {item.bicState.currentState}
          </span>
        ) : null}

        {versionSummary ? (
          <details data-testid="related-item-version-chip" style={{ fontSize: 11 }}>
            <summary>Version</summary>
            <div style={{ marginTop: 4 }}>
              <p style={{ margin: 0 }}>Last changed: {versionSummary.changedLabel}</p>
              <p style={{ margin: 0 }}>Author: {versionSummary.author}</p>
            </div>
          </details>
        ) : null}
      </div>

      {tier === 'expert' && isAiSuggestion ? (
        <button
          type="button"
          data-testid="related-item-ai-suggest"
          style={{ justifySelf: 'start', fontSize: 12, border: '1px solid #d0d7de', borderRadius: 6, padding: '4px 8px' }}
        >
          Suggest
        </button>
      ) : null}
    </article>
  );

  if (!item.href) {
    return (
      <div style={containerStyles}>
        {content}
      </div>
    );
  }

  return (
    <a href={item.href} style={containerStyles} data-testid="related-item-link">
      {content}
    </a>
  );
};

HbcRelatedItemCard.displayName = 'HbcRelatedItemCard';
