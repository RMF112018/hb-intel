/**
 * SessionStateContext — React context definition — SF12-T05, D-06
 */
import { createContext } from 'react';
import type { ISessionStateContext } from '../types/index.js';

export const SessionStateContext = createContext<ISessionStateContext | null>(null);

SessionStateContext.displayName = 'SessionStateContext';
