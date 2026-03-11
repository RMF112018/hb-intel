/**
 * HbcCanvasEditor — D-SF13-T06, D-04 (editor), D-05 (governance), D-07 (SPFx inline styles)
 *
 * Full canvas editor panel wiring useCanvasEditor hook actions into a toolbar + grid UI
 * with add/remove/reorder controls and governance enforcement (mandatory/locked indicators).
 */
import React, { useState } from 'react';
import type { ICanvasTilePlacement } from '../types/index.js';
import { useCanvasEditor } from '../hooks/useCanvasEditor.js';
import { get } from '../registry/index.js';
import { HbcTileCatalog } from './HbcTileCatalog.js';

export interface HbcCanvasEditorProps {
  projectId: string;
  tiles: ICanvasTilePlacement[];
  isMandatory: (tileKey: string) => boolean;
  isLocked: (tileKey: string) => boolean;
  onSave: (tiles: ICanvasTilePlacement[]) => void;
  onCancel: () => void;
}

export function HbcCanvasEditor({
  projectId,
  tiles: initialTiles,
  isMandatory,
  isLocked,
  onSave,
  onCancel,
}: HbcCanvasEditorProps): React.ReactElement {
  // projectId reserved for future tile-level API calls
  void projectId;
  const editor = useCanvasEditor(initialTiles, { isMandatory, isLocked });
  const [catalogOpen, setCatalogOpen] = useState(false);

  const handleSave = () => {
    onSave(editor.tiles);
  };

  const handleCancel = () => {
    editor.cancel();
    onCancel();
  };

  const handleAddTile = (tileKey: string) => {
    editor.addTile(tileKey);
  };

  return (
    <div data-testid="hbc-canvas-editor">
      {/* Toolbar */}
      <div data-testid="editor-toolbar" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          data-testid="editor-save-button"
          disabled={!editor.hasUnsavedChanges}
          onClick={handleSave}
        >
          Save
        </button>
        <button data-testid="editor-cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button data-testid="editor-add-tile-button" onClick={() => setCatalogOpen(true)}>
          Add Tile
        </button>
      </div>

      {/* Unsaved changes indicator */}
      {editor.hasUnsavedChanges && (
        <div data-testid="editor-unsaved-indicator">Unsaved changes</div>
      )}

      {/* Editor grid — D-07 inline styles for SPFx compatibility */}
      <div
        data-testid="editor-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '16px',
        }}
      >
        {editor.tiles.map((placement, index) => {
          const def = get(placement.tileKey);
          const title = def?.title ?? placement.tileKey;
          const locked = isMandatory(placement.tileKey) || isLocked(placement.tileKey);

          return (
            <div
              key={placement.tileKey}
              data-testid="editor-tile-card"
              style={{
                gridColumn: `${placement.colStart} / span ${placement.colSpan}`,
                gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
                border: '1px solid #ccc',
                padding: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span data-testid={`editor-tile-title-${placement.tileKey}`}>{title}</span>
                {locked && (
                  <span data-testid={`editor-tile-locked-${placement.tileKey}`}>🔒</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {/* Reorder controls — functional equivalent of DnD */}
                {index > 0 && !locked && (
                  <button
                    data-testid={`editor-tile-move-up-${placement.tileKey}`}
                    onClick={() => editor.reorderTiles(index, index - 1)}
                  >
                    ↑
                  </button>
                )}
                {index < editor.tiles.length - 1 && !locked && (
                  <button
                    data-testid={`editor-tile-move-down-${placement.tileKey}`}
                    onClick={() => editor.reorderTiles(index, index + 1)}
                  >
                    ↓
                  </button>
                )}

                {/* Remove — hidden for mandatory/locked tiles */}
                {!locked && (
                  <button
                    data-testid={`editor-tile-remove-${placement.tileKey}`}
                    onClick={() => editor.removeTile(placement.tileKey)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Catalog overlay */}
      {catalogOpen && (
        <HbcTileCatalog
          currentTiles={editor.tiles.map((t) => t.tileKey)}
          onAddTile={handleAddTile}
          onClose={() => setCatalogOpen(false)}
        />
      )}
    </div>
  );
}
