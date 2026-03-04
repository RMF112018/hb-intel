# HbcTree

Tree view component for displaying hierarchical data with expand/collapse and selection.

## Import

```tsx
import { HbcTree } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| nodes | HbcTreeNode[] | required | Root-level tree nodes |
| onSelect | (nodeId: string) => void | - | Callback when node is selected |
| expandedKeys | string[] | [] | IDs of expanded nodes |
| onExpand | (expandedKeys: string[]) => void | - | Callback when expand state changes |
| selectable | boolean | true | Allow nodes to be selected |

### HbcTreeNode

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique node identifier |
| label | string | Display label |
| children | HbcTreeNode[] | Nested child nodes |
| icon | ReactNode | Optional icon element |
| disabled | boolean | Node cannot be selected or expanded |

## Usage

```tsx
const [expandedKeys, setExpandedKeys] = useState(['root']);
const [selectedNode, setSelectedNode] = useState(null);

const nodes = [
  {
    id: 'root',
    label: 'Projects',
    children: [
      { id: 'proj1', label: 'Project A', children: [] },
      { id: 'proj2', label: 'Project B', children: [] },
    ],
  },
];

<HbcTree
  nodes={nodes}
  expandedKeys={expandedKeys}
  onExpand={setExpandedKeys}
  onSelect={setSelectedNode}
  selectable={true}
/>
```

## Field Mode Behavior

Tree nodes use dark background with light text in Field Mode. Expanded/collapsed icons adapt color. Selected node highlighting uses bright accent color for contrast against dark surface.

## Accessibility

- `role="tree"` on root container
- `role="treeitem"` on each node
- `aria-expanded="true|false"` on parent nodes
- `aria-selected="true|false"` when selectable
- `aria-level` indicates nesting depth
- `aria-setsize` and `aria-posinset` for position in parent
- Arrow key navigation: Up/Down moves between nodes, Left collapses, Right expands
- Home/End keys jump to first/last node at current level
- Enter/Space to select node
- Focus visible on keyboard navigation

## SPFx Constraints

No SPFx-specific constraints.
