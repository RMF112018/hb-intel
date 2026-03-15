/**
 * MyWorkProvider — SF29-T04
 * Thin React context supplying runtime context and default query to all hooks.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { IMyWorkRuntimeContext, IMyWorkQuery } from '../types/index.js';

interface IMyWorkContextValue {
  context: IMyWorkRuntimeContext;
  defaultQuery: IMyWorkQuery;
}

const MyWorkContext = createContext<IMyWorkContextValue | null>(null);

export interface IMyWorkProviderProps {
  context: IMyWorkRuntimeContext;
  defaultQuery?: IMyWorkQuery;
  children: ReactNode;
}

export function MyWorkProvider({
  context,
  defaultQuery = {},
  children,
}: IMyWorkProviderProps): JSX.Element {
  const value = useMemo<IMyWorkContextValue>(
    () => ({ context, defaultQuery }),
    [context, defaultQuery],
  );
  return <MyWorkContext.Provider value={value}>{children}</MyWorkContext.Provider>;
}

export function useMyWorkContext(): IMyWorkContextValue {
  const value = useContext(MyWorkContext);
  if (!value) {
    throw new Error('useMyWorkContext must be used within a MyWorkProvider');
  }
  return value;
}
