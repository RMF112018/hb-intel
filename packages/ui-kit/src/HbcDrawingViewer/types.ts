/** HbcDrawingViewer — PH4.13 §13.6 drawing/PDF viewer with markup overlay */
import type { ReactNode } from 'react';

/** Markup annotation shape types */
export type MarkupShapeType =
  | 'freehand'
  | 'cloud'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'measurement'
  | 'pin';

/** A single markup annotation on the drawing */
export interface DrawingMarkup {
  /** Unique markup identifier */
  id: string;
  /** Shape type */
  type: MarkupShapeType;
  /** SVG path points or coordinate pairs */
  points: Array<{ x: number; y: number }>;
  /** Bounding box (for rectangle, ellipse, cloud) */
  bounds?: { x: number; y: number; width: number; height: number };
  /** Text content (for text and measurement markups) */
  text?: string;
  /** Markup stroke/fill color */
  color: string;
  /** Optional linked item reference (e.g., RFI number, punch item ID) */
  linkedItem?: { type: string; id: string; label: string };
  /** Creator user ID */
  createdBy?: string;
  /** ISO timestamp */
  createdAt?: string;
}

/** Toolbar tool definition */
export interface MarkupTool {
  /** Unique tool identifier */
  id: string;
  /** Shape type this tool creates */
  type: MarkupShapeType | 'select';
  /** Display label */
  label: string;
  /** Icon ReactNode */
  icon: ReactNode;
}

/** Sheet option for the sheet selector dropdown */
export interface SheetOption {
  id: string;
  label: string;
}

/** Revision option for the revision selector dropdown */
export interface RevisionOption {
  id: string;
  label: string;
}

export interface HbcDrawingViewerProps {
  /** URL of the PDF to render */
  pdfUrl: string;
  /** Current sheet identifier */
  currentSheet?: string;
  /** Current revision identifier */
  currentRevision?: string;
  /** Existing markup annotations */
  markups?: DrawingMarkup[];
  /** Enable markup drawing mode */
  enableMarkup?: boolean;
  /** Available sheets for the sheet selector */
  sheetOptions?: SheetOption[];
  /** Available revisions for the revision selector */
  revisionOptions?: RevisionOption[];
  /** Sheet change handler */
  onSheetChange?: (sheetId: string) => void;
  /** Revision change handler */
  onRevisionChange?: (revisionId: string) => void;
  /** Markup created handler */
  onMarkupCreate?: (markup: Omit<DrawingMarkup, 'id'>) => void;
  /** Markup deleted handler */
  onMarkupDelete?: (markupId: string) => void;
  /** Additional CSS class */
  className?: string;
}
