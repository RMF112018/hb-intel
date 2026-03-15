import { renderHook } from '@testing-library/react';
import { MyWorkProvider, useMyWorkContext } from '../hooks/MyWorkContext.js';
import { createMockRuntimeContext } from '@hbc/my-work-feed/testing';
import type { IMyWorkQuery, IMyWorkRuntimeContext } from '../types/index.js';
import type { ReactNode } from 'react';

describe('MyWorkContext', () => {
  const context = createMockRuntimeContext();

  function wrapper({ children }: { children: ReactNode }) {
    return <MyWorkProvider context={context}>{children}</MyWorkProvider>;
  }

  it('throws when used outside MyWorkProvider', () => {
    // suppress console.error from React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useMyWorkContext())).toThrow(
      'useMyWorkContext must be used within a MyWorkProvider',
    );
    spy.mockRestore();
  });

  it('provides context and empty default query', () => {
    const { result } = renderHook(() => useMyWorkContext(), { wrapper });
    expect(result.current.context).toBe(context);
    expect(result.current.defaultQuery).toEqual({});
  });

  it('provides custom default query when specified', () => {
    const defaultQuery: IMyWorkQuery = { projectId: 'proj-001' };
    function customWrapper({ children }: { children: ReactNode }) {
      return (
        <MyWorkProvider context={context} defaultQuery={defaultQuery}>
          {children}
        </MyWorkProvider>
      );
    }
    const { result } = renderHook(() => useMyWorkContext(), { wrapper: customWrapper });
    expect(result.current.defaultQuery).toBe(defaultQuery);
  });

  it('returns stable value reference across re-renders with same props', () => {
    const defaultQuery = { projectId: 'proj-001' };
    function stableWrapper({ children }: { children: ReactNode }) {
      return (
        <MyWorkProvider context={context} defaultQuery={defaultQuery}>
          {children}
        </MyWorkProvider>
      );
    }
    const { result, rerender } = renderHook(() => useMyWorkContext(), { wrapper: stableWrapper });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
