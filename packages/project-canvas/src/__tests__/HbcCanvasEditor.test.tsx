/**
 * HbcCanvasEditor test suite — D-SF13-T06
 *
 * Tests the canvas editor component including toolbar actions, tile card rendering,
 * governance enforcement (mandatory/locked), catalog integration, and unsaved changes.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ICanvasTilePlacement } from '../types/index.js';
import { HbcCanvasEditor } from '../components/HbcCanvasEditor.js';
import { createMockTilePlacement, createMockTileDefinition } from '@hbc/project-canvas/testing';

// --- Mock useCanvasEditor ---

const mockAddTile = vi.fn();
const mockRemoveTile = vi.fn();
const mockMoveTile = vi.fn();
const mockResizeTile = vi.fn();
const mockReorderTiles = vi.fn();
const mockCancel = vi.fn();
const mockGetEditableTiles = vi.fn().mockReturnValue([]);

let editorTiles: ICanvasTilePlacement[] = [];
let editorHasUnsavedChanges = false;

vi.mock('../hooks/useCanvasEditor.js', () => ({
  useCanvasEditor: vi.fn(() => ({
    tiles: editorTiles,
    hasUnsavedChanges: editorHasUnsavedChanges,
    addTile: mockAddTile,
    removeTile: mockRemoveTile,
    moveTile: mockMoveTile,
    resizeTile: mockResizeTile,
    reorderTiles: mockReorderTiles,
    cancel: mockCancel,
    getEditableTiles: mockGetEditableTiles,
  })),
}));

// --- Mock registry ---

vi.mock('../registry/index.js', () => ({
  get: vi.fn((key: string) =>
    createMockTileDefinition({ tileKey: key, title: `Title: ${key}` }),
  ),
  getAll: vi.fn().mockReturnValue([]),
}));

// --- Helpers ---

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();
const mockIsMandatory = vi.fn().mockReturnValue(false);
const mockIsLocked = vi.fn().mockReturnValue(false);

const baseProps = {
  projectId: 'project-001',
  tiles: [] as ICanvasTilePlacement[],
  isMandatory: mockIsMandatory,
  isLocked: mockIsLocked,
  onSave: mockOnSave,
  onCancel: mockOnCancel,
};

function setup(overrides: Partial<typeof baseProps> = {}) {
  return render(<HbcCanvasEditor {...baseProps} {...overrides} />);
}

afterEach(() => {
  vi.clearAllMocks();
  editorTiles = [];
  editorHasUnsavedChanges = false;
  mockIsMandatory.mockReturnValue(false);
  mockIsLocked.mockReturnValue(false);
});

describe('HbcCanvasEditor (D-SF13-T06)', () => {
  it('renders root with data-testid="hbc-canvas-editor"', () => {
    setup();
    expect(screen.getByTestId('hbc-canvas-editor')).toBeInTheDocument();
  });

  it('renders save and cancel buttons', () => {
    setup();
    expect(screen.getByTestId('editor-save-button')).toBeInTheDocument();
    expect(screen.getByTestId('editor-cancel-button')).toBeInTheDocument();
  });

  it('save button disabled when no unsaved changes', () => {
    editorHasUnsavedChanges = false;
    setup();
    expect(screen.getByTestId('editor-save-button')).toBeDisabled();
  });

  it('save button enabled when hasUnsavedChanges', () => {
    editorHasUnsavedChanges = true;
    setup();
    expect(screen.getByTestId('editor-save-button')).toBeEnabled();
  });

  it('clicking save calls onSave with current tiles', () => {
    const tiles = [createMockTilePlacement({ tileKey: 'tile-a' })];
    editorTiles = tiles;
    editorHasUnsavedChanges = true;
    setup();
    fireEvent.click(screen.getByTestId('editor-save-button'));
    expect(mockOnSave).toHaveBeenCalledWith(tiles);
  });

  it('clicking cancel calls editor.cancel() and onCancel', () => {
    setup();
    fireEvent.click(screen.getByTestId('editor-cancel-button'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('renders tile cards for each tile in editor state', () => {
    editorTiles = [
      createMockTilePlacement({ tileKey: 'tile-a' }),
      createMockTilePlacement({ tileKey: 'tile-b', colStart: 5 }),
    ];
    setup();
    expect(screen.getAllByTestId('editor-tile-card')).toHaveLength(2);
  });

  it('tile card shows title from registry', () => {
    editorTiles = [createMockTilePlacement({ tileKey: 'budget-tracker' })];
    setup();
    expect(screen.getByTestId('editor-tile-title-budget-tracker')).toHaveTextContent('Title: budget-tracker');
  });

  it('remove button hidden for mandatory tile', () => {
    editorTiles = [createMockTilePlacement({ tileKey: 'mandatory-tile' })];
    mockIsMandatory.mockReturnValue(true);
    setup();
    expect(screen.queryByTestId('editor-tile-remove-mandatory-tile')).not.toBeInTheDocument();
  });

  it('remove button hidden for locked tile', () => {
    editorTiles = [createMockTilePlacement({ tileKey: 'locked-tile' })];
    mockIsLocked.mockReturnValue(true);
    setup();
    expect(screen.queryByTestId('editor-tile-remove-locked-tile')).not.toBeInTheDocument();
  });

  it('remove button visible for editable tile, clicking calls removeTile', () => {
    editorTiles = [createMockTilePlacement({ tileKey: 'editable-tile' })];
    setup();
    const removeBtn = screen.getByTestId('editor-tile-remove-editable-tile');
    expect(removeBtn).toBeInTheDocument();
    fireEvent.click(removeBtn);
    expect(mockRemoveTile).toHaveBeenCalledWith('editable-tile');
  });

  it('locked tile shows lock indicator', () => {
    editorTiles = [createMockTilePlacement({ tileKey: 'locked-tile' })];
    mockIsLocked.mockReturnValue(true);
    setup();
    expect(screen.getByTestId('editor-tile-locked-locked-tile')).toBeInTheDocument();
  });

  it('add-tile button opens catalog overlay', () => {
    setup();
    expect(screen.queryByTestId('hbc-tile-catalog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('editor-add-tile-button'));
    expect(screen.getByTestId('hbc-tile-catalog')).toBeInTheDocument();
  });

  it('unsaved changes indicator visible when dirty', () => {
    editorHasUnsavedChanges = true;
    setup();
    expect(screen.getByTestId('editor-unsaved-indicator')).toBeInTheDocument();
  });
});
