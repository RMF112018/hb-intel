/**
 * createReferenceTileComponents — D-SF13-T07, D-07 (SPFx inline styles)
 *
 * Factory that produces lazy-loaded placeholder components for each complexity tier.
 * Each variant renders a testable placeholder with tier differentiation.
 */
import React from 'react';
import type { ICanvasTileProps, ComplexityTier } from '../types/index.js';

/** Inline styles only — D-07 SPFx compatibility */
const containerStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 4,
  padding: 12,
  fontFamily: 'inherit',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
};

const badgeStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '2px 6px',
  borderRadius: 3,
  backgroundColor: '#f0f0f0',
  color: '#555',
};

function createTierComponent(
  tileKey: string,
  displayName: string,
  tier: ComplexityTier,
): React.ComponentType<ICanvasTileProps> {
  function ReferenceTile(props: ICanvasTileProps): React.ReactElement {
    return (
      <div data-testid={`tile-${tileKey}`} data-tier={tier} style={containerStyle}>
        <div style={headerStyle}>
          <strong>{displayName}</strong>
          <span style={badgeStyle}>{tier}</span>
        </div>
        <div>Project: {props.projectId}</div>
        {props.isLocked && <div data-testid="locked-indicator">Locked</div>}
        {props.dataSource && <div data-testid="datasource-badge">{props.dataSource}</div>}
      </div>
    );
  }
  ReferenceTile.displayName = `${displayName}[${tier}]`;
  return ReferenceTile;
}

/**
 * Creates 3 lazy-loaded placeholder components per tile, differentiated by complexity tier.
 */
export function createReferenceTileComponents(
  tileKey: string,
  displayName: string,
): {
  essential: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  standard: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
  expert: React.LazyExoticComponent<React.ComponentType<ICanvasTileProps>>;
} {
  return {
    essential: React.lazy(() =>
      Promise.resolve({ default: createTierComponent(tileKey, displayName, 'essential') }),
    ),
    standard: React.lazy(() =>
      Promise.resolve({ default: createTierComponent(tileKey, displayName, 'standard') }),
    ),
    expert: React.lazy(() =>
      Promise.resolve({ default: createTierComponent(tileKey, displayName, 'expert') }),
    ),
  };
}
