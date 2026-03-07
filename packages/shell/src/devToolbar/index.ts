// packages/shell/src/devToolbar/index.ts
// D-PH5C-06: DevToolbar exports (dev mode only)
// D-PH5C-02: Explicit runtime guard to block accidental production usage

if (!import.meta.env.DEV) {
  throw new Error('devToolbar is only available in development mode');
}

export { DevToolbar } from './DevToolbar.js';
export { PersonaCard, type PersonaCardProps } from './PersonaCard.js';
export { useDevAuthBypass, type IDevAuthBypassState } from './useDevAuthBypass.js';
