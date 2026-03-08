/**
 * Graph API wrapper for @hbc/sharepoint-docs.
 *
 * SPFx constraint (CLAUDE.md §SPFx Constraints):
 *   All Graph API calls route through packages/api/ Azure Functions backend.
 *   This class wraps the backend proxy endpoints — it does NOT call Graph directly.
 *
 * The backend proxy handles:
 *   - MSAL on-behalf-of token acquisition
 *   - Graph API throttle retry (429 → exponential backoff)
 *   - Request batching where possible
 */
export class SharePointDocsApi {
  private baseUrl: string;
  private getAuthHeader: () => Promise<Record<string, string>>;

  constructor(
    baseUrl: string,
    getAuthHeader: () => Promise<Record<string, string>>
  ) {
    this.baseUrl = baseUrl;
    this.getAuthHeader = getAuthHeader;
  }

  async folderExists(siteUrl: string, folderPath: string): Promise<boolean> {
    const headers = await this.getAuthHeader();
    const res = await fetch(
      `${this.baseUrl}/api/sharepoint/folder-exists?siteUrl=${encodeURIComponent(siteUrl)}&path=${encodeURIComponent(folderPath)}`,
      { headers }
    );
    if (res.status === 404) return false;
    if (!res.ok) throw new Error(`folderExists failed: ${res.status}`);
    return true;
  }

  async createFolder(siteUrl: string, folderPath: string): Promise<void> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/folder`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath }),
    });
    if (!res.ok) throw new Error(`createFolder failed: ${res.status} for ${folderPath}`);
  }

  async getFolderAbsoluteUrl(siteUrl: string, folderPath: string): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(
      `${this.baseUrl}/api/sharepoint/folder-url?siteUrl=${encodeURIComponent(siteUrl)}&path=${encodeURIComponent(folderPath)}`,
      { headers }
    );
    if (!res.ok) throw new Error(`getFolderAbsoluteUrl failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  }

  async breakFolderInheritance(
    siteUrl: string,
    folderPath: string,
    copyRoleAssignments: boolean
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.baseUrl}/api/sharepoint/folder-inheritance`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath, copyRoleAssignments }),
    });
  }

  async grantFolderPermission(
    siteUrl: string,
    folderPath: string,
    grant: { principalType: 'user' | 'group'; principal: string; roleType: string }
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    await fetch(`${this.baseUrl}/api/sharepoint/folder-permission`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath, ...grant }),
    });
  }

  async uploadSmallFile(
    siteUrl: string,
    filePath: string,
    file: File,
    onProgress?: (p: { bytesUploaded: number; totalBytes: number; percentComplete: number }) => void
  ): Promise<string> {
    const headers = await this.getAuthHeader();
    const formData = new FormData();
    formData.append('siteUrl', siteUrl);
    formData.append('filePath', filePath);
    formData.append('file', file);
    const res = await fetch(`${this.baseUrl}/api/sharepoint/file-upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`uploadSmallFile failed: ${res.status}`);
    const data = await res.json();
    onProgress?.({ bytesUploaded: file.size, totalBytes: file.size, percentComplete: 100 });
    return data.url as string;
  }

  async createUploadSession(siteUrl: string, filePath: string, fileSize: number): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/upload-session`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, filePath, fileSize }),
    });
    if (!res.ok) throw new Error(`createUploadSession failed: ${res.status}`);
    const data = await res.json();
    return data.uploadUrl as string;
  }

  async uploadChunk(
    uploadUrl: string,
    chunk: Blob,
    rangeStart: number,
    totalSize: number
  ): Promise<{ sharepointUrl?: string }> {
    const headers = await this.getAuthHeader();
    const rangeEnd = rangeStart + chunk.size - 1;
    const res = await fetch(`${this.baseUrl}/api/sharepoint/upload-chunk`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Range': `bytes ${rangeStart}-${rangeEnd}/${totalSize}`,
        'Content-Length': String(chunk.size),
      },
      body: chunk,
    });
    if (!res.ok) throw new Error(`uploadChunk failed: ${res.status}`);
    if (res.status === 200 || res.status === 201) {
      const data = await res.json();
      return { sharepointUrl: data.url };
    }
    return {};
  }

  async moveFile(
    sourceSiteUrl: string,
    sourceFilePath: string,
    destSiteUrl: string,
    destFilePath: string
  ): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/file-move`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceSiteUrl, sourceFilePath, destSiteUrl, destFilePath }),
    });
    if (!res.ok) throw new Error(`moveFile failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  }

  async createUrlFile(
    siteUrl: string,
    folderPath: string,
    fileName: string,
    targetUrl: string,
    description: string
  ): Promise<string> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.baseUrl}/api/sharepoint/url-file`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteUrl, folderPath, fileName, targetUrl, description }),
    });
    if (!res.ok) throw new Error(`createUrlFile failed: ${res.status}`);
    const data = await res.json();
    return data.url as string;
  }

  async listFilesInFolder(siteUrl: string, folderPath: string): Promise<Array<{
    name: string;
    size: number;
    url: string;
    modifiedAt: string;
  }>> {
    const headers = await this.getAuthHeader();
    const res = await fetch(
      `${this.baseUrl}/api/sharepoint/folder-files?siteUrl=${encodeURIComponent(siteUrl)}&path=${encodeURIComponent(folderPath)}`,
      { headers }
    );
    if (!res.ok) throw new Error(`listFilesInFolder failed: ${res.status}`);
    return res.json();
  }
}
