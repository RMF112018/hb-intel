/**
 * PWA wrapper around @hbc/auth's AccessDenied component.
 * D-PH6F-3: Provides router-based navigation callbacks for the access-denied UX.
 */
import type { ReactNode } from 'react';
import { AccessDenied as AuthAccessDenied } from '@hbc/auth';

export function PwaAccessDenied(): ReactNode {
  return (
    <AuthAccessDenied
      onGoHome={() => {
        window.location.href = '/';
      }}
      onGoBack={() => {
        window.history.back();
      }}
    />
  );
}
