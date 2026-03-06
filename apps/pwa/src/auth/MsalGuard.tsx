/**
 * MsalGuard — Blueprint §2b, §4a.
 * Wraps children in MsalProvider + MsalAuthenticationTemplate.
 * Shows loading/error states for MSAL authentication flow.
 */
import type { ReactNode } from 'react';
import { MsalProvider, MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { Spinner, Text } from '@hbc/ui-kit';
import { getMsalInstance } from './msal-init.js';
import { LOGIN_SCOPES } from './msal-config.js';

function LoadingComponent(): ReactNode {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
      <Spinner size="medium" />
      <Text>Signing in to HB Intel...</Text>
    </div>
  );
}

function ErrorComponent({ error }: { error: Error | null }): ReactNode {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
      <Text weight="bold" size={500}>Authentication Error</Text>
      <Text>{error?.message ?? 'An unknown error occurred during sign-in.'}</Text>
    </div>
  );
}

interface MsalGuardProps {
  children: ReactNode;
}

export function MsalGuard({ children }: MsalGuardProps): ReactNode {
  const instance = getMsalInstance();

  return (
    <MsalProvider instance={instance}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={{ scopes: LOGIN_SCOPES }}
        loadingComponent={LoadingComponent}
        errorComponent={ErrorComponent as never}
      >
        {children}
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
}
