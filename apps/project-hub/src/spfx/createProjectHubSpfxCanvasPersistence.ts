import {
  createSpfxCanvasStorageAdapter,
  type ICanvasPersistenceAdapter,
  type ICanvasUserConfig,
} from '@hbc/project-canvas';

const LIST_TITLE = 'HBIntelProjectHubCanvasPersonalization';
const ATTACHMENT_FILE_NAME = 'canvas-config.json';

const digestCache = new Map<string, { value: string; expiresAt: number }>();

interface SpListItemResponse {
  value?: Array<{
    Id: number;
    Title: string;
  }>;
}

function normalizeSiteUrl(siteUrl?: string): string {
  return (siteUrl ?? '').trim().replace(/\/$/, '');
}

function escapeODataLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function buildKey(projectId: string, userId: string): string {
  return `${projectId}::${userId}`;
}

function buildListUrl(siteUrl: string, path = ''): string {
  return `${siteUrl}/_api/web/lists/GetByTitle('${LIST_TITLE}')${path}`;
}

function buildHeaders(overrides?: HeadersInit): HeadersInit {
  return {
    Accept: 'application/json;odata=nometadata',
    ...overrides,
  };
}

async function getRequestDigest(siteUrl: string): Promise<string> {
  const cached = digestCache.get(siteUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const response = await fetch(`${siteUrl}/_api/contextinfo`, {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json;odata=nometadata',
    }),
  });

  if (!response.ok) {
    throw new Error(`SharePoint digest request failed ${response.status}`);
  }

  const payload = (await response.json()) as {
    FormDigestValue?: string;
    FormDigestTimeoutSeconds?: number;
  };

  if (!payload.FormDigestValue) {
    throw new Error('SharePoint digest response missing FormDigestValue');
  }

  const expiresInMs = Math.max((payload.FormDigestTimeoutSeconds ?? 1800) - 60, 60) * 1000;
  digestCache.set(siteUrl, {
    value: payload.FormDigestValue,
    expiresAt: Date.now() + expiresInMs,
  });
  return payload.FormDigestValue;
}

async function ensurePersonalizationList(siteUrl: string): Promise<void> {
  const lookup = await fetch(buildListUrl(siteUrl), { headers: buildHeaders() });
  if (lookup.ok) {
    return;
  }

  if (lookup.status !== 404) {
    throw new Error(`SharePoint list lookup failed ${lookup.status}`);
  }

  const digest = await getRequestDigest(siteUrl);
  const createResponse = await fetch(`${siteUrl}/_api/web/lists`, {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
    }),
    body: JSON.stringify({
      __metadata: { type: 'SP.List' },
      Title: LIST_TITLE,
      BaseTemplate: 100,
      Description: 'HB Intel governed SPFx Project Hub canvas personalization records.',
      EnableAttachments: true,
    }),
  });

  if (!createResponse.ok && createResponse.status !== 409) {
    throw new Error(`SharePoint list creation failed ${createResponse.status}`);
  }
}

async function findRemoteItemId(siteUrl: string, key: string): Promise<number | null> {
  const response = await fetch(
    buildListUrl(
      siteUrl,
      `/items?$select=Id,Title&$filter=Title eq '${escapeODataLiteral(key)}'&$top=1`,
    ),
    { headers: buildHeaders() },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`SharePoint list query failed ${response.status}`);
  }

  const payload = (await response.json()) as SpListItemResponse;
  return payload.value?.[0]?.Id ?? null;
}

function isCanvasUserConfig(value: unknown): value is ICanvasUserConfig {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ICanvasUserConfig>;
  return (
    typeof candidate.projectId === 'string' &&
    typeof candidate.userId === 'string' &&
    Array.isArray(candidate.tiles)
  );
}

async function readAttachment(siteUrl: string, itemId: number): Promise<ICanvasUserConfig | null> {
  const response = await fetch(
    buildListUrl(siteUrl, `/items(${itemId})/AttachmentFiles/getByFileName('${ATTACHMENT_FILE_NAME}')/$value`),
    { headers: buildHeaders({ Accept: 'application/json' }) },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`SharePoint attachment read failed ${response.status}`);
  }

  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isCanvasUserConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function createRemoteItem(siteUrl: string, key: string): Promise<number> {
  const digest = await getRequestDigest(siteUrl);
  const response = await fetch(buildListUrl(siteUrl, '/items'), {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json;odata=nometadata',
      'X-RequestDigest': digest,
    }),
    body: JSON.stringify({ Title: key }),
  });

  if (!response.ok) {
    throw new Error(`SharePoint list item creation failed ${response.status}`);
  }

  const payload = (await response.json()) as { Id?: number };
  if (!payload.Id) {
    throw new Error('SharePoint list item creation did not return an item id');
  }

  return payload.Id;
}

async function deleteAttachment(siteUrl: string, itemId: number, digest: string): Promise<void> {
  const response = await fetch(
    buildListUrl(siteUrl, `/items(${itemId})/AttachmentFiles/getByFileName('${ATTACHMENT_FILE_NAME}')`),
    {
      method: 'POST',
      headers: buildHeaders({
        'X-RequestDigest': digest,
        'IF-MATCH': '*',
        'X-HTTP-Method': 'DELETE',
      }),
    },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`SharePoint attachment delete failed ${response.status}`);
  }
}

async function uploadAttachment(siteUrl: string, itemId: number, config: ICanvasUserConfig): Promise<void> {
  const digest = await getRequestDigest(siteUrl);
  await deleteAttachment(siteUrl, itemId, digest);

  const response = await fetch(
    buildListUrl(siteUrl, `/items(${itemId})/AttachmentFiles/add(FileName='${ATTACHMENT_FILE_NAME}')`),
    {
      method: 'POST',
      headers: buildHeaders({
        'Content-Type': 'application/octet-stream',
        'X-RequestDigest': digest,
      }),
      body: new TextEncoder().encode(JSON.stringify(config)),
    },
  );

  if (!response.ok) {
    throw new Error(`SharePoint attachment upload failed ${response.status}`);
  }
}

async function deleteRemoteItem(siteUrl: string, itemId: number): Promise<void> {
  const digest = await getRequestDigest(siteUrl);
  const response = await fetch(buildListUrl(siteUrl, `/items(${itemId})`), {
    method: 'POST',
    headers: buildHeaders({
      'X-RequestDigest': digest,
      'IF-MATCH': '*',
      'X-HTTP-Method': 'DELETE',
    }),
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`SharePoint list item delete failed ${response.status}`);
  }
}

export function createProjectHubSpfxCanvasPersistence(siteUrl?: string): ICanvasPersistenceAdapter {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  const localAdapter = createSpfxCanvasStorageAdapter();

  return {
    async getConfig(projectId, userId) {
      if (!normalizedSiteUrl) {
        return localAdapter.getConfig(projectId, userId);
      }

      try {
        const itemId = await findRemoteItemId(normalizedSiteUrl, buildKey(projectId, userId));
        if (itemId !== null) {
          const remoteConfig = await readAttachment(normalizedSiteUrl, itemId);
          if (remoteConfig) {
            await localAdapter.saveConfig(remoteConfig);
            return remoteConfig;
          }
        }
      } catch (error) {
        console.warn('[HB Intel] SharePoint canvas rehydrate failed; falling back to local persistence.', error);
      }

      return localAdapter.getConfig(projectId, userId);
    },

    async saveConfig(config) {
      await localAdapter.saveConfig(config);

      if (!normalizedSiteUrl) {
        return;
      }

      try {
        await ensurePersonalizationList(normalizedSiteUrl);
        const key = buildKey(config.projectId, config.userId);
        const itemId =
          (await findRemoteItemId(normalizedSiteUrl, key)) ??
          (await createRemoteItem(normalizedSiteUrl, key));
        await uploadAttachment(normalizedSiteUrl, itemId, config);
      } catch (error) {
        console.warn('[HB Intel] SharePoint canvas sync failed; local persistence retained.', error);
      }
    },

    async resetConfig(projectId, userId) {
      await localAdapter.resetConfig(projectId, userId);

      if (!normalizedSiteUrl) {
        return;
      }

      try {
        const itemId = await findRemoteItemId(normalizedSiteUrl, buildKey(projectId, userId));
        if (itemId !== null) {
          await deleteRemoteItem(normalizedSiteUrl, itemId);
        }
      } catch (error) {
        console.warn('[HB Intel] SharePoint canvas reset sync failed; local reset retained.', error);
      }
    },
  };
}
