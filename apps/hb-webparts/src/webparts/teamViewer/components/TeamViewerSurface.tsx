/**
 * TeamViewerSurface — primary composed surface for TeamViewer.
 *
 * Renders the heading, per-group sections, and the people grid. Layout
 * is driven by `layout`; density is applied at the card level.
 */
import * as React from 'react';
import type {
  TeamViewerDensity,
  TeamViewerGroup,
  TeamViewerLayout,
  TeamViewerPerson,
} from '../teamViewerContracts.js';
import { TeamViewerPersonCard } from './TeamViewerPersonCard.js';

export interface TeamViewerSurfaceProps {
  heading: string;
  groups: TeamViewerGroup[];
  layout: TeamViewerLayout;
  density: TeamViewerDensity;
  onOpenDetail?: (person: TeamViewerPerson) => void;
}

function gridColumnsFor(density: TeamViewerDensity): string {
  switch (density) {
    case 'compact':
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    case 'expanded':
      return 'repeat(auto-fill, minmax(320px, 1fr))';
    case 'standard':
    default:
      return 'repeat(auto-fill, minmax(260px, 1fr))';
  }
}

export function TeamViewerSurface({
  heading,
  groups,
  layout,
  density,
  onOpenDetail,
}: TeamViewerSurfaceProps): React.JSX.Element {
  const containerStyle: React.CSSProperties =
    layout === 'rail' || layout === 'strip'
      ? { display: 'flex', gap: 12, overflowX: 'auto' }
      : { display: 'grid', gap: 12, gridTemplateColumns: gridColumnsFor(density) };

  return (
    <section data-hbc-layout={layout} data-hbc-density={density}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{heading}</h2>
      </header>

      {groups.map((group, index) => (
        <div
          key={group.id}
          data-hbc-testid="team-viewer-group"
          style={{ marginTop: index === 0 ? 0 : 20 }}
        >
          {layout === 'grouped' ? (
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{group.label}</h3>
          ) : null}
          <div style={containerStyle}>
            {group.people.map((person) => (
              <TeamViewerPersonCard
                key={person.id}
                person={person}
                density={density}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
