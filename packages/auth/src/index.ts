// Stores (Blueprint §2e — Zustand exclusively)
export { useAuthStore } from './stores/index.js';
export type { AuthState } from './stores/index.js';
export { usePermissionStore } from './stores/index.js';
export type { PermissionState } from './stores/index.js';

// Guards (Blueprint §1e — React access control components)
export { RoleGate, FeatureGate, PermissionGate } from './guards/index.js';
export type { RoleGateProps, FeatureGateProps, PermissionGateProps } from './guards/index.js';

// Hooks (Blueprint §1e — convenience hooks)
export { useCurrentUser, usePermission, useFeatureFlag } from './hooks/index.js';

// Adapters (Blueprint §2b — dual-mode auth)
export { resolveAuthMode, extractSpfxUser, initMsalAuth } from './adapters/index.js';
export type { AuthMode, IMsalConfig, ISpfxPageContext } from './adapters/index.js';

// SPFx bootstrap (Blueprint §2b — Phase 5)
export { bootstrapSpfxAuth } from './spfx/index.js';

// MSAL helpers (Blueprint §2b — Phase 4)
export { mapMsalAccountToUser, validateMsalConfig } from './msal/index.js';
