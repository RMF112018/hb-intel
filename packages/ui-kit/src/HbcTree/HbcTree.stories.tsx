/**
 * HbcTree — Storybook Stories
 * Phase 4.10 Navigation UI System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcTree } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';
import { DrawingSheet, RFI, PunchItem, Home } from '../icons/index.js';
import type { HbcTreeNode } from './types.js';

export default {
  title: 'Navigation/HbcTree',
  component: HbcTree,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <div style={{ maxWidth: 320, border: '1px solid #D1D5DB', borderRadius: 4 }}>
          <Story />
        </div>
      </FluentProvider>
    ),
  ],
};

const sampleNodes: HbcTreeNode[] = [
  {
    id: 'project',
    label: 'Project Alpha',
    icon: <Home size="sm" />,
    defaultExpanded: true,
    children: [
      {
        id: 'drawings',
        label: 'Drawings',
        icon: <DrawingSheet size="sm" />,
        children: [
          { id: 'arch', label: 'Architectural' },
          { id: 'struct', label: 'Structural' },
          { id: 'mep', label: 'MEP' },
        ],
      },
      {
        id: 'rfis',
        label: 'RFIs',
        icon: <RFI size="sm" />,
        children: [
          { id: 'rfi-open', label: 'Open (12)' },
          { id: 'rfi-closed', label: 'Closed (45)' },
        ],
      },
      {
        id: 'punch',
        label: 'Punch Items',
        icon: <PunchItem size="sm" />,
      },
    ],
  },
];

export const Default = () => {
  const [selected, setSelected] = React.useState<string | undefined>();
  return (
    <HbcTree
      nodes={sampleNodes}
      selectedNodeId={selected}
      onNodeSelect={setSelected}
    />
  );
};

export const ThreeLevels = () => {
  const [selected, setSelected] = React.useState<string | undefined>('arch');
  return (
    <HbcTree
      nodes={sampleNodes}
      selectedNodeId={selected}
      onNodeSelect={setSelected}
      expandedNodeIds={['project', 'drawings']}
      onExpandedChange={() => {}}
    />
  );
};

export const ControlledExpansion = () => {
  const [expanded, setExpanded] = React.useState<string[]>(['project']);
  const [selected, setSelected] = React.useState<string | undefined>();
  return (
    <div>
      <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: '#6B7280' }}>
        Expanded: {expanded.join(', ') || 'none'}
      </div>
      <HbcTree
        nodes={sampleNodes}
        selectedNodeId={selected}
        onNodeSelect={setSelected}
        expandedNodeIds={expanded}
        onExpandedChange={setExpanded}
      />
    </div>
  );
};

export const SelectedNode = () => (
  <HbcTree
    nodes={sampleNodes}
    selectedNodeId="rfis"
    onNodeSelect={() => {}}
  />
);

export const DisabledNodes = () => {
  const disabledNodes: HbcTreeNode[] = [
    {
      id: 'root',
      label: 'Documents',
      defaultExpanded: true,
      children: [
        { id: 'public', label: 'Public Docs' },
        { id: 'restricted', label: 'Restricted (No Access)', disabled: true },
        { id: 'archived', label: 'Archived', disabled: true },
      ],
    },
  ];
  return (
    <HbcTree
      nodes={disabledNodes}
      onNodeSelect={(id) => console.log('Selected:', id)}
    />
  );
};

export const FieldMode = () => {
  const [selected, setSelected] = React.useState<string | undefined>();
  return (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
        <div style={{ maxWidth: 320, border: '1px solid #3A4A5C', borderRadius: 4 }}>
          <HbcTree
            nodes={sampleNodes}
            selectedNodeId={selected}
            onNodeSelect={setSelected}
            isFieldMode
          />
        </div>
      </div>
    </FluentProvider>
  );
};

export const KeyboardNavigation = () => {
  const [selected, setSelected] = React.useState<string | undefined>();
  return (
    <div>
      <p style={{ fontSize: '0.75rem', color: '#6B7280', padding: '8px 12px' }}>
        Focus the tree, then use Arrow keys to navigate. Enter to select. Home/End to jump.
      </p>
      <HbcTree
        nodes={sampleNodes}
        selectedNodeId={selected}
        onNodeSelect={setSelected}
      />
    </div>
  );
};

export const A11yTest = () => (
  <HbcTree
    nodes={sampleNodes}
    selectedNodeId="rfis"
    onNodeSelect={() => {}}
  />
);
