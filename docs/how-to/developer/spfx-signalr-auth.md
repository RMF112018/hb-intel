# SPFx SignalR Negotiate Authentication Pattern

**Phase Traceability:** D-PH6-07 (PH6.7 §6.7.5)
**Audience:** Developers building SPFx provisioning UI integrations.
**Last Updated:** 2026-03-07

## Overview

SPFx web parts acquire an Entra ID Bearer token with `AadHttpClient`, call the provisioning
negotiate endpoint, then connect to Azure SignalR with automatic reconnect enabled.

## Required Flow

1. Get an `AadHttpClient` for the Function App app registration URI.
2. Call `POST /api/provisioning-negotiate?projectId=<projectId>`.
3. Use returned `url` and `accessToken` to create HubConnection.
4. Register `provisioningProgress` handler to update Zustand state.
5. On reconnect, re-run negotiate so group assignment remains valid.

## Reference Implementation

```typescript
import { AadHttpClient } from '@microsoft/sp-http';
import * as signalR from '@microsoft/signalr';
import type { IProvisioningProgressEvent } from '@hbc/models';
import { useProvisioningStore } from '@hbc/provisioning';

const FUNCTION_APP_AUDIENCE = 'api://<AZURE_CLIENT_ID>';
const FUNCTION_APP_URL = '<FUNCTION_APP_URL>';

export async function connectProvisioningHub(context: { aadHttpClientFactory: any }, projectId: string) {
  // D-PH6-07: acquire a Bearer token in SPFx iframe context via AadHttpClient.
  const client = await context.aadHttpClientFactory.getClient(FUNCTION_APP_AUDIENCE);

  // Negotiate must include projectId so backend assigns provisioning-{projectId} membership.
  const negotiateResponse = await client.post(
    `${FUNCTION_APP_URL}/api/provisioning-negotiate?projectId=${encodeURIComponent(projectId)}`,
    AadHttpClient.configurations.v1,
    {}
  );

  if (!negotiateResponse.ok) {
    throw new Error(`SignalR negotiate failed: ${negotiateResponse.status}`);
  }

  const { url, accessToken } = await negotiateResponse.json() as {
    url: string;
    accessToken: string;
  };

  // Automatic reconnect protects the checklist stream during transient network loss.
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url, { accessTokenFactory: () => accessToken })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on('provisioningProgress', (event: IProvisioningProgressEvent) => {
    useProvisioningStore.getState().handleProgressEvent(event);
  });

  // Reconnection strategy: re-negotiate after reconnect so group assignment remains current.
  connection.onreconnected(async () => {
    await connection.stop();
    await connectProvisioningHub(context, projectId);
  });

  await connection.start();
  return connection;
}
```

## Notes

- `projectId` maps to SignalR group `provisioning-{projectId}`.
- Admin users are additionally assigned to `provisioning-admin` by negotiate logic.
- If project context changes, close the previous connection and re-negotiate for new group membership.
