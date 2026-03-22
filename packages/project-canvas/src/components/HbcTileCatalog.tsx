/**
 * HbcTileCatalog — D-SF13-T06, D-04 (editor), D-05 (governance)
 *
 * Polished tile catalog browser using @hbc/ui-kit components.
 * Shows available registry tiles not yet placed on the canvas.
 * Mandatory tiles sorted first, then alphabetical by title.
 */
import React from 'react';
import { makeStyles } from '@griffel/react';
import { getAll } from '../registry/index.js';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  heading3,
  heading4,
} from '@hbc/ui-kit';
import { Create, Cancel } from '@hbc/ui-kit/icons';

export interface HbcTileCatalogProps {
  currentTiles: string[];
  onAddTile: (tileKey: string) => void;
  onClose: () => void;
}

const useStyles = makeStyles({
  root: {
    marginTop: `${HBC_SPACE_MD}px`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  heading: {
    ...heading3,
    margin: '0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    ...heading4,
    margin: '0',
  },
  itemDescription: {
    margin: '2px 0 0',
    fontSize: '0.8125rem',
    opacity: 0.7,
  },
  empty: {
    textAlign: 'center' as const,
    padding: `${HBC_SPACE_MD}px`,
    opacity: 0.6,
  },
});

export function HbcTileCatalog({
  currentTiles,
  onAddTile,
  onClose,
}: HbcTileCatalogProps): React.ReactElement {
  const styles = useStyles();
  const allTiles = getAll();
  const placedSet = new Set(currentTiles);

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
    <div className={styles.root} data-testid="hbc-tile-catalog">
      <HbcCard weight="standard">
        <div className={styles.header}>
          <span className={styles.heading}>Add a Tile</span>
          <HbcButton
            variant="ghost"
            size="sm"
            icon={<Cancel size="sm" />}
            aria-label="Close catalog"
            onClick={onClose}
            data-testid="catalog-close-button"
          >{null}</HbcButton>
        </div>

        {available.length === 0 ? (
          <div className={styles.empty} data-testid="catalog-empty">
            All available tiles are already on your canvas.
          </div>
        ) : (
          <div className={styles.list} data-testid="catalog-list">
            {available.map((def) => (
              <div key={def.tileKey} className={styles.item} data-testid={`catalog-tile-${def.tileKey}`}>
                <div>
                  <span className={styles.itemTitle} data-testid={`catalog-tile-title-${def.tileKey}`}>
                    {def.title}
                  </span>
                  {def.description && (
                    <p className={styles.itemDescription} data-testid={`catalog-tile-description-${def.tileKey}`}>
                      {def.description}
                    </p>
                  )}
                  {def.mandatory && (
                    <HbcStatusBadge variant="info" label="Required" size="small" />
                  )}
                </div>
                <HbcButton
                  variant="ghost"
                  size="sm"
                  icon={<Create size="sm" />}
                  aria-label={`Add ${def.title}`}
                  onClick={() => handleAdd(def.tileKey)}
                  data-testid={`catalog-add-${def.tileKey}`}
                >{null}</HbcButton>
              </div>
            ))}
          </div>
        )}
      </HbcCard>
    </div>
  );
}
