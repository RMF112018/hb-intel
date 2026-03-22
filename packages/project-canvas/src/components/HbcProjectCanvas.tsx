/**
 * HbcProjectCanvas — D-SF13-T05
 *
 * Unified canvas component with iOS homescreen-style inline editing.
 * View mode: tile grid with "Edit" button.
 * Edit mode: tiles jiggle, red "-" badges appear, drag-to-reorder, "+" to add, "Done" to save.
 */
import React, { useState, useCallback } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { ComplexityTier } from '../types/index.js';
import { useProjectCanvas } from '../hooks/useProjectCanvas.js';
import { useCanvasEditor } from '../hooks/useCanvasEditor.js';
import { CanvasTileCard } from './CanvasTileCard.js';
import { HbcTileCatalog } from './HbcTileCatalog.js';
import {
  HbcButton,
  HbcSpinner,
  HbcModal,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  heading3,
  HBC_STATUS_RAMP_GRAY,
} from '@hbc/ui-kit';
import { Edit, Create } from '@hbc/ui-kit/icons';

export interface HbcProjectCanvasProps {
  projectId: string;
  userId: string;
  role: string;
  complexityTier?: ComplexityTier;
  editable?: boolean;
  /** Heading text. Pass empty string to suppress the heading entirely. */
  title?: string;
}

const useStyles = makeStyles({
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: `${HBC_SPACE_MD}px`,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    padding: `${HBC_SPACE_MD}px`,
  },
  empty: {
    textAlign: 'center' as const,
    padding: `${HBC_SPACE_MD}px`,
    opacity: 0.7,
  },
  error: {
    padding: `${HBC_SPACE_MD}px`,
  },
  // "+" add tile placeholder — dashed border, centered icon
  addPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80px',
    ...shorthands.border('2px', 'dashed', HBC_STATUS_RAMP_GRAY[70]),
    ...shorthands.borderRadius('8px'),
    cursor: 'pointer',
    opacity: 0.6,
    ':hover': {
      opacity: 1,
    },
  },
});

export function HbcProjectCanvas({
  projectId,
  userId,
  role,
  complexityTier = 'standard',
  editable = false,
  title = 'Project Canvas',
}: HbcProjectCanvasProps): React.ReactElement {
  const styles = useStyles();
  const { tiles, isLoading, error, save, reset, isMandatory, isLocked } = useProjectCanvas(
    projectId,
    userId,
    role,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Editor hook — provides local tile state during editing
  const editor = useCanvasEditor(tiles, { isMandatory, isLocked });

  // The tiles to render: editor's local copy when editing, source-of-truth otherwise
  const displayTiles = isEditing ? editor.tiles : tiles;

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = editor.tiles.findIndex((t) => t.tileKey === active.id);
    const newIndex = editor.tiles.findIndex((t) => t.tileKey === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      editor.reorderTiles(oldIndex, newIndex);
    }
  }, [editor]);

  const handleDone = useCallback(async () => {
    if (editor.hasUnsavedChanges) {
      await save(editor.tiles);
    }
    setIsEditing(false);
  }, [editor, save]);

  const handleAddTile = useCallback((tileKey: string) => {
    editor.addTile(tileKey);
    setCatalogOpen(false);
  }, [editor]);

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div data-testid="hbc-project-canvas" data-state="loading" className={styles.loading}>
        {/* eslint-disable-next-line @hb-intel/hbc/no-direct-spinner */}
        <HbcSpinner size="sm" label="Loading canvas…" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error !== null) {
    return (
      <div data-testid="hbc-project-canvas" data-state="error" className={styles.error}>
        <p>{error.message}</p>
        <HbcButton variant="secondary" size="sm" onClick={() => void reset()}>Retry</HbcButton>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────
  if (displayTiles.length === 0 && !isEditing) {
    return (
      <div data-testid="hbc-project-canvas" data-state="empty" className={styles.empty}>
        <p>No tiles configured</p>
        <HbcButton variant="secondary" size="sm" onClick={() => void reset()}>Reset to defaults</HbcButton>
      </div>
    );
  }

  // ── Ready state ────────────────────────────────────────────────────
  const sortableIds = displayTiles.map((t) => t.tileKey);

  const gridContent = (
    <div data-testid="canvas-grid" className={styles.grid}>
      {displayTiles.map((placement, idx) => (
        <CanvasTileCard
          key={placement.tileKey}
          placement={placement}
          projectId={projectId}
          complexityTier={complexityTier}
          isMandatory={isMandatory(placement.tileKey)}
          isLocked={isLocked(placement.tileKey)}
          isEditing={isEditing}
          index={idx}
          onRemove={(key) => editor.removeTile(key)}
        />
      ))}

      {/* "+" add tile placeholder — shown only in edit mode */}
      {isEditing && (
        <div
          className={styles.addPlaceholder}
          style={{ gridColumn: 'span 6' }}
          onClick={() => setCatalogOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Add a tile"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCatalogOpen(true); }}
        >
          <Create size="lg" color={HBC_STATUS_RAMP_GRAY[50]} />
        </div>
      )}
    </div>
  );

  return (
    <div data-testid="hbc-project-canvas" data-state={isEditing ? 'editing' : 'ready'}>
      {/* Header */}
      {(title || editable) && (
        <div className={styles.header}>
          {title && <span className={styles.heading}>{title}</span>}
          {editable && (
            isEditing ? (
              <HbcButton variant="primary" size="sm" onClick={() => void handleDone()} data-testid="canvas-done-button">
                Done
              </HbcButton>
            ) : (
              <HbcButton variant="secondary" size="sm" icon={<Edit size="sm" />} onClick={() => setIsEditing(true)} data-testid="canvas-edit-button">
                Edit
              </HbcButton>
            )
          )}
        </div>
      )}

      {/* Grid — wrapped in DndContext only when editing */}
      {isEditing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            {gridContent}
          </SortableContext>
        </DndContext>
      ) : (
        gridContent
      )}

      {/* Tile catalog modal */}
      <HbcModal open={catalogOpen} onClose={() => setCatalogOpen(false)} title="Add a Tile" size="md">
        <HbcTileCatalog
          currentTiles={editor.tiles.map((t) => t.tileKey)}
          onAddTile={handleAddTile}
          onClose={() => setCatalogOpen(false)}
        />
      </HbcModal>
    </div>
  );
}
