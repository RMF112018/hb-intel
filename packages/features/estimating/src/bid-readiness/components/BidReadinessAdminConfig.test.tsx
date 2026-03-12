import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BidReadinessAdminConfig } from './index.js';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('BidReadinessAdminConfig', () => {
  it('renders admin config editors and supports save/cancel flows', async () => {
    const wrapper = createWrapper();
    render(<BidReadinessAdminConfig />, { wrapper });

    expect(await screen.findByTestId('bid-readiness-admin-config')).toBeInTheDocument();
    expect(screen.getByTestId('readiness-criteria-editor')).toBeInTheDocument();
    expect(screen.getByTestId('scoring-weight-editor')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('admin-config-save'));
    fireEvent.click(screen.getByTestId('admin-config-cancel'));
  });
});
