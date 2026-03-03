/**
 * App — Provider hierarchy & root layout.
 * Foundation Plan Phase 3 — Blueprint §1d, §2e.
 *
 * FluentProvider > QueryClientProvider > HbcErrorBoundary > TabRouter + DevControls
 */
import { useState } from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { hbcLightTheme, hbcDarkTheme, HbcErrorBoundary } from '@hbc/ui-kit';
import { defaultQueryOptions, defaultMutationOptions } from '@hbc/query-hooks';
import { TabRouter } from './TabRouter.js';
import { DevControls } from './DevControls.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

export function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <FluentProvider theme={isDark ? hbcDarkTheme : hbcLightTheme}>
      <QueryClientProvider client={queryClient}>
        <HbcErrorBoundary>
          <div className="harness-root">
            <TabRouter />
            <DevControls isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} />
          </div>
        </HbcErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </FluentProvider>
  );
}
