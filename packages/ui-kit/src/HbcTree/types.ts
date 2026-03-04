/**
 * HbcTree — Type definitions
 * PH4.10 §Step 6 | Blueprint §2c
 */
import type { ReactNode } from 'react';

export interface HbcTreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  children?: HbcTreeNode[];
  disabled?: boolean;
  defaultExpanded?: boolean;
  meta?: Record<string, unknown>;
}

export interface HbcTreeProps {
  /** Tree data */
  nodes: HbcTreeNode[];
  /** Currently selected node id */
  selectedNodeId?: string;
  /** Node selection handler */
  onNodeSelect?: (nodeId: string) => void;
  /** Controlled expanded node ids (overrides defaultExpanded) */
  expandedNodeIds?: string[];
  /** Expansion state change handler */
  onExpandedChange?: (expandedIds: string[]) => void;
  /** When true, uses HBC_SURFACE_FIELD dark tokens */
  isFieldMode?: boolean;
  /** Additional CSS class */
  className?: string;
}
