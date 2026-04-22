import { createContext, useContext, type ReactNode } from 'react';
import type { ISafetyInspectionRepository } from '../ports/ISafetyInspectionRepository.js';

const RepositoryContext = createContext<ISafetyInspectionRepository | null>(null);

export interface SafetyRepositoryProviderProps {
  readonly repository: ISafetyInspectionRepository;
  readonly children: ReactNode;
}

export function SafetyRepositoryProvider({
  repository,
  children,
}: SafetyRepositoryProviderProps): ReactNode {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export function useSafetyRepository(): ISafetyInspectionRepository {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error(
      'useSafetyRepository must be used inside <SafetyRepositoryProvider>. Wire it in App.tsx.',
    );
  }
  return ctx;
}
