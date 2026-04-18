import { DefaultAzureCredential } from '@azure/identity';
import { withRetry } from '../../utils/retry.js';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export interface ILegacyGraphSite {
  readonly id: string;
  readonly webUrl: string;
  readonly name: string;
}

export interface ILegacyGraphDrive {
  readonly id: string;
  readonly name: string;
  readonly webUrl: string;
  readonly driveType: string;
}

export interface ILegacyGraphFolderItem {
  readonly driveId: string;
  readonly driveItemId: string;
  readonly folderName: string;
  readonly folderPath: string;
  readonly folderWebUrl: string;
}

export interface ILegacyFallbackDiscoveryGraphClient {
  resolveSite(siteUrl: string, sitePath: string): Promise<ILegacyGraphSite>;
  resolveDrive(siteId: string, preferredLibraryName?: string, driveOverrideId?: string): Promise<ILegacyGraphDrive>;
  listRootFolders(driveId: string): Promise<readonly ILegacyGraphFolderItem[]>;
}

interface IGraphListResponse<T> {
  value: T[];
  '@odata.nextLink'?: string;
}

interface IGraphDriveItem {
  id: string;
  name: string;
  webUrl: string;
  folder?: Record<string, unknown>;
  parentReference?: {
    path?: string;
  };
}

function normalizeFolderPath(parentPath: string | undefined, folderName: string): string {
  const path = parentPath ?? '';
  const marker = '/root:';
  const markerIndex = path.indexOf(marker);
  if (markerIndex < 0) {
    return `/${folderName}`;
  }
  const suffix = path.slice(markerIndex + marker.length);
  if (suffix.length === 0 || suffix === '/') {
    return `/${folderName}`;
  }
  return `${suffix}/${folderName}`.replace(/\/{2,}/g, '/');
}

function isTransientGraphError(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || (status >= 500 && status <= 599);
}

export class LegacyFallbackDiscoveryGraphClient implements ILegacyFallbackDiscoveryGraphClient {
  private readonly credential = new DefaultAzureCredential();

  constructor(private readonly graphScope: string = 'https://graph.microsoft.com/.default') {}

  async resolveSite(siteUrl: string, sitePath: string): Promise<ILegacyGraphSite> {
    const parsed = new URL(siteUrl);
    const host = parsed.host;
    const response = await this.request<{ id: string; webUrl: string; displayName?: string; name?: string }>(
      `/sites/${host}:${sitePath}?$select=id,webUrl,displayName,name`,
    );

    return {
      id: response.id,
      webUrl: response.webUrl,
      name: response.displayName ?? response.name ?? sitePath,
    };
  }

  async resolveDrive(
    siteId: string,
    preferredLibraryName?: string,
    driveOverrideId?: string,
  ): Promise<ILegacyGraphDrive> {
    if (driveOverrideId) {
      const override = await this.request<{ id: string; name: string; webUrl: string; driveType: string }>(
        `/drives/${encodeURIComponent(driveOverrideId)}?$select=id,name,webUrl,driveType`,
      );
      return {
        id: override.id,
        name: override.name,
        webUrl: override.webUrl,
        driveType: override.driveType,
      };
    }

    const drives = await this.request<IGraphListResponse<{ id: string; name: string; webUrl: string; driveType: string }>>(
      `/sites/${encodeURIComponent(siteId)}/drives?$select=id,name,webUrl,driveType`,
    );

    if (!drives.value.length) {
      throw new Error(`No drives found for site ${siteId}`);
    }

    if (preferredLibraryName) {
      const preferred = drives.value.find(
        (drive) => drive.name.toLowerCase() === preferredLibraryName.toLowerCase(),
      );
      if (preferred) {
        return preferred;
      }
    }

    const docLibrary = drives.value.find((drive) => drive.driveType === 'documentLibrary');
    return docLibrary ?? drives.value[0];
  }

  async listRootFolders(driveId: string): Promise<readonly ILegacyGraphFolderItem[]> {
    const folders: ILegacyGraphFolderItem[] = [];
    let nextPath: string | null = `/drives/${encodeURIComponent(driveId)}/root/children?$select=id,name,webUrl,folder,parentReference`;

    while (nextPath) {
      const page: IGraphListResponse<IGraphDriveItem> = await this.request<IGraphListResponse<IGraphDriveItem>>(
        nextPath,
        nextPath.startsWith('http://') || nextPath.startsWith('https://'),
      );
      for (const item of page.value) {
        if (!item.folder) {
          continue;
        }
        folders.push({
          driveId,
          driveItemId: item.id,
          folderName: item.name,
          folderPath: normalizeFolderPath(item.parentReference?.path, item.name),
          folderWebUrl: item.webUrl,
        });
      }
      nextPath = page['@odata.nextLink'] ?? null;
    }

    return folders;
  }

  private async request<T>(pathOrUrl: string, isAbsolute = false): Promise<T> {
    const endpoint = isAbsolute ? pathOrUrl : `${GRAPH_BASE}${pathOrUrl}`;

    return withRetry(async () => {
      const token = await this.credential.getToken(this.graphScope);
      if (!token?.token) {
        throw new Error('Unable to acquire Graph access token.');
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text();
        const error = new Error(`Graph request failed (${response.status}) for ${endpoint}: ${body}`) as Error & {
          response?: { headers: Headers };
        };
        if (isTransientGraphError(response.status)) {
          error.response = { headers: response.headers };
        }
        throw error;
      }

      return (await response.json()) as T;
    });
  }
}
