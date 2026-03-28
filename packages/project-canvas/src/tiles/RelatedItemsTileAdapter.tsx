/**
 * Related Items tile adapter — bridges @hbc/related-items into the canvas tile contract.
 *
 * Three complexity tiers per P3-C2 §5.4:
 * - Essential: count + top relationship
 * - Standard: 3-item preview with relationship types
 * - Expert: full related-items list with module grouping
 *
 * Governing: P3-C2 §5.4, P3-D4 (Related Items Contract)
 */
import React from 'react';
import type { ICanvasTileProps } from '../types/index.js';

/** Inline styles — D-07 SPFx compatibility */
const containerStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 4,
  padding: 12,
  fontFamily: 'inherit',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
};

const itemStyle: React.CSSProperties = {
  padding: '6px 0',
  borderBottom: '1px solid #f0f0f0',
  fontSize: 13,
};

const relationBadge: React.CSSProperties = {
  fontSize: 10,
  padding: '1px 5px',
  borderRadius: 3,
  backgroundColor: '#e8f1f8',
  color: '#004b87',
  marginRight: 6,
};

const moduleStyle: React.CSSProperties = { fontSize: 10, color: '#888', display: 'block', marginTop: 2 };
const emptyStyle: React.CSSProperties = { fontSize: 13, color: '#888', fontStyle: 'italic' };

/**
 * Mock related items scoped by project. Will be replaced by
 * real @hbc/related-items useRelatedItems() hook when available.
 */
function useMockRelatedItems(projectId: string) {
  return React.useMemo(() => [
    { id: `ri-${projectId}-1`, title: 'Subcontract SC-201 — Electrical', relationship: 'blocks', sourceModule: 'subcontract-readiness', status: 'Open' },
    { id: `ri-${projectId}-2`, title: 'Permit 14-B — Foundation', relationship: 'depends-on', sourceModule: 'permits', status: 'Pending' },
    { id: `ri-${projectId}-3`, title: 'RFI-047 — Structural Steel', relationship: 'informs', sourceModule: 'constraints', status: 'Awaiting Response' },
    { id: `ri-${projectId}-4`, title: 'Safety Corrective Action CA-12', relationship: 'triggered-by', sourceModule: 'safety', status: 'Open' },
    { id: `ri-${projectId}-5`, title: 'Budget Line BL-340 — HVAC', relationship: 'impacts', sourceModule: 'financial', status: 'Active' },
  ], [projectId]);
}

/** Essential: count + top relationship */
export function RelatedItemsTileEssential(props: ICanvasTileProps): React.ReactElement {
  const items = useMockRelatedItems(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Related Items</strong>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0078d4' }}>{items.length}</span>
      </div>
      {items.length > 0 ? (
        <div style={itemStyle}>
          <span style={relationBadge}>{items[0].relationship}</span>
          {items[0].title}
        </div>
      ) : (
        <div style={emptyStyle}>No related items</div>
      )}
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
RelatedItemsTileEssential.displayName = 'RelatedItemsTile[essential]';

/** Standard: 3-item preview with relationship types */
export function RelatedItemsTileStandard(props: ICanvasTileProps): React.ReactElement {
  const items = useMockRelatedItems(props.projectId);
  const preview = items.slice(0, 3);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Related Items</strong>
        <span style={{ fontSize: 10, color: '#888' }}>{items.length} items</span>
      </div>
      {preview.length === 0 ? (
        <div style={emptyStyle}>No related items</div>
      ) : (
        <>
          {preview.map((item) => (
            <div key={item.id} style={itemStyle}>
              <span style={relationBadge}>{item.relationship}</span>
              {item.title}
              <span style={moduleStyle}>{item.sourceModule} · {item.status}</span>
            </div>
          ))}
          {items.length > 3 && (
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>+{items.length - 3} more</div>
          )}
        </>
      )}
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
RelatedItemsTileStandard.displayName = 'RelatedItemsTile[standard]';

/** Expert: full list with module grouping */
export function RelatedItemsTileExpert(props: ICanvasTileProps): React.ReactElement {
  const items = useMockRelatedItems(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Related Items</strong>
        <span style={{ fontSize: 10, color: '#888' }}>{items.length} cross-module items</span>
      </div>
      {items.length === 0 ? (
        <div style={emptyStyle}>No related items for this project</div>
      ) : (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {items.map((item) => (
            <div key={item.id} style={itemStyle}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={relationBadge}>{item.relationship}</span>
                <span style={{ flex: 1 }}>{item.title}</span>
              </div>
              <span style={moduleStyle}>{item.sourceModule} · {item.status}</span>
            </div>
          ))}
        </div>
      )}
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
RelatedItemsTileExpert.displayName = 'RelatedItemsTile[expert]';
