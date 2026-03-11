/**
 * HbcTileCatalog — D-SF13-T06, D-04 (editor), D-05 (governance)
 *
 * Tile catalog browser showing available registry tiles not yet placed on the canvas.
 * Mandatory tiles sorted first, then alphabetical by title.
 */
import React from 'react';
import { getAll } from '../registry/index.js';

export interface HbcTileCatalogProps {
  currentTiles: string[];
  onAddTile: (tileKey: string) => void;
  onClose: () => void;
}

export function HbcTileCatalog({
  currentTiles,
  onAddTile,
  onClose,
}: HbcTileCatalogProps): React.ReactElement {
  const allTiles = getAll();
  const placedSet = new Set(currentTiles);

  // Filter out already-placed tiles, sort mandatory first then alphabetical
  const available = allTiles
    .filter((def) => !placedSet.has(def.tileKey))
    .sort((a, b) => {
      if (a.mandatory && !b.mandatory) return -1;
      if (!a.mandatory && b.mandatory) return 1;
      return a.title.localeCompare(b.title);
    });

  const handleAdd = (tileKey: string) => {
    onAddTile(tileKey);
    onClose();
  };

  return (
    <div data-testid="hbc-tile-catalog" style={{ border: '1px solid #999', padding: '16px', marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3>Tile Catalog</h3>
        <button data-testid="catalog-close-button" onClick={onClose}>
          Close
        </button>
      </div>

      {available.length === 0 ? (
        <div data-testid="catalog-empty">No additional tiles available</div>
      ) : (
        <div data-testid="catalog-list">
          {available.map((def) => (
            <div
              key={def.tileKey}
              data-testid={`catalog-tile-${def.tileKey}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}
            >
              <div>
                <strong data-testid={`catalog-tile-title-${def.tileKey}`}>{def.title}</strong>
                <p data-testid={`catalog-tile-description-${def.tileKey}`} style={{ margin: '2px 0 0', fontSize: '0.85em', color: '#666' }}>
                  {def.description}
                </p>
                {def.mandatory && (
                  <span data-testid={`catalog-tile-mandatory-${def.tileKey}`} style={{ fontSize: '0.75em', color: '#c00' }}>
                    Mandatory
                  </span>
                )}
              </div>
              <button data-testid={`catalog-add-${def.tileKey}`} onClick={() => handleAdd(def.tileKey)}>
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
