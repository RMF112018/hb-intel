import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcAnnotationMarker } from '../HbcAnnotationMarker';
import { createMockAnnotationConfig } from '../../../testing/createMockAnnotationConfig';
import { mockAnnotationStates } from '../../../testing/mockAnnotationStates';
import { AnnotationApi } from '../../api/AnnotationApi';
import type { IFieldAnnotation } from '../../types/IFieldAnnotation';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function withQuery(Story: React.ComponentType) {
  return (
    <QueryClientProvider client={qc}>
      <div style={{ padding: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: 'sans-serif', fontSize: 14 }}>Field Label</span>
        <Story />
      </div>
    </QueryClientProvider>
  );
}

const defaultConfig = createMockAnnotationConfig();

const meta: Meta<typeof HbcAnnotationMarker> = {
  title: 'field-annotations/HbcAnnotationMarker',
  component: HbcAnnotationMarker,
  decorators: [withQuery],
  args: {
    recordType: 'bd-scorecard',
    recordId: 'rec-001',
    fieldKey: 'totalBuildableArea',
    fieldLabel: 'Total Buildable Area',
    config: defaultConfig,
    canAnnotate: true,
    canResolve: true,
  },
};

export default meta;
type Story = StoryObj<typeof HbcAnnotationMarker>;

function mockList(data: IFieldAnnotation[]) {
  (AnnotationApi as { list: typeof AnnotationApi.list }).list = () => Promise.resolve(data);
}

export const Empty_CanAnnotate: Story = {
  play: () => mockList(mockAnnotationStates.empty),
};

export const Empty_ReadOnly: Story = {
  args: { canAnnotate: false, canResolve: false },
  play: () => mockList(mockAnnotationStates.empty),
};

export const OpenClarification: Story = {
  play: () => mockList(mockAnnotationStates.openClarification),
};

export const OpenRevisionFlag: Story = {
  play: () => mockList(mockAnnotationStates.openRevisionFlag),
};

export const OpenComment: Story = {
  play: () => mockList(mockAnnotationStates.openComment),
};

export const Resolved: Story = {
  play: () => mockList(mockAnnotationStates.resolved),
};

export const Mixed_Standard: Story = {
  args: { forceVariant: 'standard' },
  play: () => mockList(mockAnnotationStates.mixed),
};

export const Mixed_Expert: Story = {
  args: { forceVariant: 'expert' },
  play: () => mockList(mockAnnotationStates.mixed),
};

export const Essential_Hidden: Story = {
  args: { forceVariant: 'essential' },
  play: () => mockList(mockAnnotationStates.openComment),
};
