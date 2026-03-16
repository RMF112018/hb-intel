/**
 * HbcTree — Accessible tree view with keyboard navigation
 * PH4.10 §Step 6 | Blueprint §2c
 *
 * - ARIA tree pattern: role="tree" > role="treeitem" > role="group"
 * - Roving tabIndex: only focused node has tabIndex=0
 * - Keyboard: ArrowDown/Up (next/prev visible), ArrowRight (expand/child),
 *   ArrowLeft (collapse/parent), Enter (select), Home/End
 * - Flat visible node list via useMemo for O(1) keyboard nav
 * - 20px indent per depth level
 * - Selected: surface-2 bg + 3px HBC_ACCENT_ORANGE left border
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_ACCENT_ORANGE, HBC_SURFACE_LIGHT, HBC_SURFACE_FIELD } from '../theme/tokens.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import { ChevronForward, ChevronDown } from '../icons/index.js';
import type { HbcTreeProps, HbcTreeNode } from './types.js';

const INDENT_PX = 20;

const useStyles = makeStyles({
  tree: {
    listStyleType: 'none',
    margin: '0',
    padding: '0',
  },
  group: {
    listStyleType: 'none',
    margin: '0',
    padding: '0',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '32px',
    paddingRight: `${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: HBC_SURFACE_LIGHT['text-primary'],
    background: 'none',
    border: 'none',
    borderLeft: '3px solid transparent',
    width: '100%',
    textAlign: 'left',
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  itemField: {
    color: HBC_SURFACE_FIELD['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_FIELD['surface-2'],
    },
  },
  itemSelected: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    borderLeftColor: HBC_ACCENT_ORANGE,
  },
  itemSelectedField: {
    backgroundColor: HBC_SURFACE_FIELD['surface-2'],
    borderLeftColor: HBC_ACCENT_ORANGE,
  },
  itemDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  expandIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  expandIconField: {
    color: HBC_SURFACE_FIELD['text-muted'],
  },
  expandPlaceholder: {
    width: '16px',
    flexShrink: 0,
  },
  nodeIcon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    flex: '1 1 auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

interface FlatNode {
  node: HbcTreeNode;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
}

/** Collect default expanded IDs from tree data */
function collectDefaults(nodes: HbcTreeNode[]): string[] {
  const result: string[] = [];
  const walk = (list: HbcTreeNode[]) => {
    for (const n of list) {
      if (n.defaultExpanded && n.children?.length) result.push(n.id);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return result;
}

/** Build flat visible node list for keyboard navigation */
function buildFlatList(
  nodes: HbcTreeNode[],
  expandedIds: Set<string>,
  depth: number,
  parentId: string | null,
): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const hasChildren = Boolean(node.children?.length);
    result.push({ node, depth, parentId, hasChildren });
    if (hasChildren && expandedIds.has(node.id)) {
      result.push(...buildFlatList(node.children!, expandedIds, depth + 1, node.id));
    }
  }
  return result;
}

export const HbcTree: React.FC<HbcTreeProps> = ({
  nodes,
  selectedNodeId,
  onNodeSelect,
  expandedNodeIds: controlledExpanded,
  onExpandedChange,
  isFieldMode = false,
  className,
}) => {
  const styles = useStyles();

  // Expanded state (uncontrolled fallback)
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() =>
    collectDefaults(nodes),
  );
  const expandedIds = controlledExpanded ?? internalExpanded;
  const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);

  const setExpanded = React.useCallback(
    (ids: string[]) => {
      if (onExpandedChange) {
        onExpandedChange(ids);
      } else {
        setInternalExpanded(ids);
      }
    },
    [onExpandedChange],
  );

  const toggleExpanded = React.useCallback(
    (nodeId: string) => {
      const next = expandedSet.has(nodeId)
        ? expandedIds.filter((id) => id !== nodeId)
        : [...expandedIds, nodeId];
      setExpanded(next);
    },
    [expandedIds, expandedSet, setExpanded],
  );

  // Flat visible list
  const flatList = React.useMemo(
    () => buildFlatList(nodes, expandedSet, 0, null),
    [nodes, expandedSet],
  );

  // Focused node (roving tabIndex)
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const itemRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const focusNode = React.useCallback((id: string) => {
    setFocusedId(id);
    itemRefs.current.get(id)?.focus();
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const currentIdx = flatList.findIndex((f) => f.node.id === focusedId);
      if (currentIdx === -1) return;

      const current = flatList[currentIdx];

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (currentIdx < flatList.length - 1) {
            focusNode(flatList[currentIdx + 1].node.id);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (currentIdx > 0) {
            focusNode(flatList[currentIdx - 1].node.id);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (current.hasChildren && !expandedSet.has(current.node.id)) {
            toggleExpanded(current.node.id);
          } else if (current.hasChildren && expandedSet.has(current.node.id)) {
            // Move to first child
            if (currentIdx + 1 < flatList.length && flatList[currentIdx + 1].parentId === current.node.id) {
              focusNode(flatList[currentIdx + 1].node.id);
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (current.hasChildren && expandedSet.has(current.node.id)) {
            toggleExpanded(current.node.id);
          } else if (current.parentId) {
            focusNode(current.parentId);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (!current.node.disabled) {
            onNodeSelect?.(current.node.id);
          }
          break;
        }
        case 'Home': {
          e.preventDefault();
          if (flatList.length > 0) focusNode(flatList[0].node.id);
          break;
        }
        case 'End': {
          e.preventDefault();
          if (flatList.length > 0) focusNode(flatList[flatList.length - 1].node.id);
          break;
        }
      }
    },
    [flatList, focusedId, expandedSet, toggleExpanded, focusNode, onNodeSelect],
  );

  const renderNode = (flatNode: FlatNode) => {
    const { node, depth, hasChildren } = flatNode;
    const isSelected = node.id === selectedNodeId;
    const isFocused = node.id === focusedId;
    const isExpanded = expandedSet.has(node.id);

    return (
      <li
        key={node.id}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-disabled={node.disabled || undefined}
      >
        <button
          ref={(el) => { if (el) itemRefs.current.set(node.id, el); }}
          type="button"
          className={mergeClasses(
            styles.item,
            isFieldMode && styles.itemField,
            isSelected && styles.itemSelected,
            isSelected && isFieldMode && styles.itemSelectedField,
            node.disabled && styles.itemDisabled,
          )}
          style={{ paddingLeft: depth * INDENT_PX + HBC_SPACE_SM }}
          tabIndex={isFocused || (!focusedId && flatList[0]?.node.id === node.id) ? 0 : -1}
          onClick={() => {
            if (node.disabled) return;
            setFocusedId(node.id);
            if (hasChildren) toggleExpanded(node.id);
            onNodeSelect?.(node.id);
          }}
          onFocus={() => setFocusedId(node.id)}
        >
          {hasChildren ? (
            <span className={mergeClasses(styles.expandIcon, isFieldMode && styles.expandIconField)}>
              {isExpanded ? <ChevronDown size="sm" /> : <ChevronForward size="sm" />}
            </span>
          ) : (
            <span className={styles.expandPlaceholder} />
          )}
          {node.icon && <span className={styles.nodeIcon}>{node.icon}</span>}
          <span className={styles.label}>{node.label}</span>
        </button>
      </li>
    );
  };

  // Render as flat list (ARIA relationships handled via role attributes)
  return (
    <ul
      role="tree"
      data-hbc-ui="tree"
      className={mergeClasses(styles.tree, className)}
      onKeyDown={handleKeyDown}
    >
      {flatList.map(renderNode)}
    </ul>
  );
};

export type { HbcTreeProps, HbcTreeNode } from './types.js';
