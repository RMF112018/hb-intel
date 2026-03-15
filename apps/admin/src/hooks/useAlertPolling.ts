import { useEffect, useMemo, useRef } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { AlertPollingService } from '../services/alertPollingService.js';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';

/**
 * G6-T04: Initializes the alert polling service when the admin session is available.
 *
 * Creates a provisioning data provider from the provisioning API client,
 * starts the monitor polling loop, and returns the service instance.
 * The polling loop is cleaned up on unmount.
 */
export function useAlertPolling(): AlertPollingService | null {
  const session = useCurrentSession();
  const serviceRef = useRef<AlertPollingService | null>(null);

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const functionAppUrl =
    (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  useEffect(() => {
    if (!session || !functionAppUrl) return;

    const client = createProvisioningApiClient(functionAppUrl, async () => authToken);
    const service = new AlertPollingService({
      provider: {
        listRequests: (state) => client.listRequests(state),
        listProvisioningRuns: (status) => client.listProvisioningRuns(status),
      },
      teamsWebhookUrl: (import.meta.env as Record<string, string | undefined>)
        .VITE_TEAMS_WEBHOOK_URL,
      emailRelay: 'hbtech@hedrickbrothers.com',
    });

    service.start();
    serviceRef.current = service;

    return () => {
      service.stop();
      serviceRef.current = null;
    };
  }, [session, authToken, functionAppUrl]);

  return serviceRef.current;
}
