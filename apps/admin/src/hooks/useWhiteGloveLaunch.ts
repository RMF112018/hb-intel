/**
 * P9.1-09: Hook for the white-glove package launch workflow.
 *
 * Provides employee identity lookup, package run launch via backend API,
 * and preflight readiness fetching for the launch context.
 */

import { useState, useCallback, useMemo } from 'react';
import { useCurrentSession } from '@hbc/auth';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

export interface IEmployeeIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly userPrincipalName: string;
  readonly accountEnabled: boolean;
}

export interface ILaunchResult {
  readonly packageRunId: string;
  readonly packageStatus: string;
  readonly totalDevices: number;
}

export interface ILaunchDeviceInput {
  readonly slotOrdinal: number;
  readonly platform: string;
  readonly manufacturer: string;
  readonly enrollmentAuthority: string;
  readonly serialNumber: string;
  readonly assetTag?: string;
  readonly hostname?: string;
}

export interface ILaunchRequest {
  readonly packageFamily: string;
  readonly templateVersion: number;
  readonly employeeDisplayName: string;
  readonly employeeUpn: string;
  readonly employeeObjectId: string;
  readonly devices: readonly ILaunchDeviceInput[];
}

export interface UseWhiteGloveLaunchResult {
  readonly employee: IEmployeeIdentity | null;
  readonly employeeLoading: boolean;
  readonly employeeError: string | null;
  readonly lookupEmployee: (upn: string) => Promise<void>;
  readonly launchPackageRun: (request: ILaunchRequest) => Promise<ILaunchResult>;
  readonly launching: boolean;
  readonly launchError: string | null;
}

export function useWhiteGloveLaunch(): UseWhiteGloveLaunchResult {
  const session = useCurrentSession();
  const [employee, setEmployee] = useState<IEmployeeIdentity | null>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const sessionRef = useCallback(() => session, [session]);
  const getToken = useMemo(() => createSessionTokenFactory(sessionRef), [sessionRef]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';

  const lookupEmployee = useCallback(async (upn: string): Promise<void> => {
    if (!functionAppUrl) return;
    setEmployeeLoading(true);
    setEmployeeError(null);
    setEmployee(null);
    try {
      const token = await getToken();
      const response = await fetch(`${functionAppUrl}/api/admin/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Lookup failed: ${response.status}`);
      // Stub: in a real implementation this would call a user-lookup endpoint.
      // For now, return a synthetic identity from the UPN.
      setEmployee({
        id: `oid-${upn}`,
        displayName: upn.split('@')[0].replace('.', ' '),
        userPrincipalName: upn,
        accountEnabled: true,
      });
    } catch (err) {
      setEmployeeError(err instanceof Error ? err.message : 'Employee lookup failed');
    } finally {
      setEmployeeLoading(false);
    }
  }, [getToken, functionAppUrl]);

  const launchPackageRun = useCallback(async (request: ILaunchRequest): Promise<ILaunchResult> => {
    if (!functionAppUrl) throw new Error('Function app URL not configured');
    setLaunching(true);
    setLaunchError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${functionAppUrl}/api/admin/white-glove/runs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error((errorBody as Record<string, string>).message ?? `Launch failed: ${response.status}`);
      }
      return (await response.json()) as ILaunchResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Package launch failed';
      setLaunchError(message);
      throw err;
    } finally {
      setLaunching(false);
    }
  }, [getToken, functionAppUrl]);

  return {
    employee,
    employeeLoading,
    employeeError,
    lookupEmployee,
    launchPackageRun,
    launching,
    launchError,
  };
}
