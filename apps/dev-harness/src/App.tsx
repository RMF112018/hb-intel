/**
 * App — Provider hierarchy & root layout.
 * Foundation Plan Phase 3 — Blueprint §1d, §2e.
 *
 * HbcThemeProvider > QueryClientProvider > HbcErrorBoundary > TabRouter + DevControls
 *   + DevToolbar (persona switcher — D-PH5C-06/D-PH5C-02)
 */
import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HbcThemeProvider, HbcErrorBoundary, useHbcTheme } from '@hbc/ui-kit';
import { ComplexityProvider } from '@hbc/complexity';
import { defaultQueryOptions, defaultMutationOptions } from '@hbc/query-hooks';
import { TabRouter } from './TabRouter.js';
import { DevControls } from './DevControls.js';

// D-PH5C-06/D-PH5C-02: Lazily load persona switcher — always DEV in dev-harness but
// keeping the guard pattern consistent with ShellCore.tsx PH5C.4.
let DevToolbar: ComponentType | null = null;
if (import.meta.env.DEV) {
  DevToolbar = lazy(() =>
    import('@hbc/shell/dev-toolbar').then((m) => ({ default: m.DevToolbar })),
  );
}

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
        <ComplexityProvider>
          <div className="harness-root">
            <TabRouter />
            <DevControls isDark={isDark} onToggleTheme={toggleFieldMode} />
          </div>
        </ComplexityProvider>
      </HbcErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export function App() {
  return (
    <HbcThemeProvider>
      <HarnessRoot />
      {import.meta.env.DEV && DevToolbar ? (
        <Suspense fallback={null}>
          <DevToolbar />
        </Suspense>
      ) : null}
    </HbcThemeProvider>
  );
}
