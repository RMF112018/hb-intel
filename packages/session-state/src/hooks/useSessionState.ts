/**
 * useSessionState hook — SF12-T05, D-07
 */
import { useContext } from 'react';
import type { ISessionStateContext } from '../types/index.js';
import { SessionStateContext } from '../context/SessionStateContext.js';

export function useSessionState(): ISessionStateContext {
  const ctx = useContext(SessionStateContext);
  if (!ctx) {
    throw new Error('useSessionState must be used within a SessionStateProvider');
  }
  return ctx;
}
