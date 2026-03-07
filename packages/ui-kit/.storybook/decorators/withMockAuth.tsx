/**
 * @file decorators/withMockAuth.tsx
 * @description Global Storybook decorator for mock authentication.
 *
 * This decorator provides a consistent dev auth context for stories by
 * initializing @hbc/auth with MockAdapter-backed user/session state.
 *
 * IMPORTANT: This decorator is Storybook-only. It is NOT used in
 * production builds or exported from @hbc/ui-kit.
 *
 * Traceability:
 * - PH4C.9 §4C.9
 * - D-PH4C-15 (Dev Auth Bypass)
 * - D-PH4C-16 (Boundary enforcement/no production leak)
 */

import React from 'react';
import type { Decorator } from '@storybook/react';
import { MockAdapter, useAuthStore, usePermissionStore } from '@hbc/auth';
import { STORYBOOK_MOCK_USER } from '../mockAuth';

/**
 * Bootstraps auth + permission Zustand stores from MockAdapter for stories.
 * This mirrors runtime auth consumption without introducing Storybook code
 * into production source paths.
 */
const MockAuthBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    let disposed = false;

    const init = async (): Promise<void> => {
      // Boundary guard: no-op in production builds even if imported accidentally.
      if (
        (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
        (typeof import.meta !== 'undefined' && import.meta.env?.PROD)
      ) {
        return;
      }

      const adapter = new MockAdapter('dev-override', STORYBOOK_MOCK_USER);
      const identity = await adapter.acquireIdentity();
      if (!identity.ok || disposed) return;

      const normalized = adapter.normalizeSession(identity.value);
      if (!normalized.ok || disposed) return;

      // Apply normalized session to auth store for hooks like useCurrentUser/useResolvedRuntimeMode.
      useAuthStore.getState().signInSuccess(normalized.value);
      // Keep permission checks in sync for components calling usePermission().
      usePermissionStore.getState().setPermissions(normalized.value.permissionSummary.grants);
    };

    void init();
    return () => {
      disposed = true;
      // Cleanup preserves Storybook story isolation across story switches.
      useAuthStore.getState().clear();
      usePermissionStore.getState().clear();
    };
  }, []);

  return <>{children}</>;
};

/**
 * withMockAuth Decorator
 *
 * Provides all stories with MockAdapter-backed auth context/state.
 * Components that call auth hooks receive mock user data instead of
 * requiring real MSAL/SPFx authentication.
 */
export const withMockAuth: Decorator = (Story, context) => {
  // Guard condition: prevent activation in production execution contexts.
  if (
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') ||
    (typeof import.meta !== 'undefined' && import.meta.env?.PROD)
  ) {
    return <Story {...context} />;
  }

  return (
    <MockAuthBootstrap>
      <Story {...context} />
    </MockAuthBootstrap>
  );
};
