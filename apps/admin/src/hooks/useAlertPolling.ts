import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { AlertPollingService } from '../services/alertPollingService.js';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

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

  // P3-09: Factory-based token provider
  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl =
    (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  useEffect(() => {
    if (!session || !functionAppUrl) return;

    const client = createProvisioningApiClient(functionAppUrl, getToken);
    const service = new AlertPollingService({
      provider: {
        listRequests: (state) => client.listRequests(state),
        listProvisioningRuns: (status) => client.listProvisioningRuns(status),
      },
      teamsWebhookUrl: (import.meta.env as Record<string, string | undefined>)
        .VITE_TEAMS_WEBHOOK_URL,
      emailRelay: (import.meta.env as Record<string, string | undefined>).VITE_ALERT_EMAIL_RELAY ?? '',
    });

    service.start();
    serviceRef.current = service;

    return () => {
      service.stop();
      serviceRef.current = null;
    };
  }, [session, getToken, functionAppUrl]);

  return serviceRef.current;
}
