import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HbcAnnotationThread } from '../HbcAnnotationThread';
import { createMockAnnotation } from '../../../testing/createMockAnnotation';
import { createMockAnnotationConfig } from '../../../testing/createMockAnnotationConfig';
import { createMockAnnotationReply } from '../../../testing/createMockAnnotationReply';
import { mockAnnotationStates } from '../../../testing/mockAnnotationStates';
import { AnnotationApi } from '../../api/AnnotationApi';
import type { IFieldAnnotation } from '../../types/IFieldAnnotation';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function ThreadWrapper({ children }: { children: (ref: React.RefObject<HTMLButtonElement | null>) => React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <QueryClientProvider client={qc}>
      <div style={{ padding: 40 }}>
        <button ref={ref} style={{ padding: '4px 12px' }}>Anchor</button>
        {children(ref)}
      </div>
    </QueryClientProvider>
  );
}

const defaultConfig = createMockAnnotationConfig() as Required<ReturnType<typeof createMockAnnotationConfig>>;

function mockList(data: IFieldAnnotation[]) {
  (AnnotationApi as { list: typeof AnnotationApi.list }).list = () => Promise.resolve(data);
}

const meta: Meta<typeof HbcAnnotationThread> = {
  title: 'field-annotations/HbcAnnotationThread',
  component: HbcAnnotationThread,
};

export default meta;
type Story = StoryObj<typeof HbcAnnotationThread>;

export const EmptyWithAddForm: Story = {
  render: () => {
    mockList([]);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="gmp" fieldLabel="Estimated GMP"
            config={defaultConfig} canAnnotate anchorRef={ref} onClose={() => {}}
          />
        )}
      </ThreadWrapper>
    );
  },
};

export const OpenAnnotations: Story = {
  render: () => {
    mockList(mockAnnotationStates.openClarification);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="totalBuildableArea" fieldLabel="Total Buildable Area"
            config={defaultConfig} canAnnotate canResolve anchorRef={ref} onClose={() => {}}
          />
        )}
      </ThreadWrapper>
    );
  },
};

export const WithReplies: Story = {
  render: () => {
    mockList([
      createMockAnnotation({
        status: 'open',
        body: 'Can you verify this number?',
        replies: [
          createMockAnnotationReply({ body: 'Verified — matches the latest estimate.', replyId: 'r1' }),
          createMockAnnotationReply({ body: 'Also cross-checked with accounting.', replyId: 'r2' }),
        ],
      }),
    ]);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="gmp" fieldLabel="GMP"
            config={defaultConfig} canAnnotate canResolve anchorRef={ref} onClose={() => {}} forceVariant="expert"
          />
        )}
      </ThreadWrapper>
    );
  },
};

export const ResolvedAnnotations: Story = {
  render: () => {
    mockList(mockAnnotationStates.resolved);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="totalBuildableArea" fieldLabel="Total Buildable Area"
            config={defaultConfig} canAnnotate anchorRef={ref} onClose={() => {}}
          />
        )}
      </ThreadWrapper>
    );
  },
};

export const Mixed: Story = {
  render: () => {
    mockList(mockAnnotationStates.mixed);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="totalBuildableArea" fieldLabel="Total Buildable Area"
            config={defaultConfig} canAnnotate canResolve anchorRef={ref} onClose={() => {}} forceVariant="expert"
          />
        )}
      </ThreadWrapper>
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    mockList(mockAnnotationStates.openComment);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="totalBuildableArea" fieldLabel="Total Buildable Area"
            config={defaultConfig} canAnnotate={false} canResolve={false} anchorRef={ref} onClose={() => {}}
          />
        )}
      </ThreadWrapper>
    );
  },
};

export const ResolveFormRequired: Story = {
  render: () => {
    mockList([
      createMockAnnotation({ intent: 'clarification-request', status: 'open', body: 'Need clarification on this value.' }),
    ]);
    return (
      <ThreadWrapper>
        {(ref) => (
          <HbcAnnotationThread
            recordType="bd-scorecard" recordId="rec-001" fieldKey="gmp" fieldLabel="GMP"
            config={defaultConfig} canAnnotate canResolve anchorRef={ref} onClose={() => {}}
          />
        )}
      </ThreadWrapper>
    );
  },
};
