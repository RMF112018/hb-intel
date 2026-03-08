import type { ITombstone } from '../types/index.js';
import { SharePointDocsApi } from './SharePointDocsApi.js';

export interface TombstoneCreateParams {
  siteUrl: string;
  sourceFolderPath: string;
  originalFileName: string;
  destinationUrl: string;
  destinationLabel: string;
  documentId: string;
}

/**
 * Creates tombstone .url shortcut files at source locations after migration (D-01).
 *
 * A tombstone is a Windows Internet Shortcut (.url) file placed where the original
 * document used to live. When a user browsing the staging folder clicks it, they
 * navigate directly to the migrated document in the project site.
 *
 * Tombstone file name format: {originalFileName}.migrated.url
 * Example: Project-RFP-Final.pdf.migrated.url
 *
 * The .url file content format (Windows Internet Shortcut):
 *   [InternetShortcut]
 *   URL={destinationUrl}
 *   IconIndex=0
 *
 * SharePoint renders .url files as clickable links in document libraries.
 */
export class TombstoneWriter {
  constructor(private api: SharePointDocsApi) {}

  async create(params: TombstoneCreateParams): Promise<string> {
    const tombstoneFileName = `${params.originalFileName}.migrated.url`;
    const tombstoneContent = this.buildUrlFileContent(params.destinationUrl, params.destinationLabel);
    const tombstoneBlob = new Blob([tombstoneContent], { type: 'text/plain' });

    const tombstoneUrl = await this.api.uploadSmallFile(
      params.siteUrl,
      `${params.sourceFolderPath}/${tombstoneFileName}`,
      new File([tombstoneBlob], tombstoneFileName, { type: 'text/plain' })
    );

    return tombstoneUrl;
  }

  /**
   * Builds the content of a Windows Internet Shortcut (.url) file.
   * SharePoint renders these as clickable navigation links.
   */
  private buildUrlFileContent(targetUrl: string, description: string): string {
    return [
      '[InternetShortcut]',
      `URL=${targetUrl}`,
      'IconIndex=0',
      `Comment=Migrated to project site — ${description}`,
      `HotKey=0`,
      `IDList=`,
    ].join('\r\n');
  }
}
