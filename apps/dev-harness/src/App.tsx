/**
 * App — Provider hierarchy & root layout.
 * Foundation Plan Phase 3 — Blueprint §1d, §2e.
 *
 * HbcThemeProvider > QueryClientProvider > HbcErrorBoundary > TabRouter + DevControls
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HbcThemeProvider, HbcErrorBoundary, useHbcTheme } from '@hbc/ui-kit';
import { defaultQueryOptions, defaultMutationOptions } from '@hbc/query-hooks';
import { TabRouter } from './TabRouter.js';
import { DevControls } from './DevControls.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

function HarnessRoot(): React.ReactNode {
  const { theme, toggleFieldMode } = useHbcTheme();
  const isDark = theme === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <HbcErrorBoundary>
        <div className="harness-root">
          <TabRouter />
          <DevControls isDark={isDark} onToggleTheme={toggleFieldMode} />
        </div>
      </HbcErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <HbcThemeProvider>
      <HarnessRoot />
    </HbcThemeProvider>
  );
}
