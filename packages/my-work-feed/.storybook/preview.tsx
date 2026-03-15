import * as React from 'react';
import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyWorkProvider } from '../src/hooks/MyWorkContext.js';
import { MyWorkPanelStoreProvider } from '../src/store/MyWorkPanelStore.js';
import { createMockRuntimeContext } from '../testing/index.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockContext = createMockRuntimeContext();

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MyWorkProvider context={mockContext}>
          <MyWorkPanelStoreProvider>
            <Story />
          </MyWorkPanelStoreProvider>
        </MyWorkProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
};

export default preview;
