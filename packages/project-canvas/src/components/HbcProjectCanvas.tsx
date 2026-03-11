/**
 * HbcProjectCanvas — D-SF13-T05, D-01, D-06 (complexity), D-07 (SPFx inline styles)
 *
 * Orchestrating shell for the role-based configurable project dashboard canvas.
 * Wires together hooks (useProjectCanvas, useCanvasRecommendations), the TileRegistry,
 * and CanvasApi into a 12-column CSS Grid renderer with lazy tile loading,
 * complexity-aware variant selection, and governance enforcement.
 */
import React, { useState } from 'react';
import type { ComplexityTier } from '../types/index.js';
import { useProjectCanvas } from '../hooks/useProjectCanvas.js';
import { useCanvasRecommendations } from '../hooks/useCanvasRecommendations.js';
import { CanvasTileCard } from './CanvasTileCard.js';

export interface HbcProjectCanvasProps {
  projectId: string;
  userId: string;
  role: string;
  complexityTier?: ComplexityTier;
  editable?: boolean;
}

export function HbcProjectCanvas({
  projectId,
  userId,
  role,
  complexityTier = 'standard',
  editable = false,
}: HbcProjectCanvasProps): React.ReactElement {
  const { tiles, isLoading, error, reset, isMandatory, isLocked } = useProjectCanvas(
    projectId,
    userId,
    role,
  );
  const { recommendations } = useCanvasRecommendations(userId, projectId);
  const [isEditing, setIsEditing] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="hbc-project-canvas" data-state="loading">
        Loading canvas...
      </div>
    );
  }

  // Error state
  if (error !== null) {
    return (
      <div data-testid="hbc-project-canvas" data-state="error">
        <p>{error.message}</p>
        <button data-testid="canvas-retry-button" onClick={() => void reset()}>
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (tiles.length === 0) {
    return (
      <div data-testid="hbc-project-canvas" data-state="empty">
        <p>No tiles configured</p>
        <button data-testid="canvas-reset-button" onClick={() => void reset()}>
          Reset to defaults
        </button>
      </div>
    );
  }

  // Ready state
  return (
    <div
      data-testid="hbc-project-canvas"
      data-state="ready"
      data-recommendations={recommendations.length}
    >
      <div>
        <h2>Project Canvas</h2>
        {editable && !isEditing && (
          <button
            data-testid="canvas-edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Canvas
          </button>
        )}
      </div>

      <div
        data-testid="canvas-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '16px',
        }}
      >
        {tiles.map((placement) => (
          <CanvasTileCard
            key={placement.tileKey}
            placement={placement}
            projectId={projectId}
            complexityTier={complexityTier}
            isMandatory={isMandatory(placement.tileKey)}
            isLocked={isLocked(placement.tileKey)}
          />
        ))}
      </div>

      {isEditing && (
        <div data-testid="canvas-editor-active">
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
