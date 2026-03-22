import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcAnnotationAnchor } from '../HbcAnnotationAnchor';
import { createMockAnnotationConfig } from '../../../testing/createMockAnnotationConfig';
import { mockAnnotationStates } from '../../../testing/mockAnnotationStates';
import { AnnotationApi } from '../../api/AnnotationApi';
import type { IFieldAnnotation } from '../../types/IFieldAnnotation';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function withQuery(Story: React.ComponentType) {
  return (
    <QueryClientProvider client={qc}>
      <div style={{ padding: 40 }}>
        <Story />
      </div>
    </QueryClientProvider>
  );
}

const SectionContent = () => (
  <div style={{
    padding: 16,
    border: '1px solid var(--hbc-color-grey-200, #333)',
    borderRadius: 4,
    fontFamily: 'sans-serif',
    fontSize: 14,
  }}>
    <h3 style={{ margin: '0 0 8px' }}>Financial Summary</h3>
    <p style={{ margin: 0 }}>Budget: $12.5M | Forecast: $13.1M | Variance: -$600K</p>
  </div>
);

const BlockContent = () => (
  <table style={{ width: '100%', fontFamily: 'sans-serif', fontSize: 13, borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #444' }}>Quarter</th>
        <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #444' }}>Projected</th>
        <th style={{ textAlign: 'right', padding: 8, borderBottom: '1px solid #444' }}>Actual</th>
      </tr>
    </thead>
    <tbody>
      <tr><td style={{ padding: 8 }}>Q1</td><td style={{ textAlign: 'right', padding: 8 }}>$3.1M</td><td style={{ textAlign: 'right', padding: 8 }}>$3.0M</td></tr>
      <tr><td style={{ padding: 8 }}>Q2</td><td style={{ textAlign: 'right', padding: 8 }}>$3.4M</td><td style={{ textAlign: 'right', padding: 8 }}>$3.6M</td></tr>
      <tr><td style={{ padding: 8 }}>Q3</td><td style={{ textAlign: 'right', padding: 8 }}>$3.2M</td><td style={{ textAlign: 'right', padding: 8 }}>—</td></tr>
    </tbody>
  </table>
);

const defaultConfig = createMockAnnotationConfig({ recordType: 'project-hub-pmp' });

const meta: Meta<typeof HbcAnnotationAnchor> = {
  title: 'field-annotations/HbcAnnotationAnchor',
  component: HbcAnnotationAnchor,
  decorators: [withQuery],
  args: {
    recordType: 'project-hub-pmp',
    recordId: 'rec-001',
    anchorKey: 'section:financial-summary',
    anchorLabel: 'Financial Summary',
    anchorType: 'section',
    config: defaultConfig,
    canAnnotate: true,
    canResolve: true,
  },
};

export default meta;
type Story = StoryObj<typeof HbcAnnotationAnchor>;

function mockList(data: IFieldAnnotation[]) {
  (AnnotationApi as { list: typeof AnnotationApi.list }).list = () => Promise.resolve(data);
}

export const Section_Empty_CanAnnotate: Story = {
  play: () => mockList(mockAnnotationStates.empty),
  render: (args) => <HbcAnnotationAnchor {...args}><SectionContent /></HbcAnnotationAnchor>,
};

export const Section_OpenComment: Story = {
  play: () => mockList(mockAnnotationStates.sectionAnchor),
  render: (args) => <HbcAnnotationAnchor {...args}><SectionContent /></HbcAnnotationAnchor>,
};

export const Block_OpenClarification: Story = {
  args: {
    anchorKey: 'block:cash-flow-table',
    anchorLabel: 'Cash Flow Forecast Table',
    anchorType: 'block',
  },
  play: () => mockList(mockAnnotationStates.blockAnchor),
  render: (args) => <HbcAnnotationAnchor {...args}><BlockContent /></HbcAnnotationAnchor>,
};

export const Section_Resolved: Story = {
  play: () => mockList(mockAnnotationStates.resolved.map((a) => ({
    ...a,
    fieldKey: 'section:financial-summary',
    anchorType: 'section' as const,
  }))),
  render: (args) => <HbcAnnotationAnchor {...args}><SectionContent /></HbcAnnotationAnchor>,
};

export const Section_Expert: Story = {
  args: { forceVariant: 'expert' },
  play: () => mockList(mockAnnotationStates.sectionAnchor),
  render: (args) => <HbcAnnotationAnchor {...args}><SectionContent /></HbcAnnotationAnchor>,
};

export const Section_Essential_Hidden: Story = {
  args: { forceVariant: 'essential' },
  play: () => mockList(mockAnnotationStates.sectionAnchor),
  render: (args) => <HbcAnnotationAnchor {...args}><SectionContent /></HbcAnnotationAnchor>,
};

export const Section_ReadOnly: Story = {
  args: { canAnnotate: false, canResolve: false },
  play: () => mockList(mockAnnotationStates.empty),
  render: (args) => <HbcAnnotationAnchor {...args}><SectionContent /></HbcAnnotationAnchor>,
};
