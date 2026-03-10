import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcAnnotationSummary } from '../HbcAnnotationSummary';
import { createMockAnnotationConfig } from '../../../testing/createMockAnnotationConfig';
import { mockAnnotationStates } from '../../../testing/mockAnnotationStates';
import { AnnotationApi } from '../../api/AnnotationApi';
import type { IFieldAnnotation } from '../../types/IFieldAnnotation';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function withQuery(Story: React.ComponentType) {
  return (
    <QueryClientProvider client={qc}>
      <div style={{ padding: 24, maxWidth: 480 }}>
        <Story />
      </div>
    </QueryClientProvider>
  );
}

const defaultConfig = createMockAnnotationConfig();

function mockList(data: IFieldAnnotation[]) {
  (AnnotationApi as { list: typeof AnnotationApi.list }).list = () => Promise.resolve(data);
}

const meta: Meta<typeof HbcAnnotationSummary> = {
  title: 'field-annotations/HbcAnnotationSummary',
  component: HbcAnnotationSummary,
  decorators: [withQuery],
  args: {
    recordType: 'bd-scorecard',
    recordId: 'rec-001',
    config: defaultConfig,
  },
};

export default meta;
type Story = StoryObj<typeof HbcAnnotationSummary>;

export const Empty: Story = {
  play: () => mockList([]),
};

export const OpenAnnotations_Standard: Story = {
  args: { forceVariant: 'standard' },
  play: () => mockList(mockAnnotationStates.mixed),
};

export const OpenAnnotations_Expert: Story = {
  args: {
    forceVariant: 'expert',
    onFieldFocus: (fieldKey: string) => console.log('Focus:', fieldKey),
  },
  play: () => mockList(mockAnnotationStates.mixed),
};

export const Essential_Hidden: Story = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentionally testing essential via forceVariant
  args: { forceVariant: 'essential' as unknown as 'standard' },
  play: () => mockList(mockAnnotationStates.mixed),
};
