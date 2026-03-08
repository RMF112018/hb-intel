import type { IUploadedDocument } from '../types/index.js';
import { REG } from '../constants/registryColumns.js';

export class RegistryClient {
  private listEndpoint: string;
  private getAuthHeader: () => Promise<Record<string, string>>;

  constructor(listEndpoint: string, getAuthHeader: () => Promise<Record<string, string>>) {
    this.listEndpoint = listEndpoint;
    this.getAuthHeader = getAuthHeader;
  }

  async create(document: IUploadedDocument): Promise<number> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`${this.listEndpoint}/items`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(this.toListItem(document)),
    });
    if (!res.ok) throw new Error(`RegistryClient.create failed: ${res.status}`);
    const data = await res.json();
    return data.id as number;
  }

  async findByContextId(contextId: string): Promise<IUploadedDocument | null> {
    const headers = await this.getAuthHeader();
    const filter = `${REG.RECORD_ID} eq '${contextId}'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$top=1`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.value?.length) return null;
    return this.fromListItem(data.value[0]);
  }

  async listByContextId(contextId: string): Promise<IUploadedDocument[]> {
    const headers = await this.getAuthHeader();
    const filter = `${REG.RECORD_ID} eq '${contextId}'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$orderby=${REG.UPLOADED_AT} desc`,
      { headers }
    );
    if (!res.ok) throw new Error(`RegistryClient.listByContextId failed: ${res.status}`);
    const data = await res.json();
    return (data.value as Record<string, unknown>[]).map(item => this.fromListItem(item));
  }

  async updateMigrationStatus(
    documentId: string,
    status: IUploadedDocument['migrationStatus'],
    migratedUrl?: string,
    tombstoneUrl?: string
  ): Promise<void> {
    const headers = await this.getAuthHeader();
    const itemId = await this.getListItemIdByDocumentId(documentId);
    await fetch(`${this.listEndpoint}/items(${itemId})`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', 'If-Match': '*' },
      body: JSON.stringify({
        [REG.MIGRATION_STATUS]: status,
        ...(migratedUrl && { [REG.MIGRATED_URL]: migratedUrl }),
        ...(tombstoneUrl && { [REG.TOMBSTONE_URL]: tombstoneUrl }),
      }),
    });
  }

  private async getListItemIdByDocumentId(documentId: string): Promise<number> {
    const headers = await this.getAuthHeader();
    const filter = `${REG.DOCUMENT_ID} eq '${documentId}'`;
    const res = await fetch(
      `${this.listEndpoint}/items?$filter=${encodeURIComponent(filter)}&$select=id&$top=1`,
      { headers }
    );
    const data = await res.json();
    return data.value[0].id as number;
  }

  private toListItem(doc: IUploadedDocument): Record<string, unknown> {
    return {
      [REG.MODULE_TYPE]: doc.contextType,
      [REG.RECORD_ID]: doc.contextId,
      [REG.DOCUMENT_ID]: doc.id,
      [REG.FILE_NAME]: doc.fileName,
      [REG.FOLDER_NAME]: doc.folderName,
      [REG.FILE_SIZE]: doc.fileSize,
      [REG.MIME_TYPE]: doc.mimeType,
      [REG.SHAREPOINT_URL]: doc.sharepointUrl,
      [REG.STAGING_URL]: doc.stagingUrl,
      [REG.MIGRATION_STATUS]: doc.migrationStatus,
      [REG.UPLOADED_AT]: doc.uploadedAt,
      [REG.DISPLAY_NAME]: doc.displayName,
    };
  }

  private fromListItem(item: Record<string, unknown>): IUploadedDocument {
    const fields = item['fields'] as Record<string, unknown> ?? item;
    return {
      id: fields[REG.DOCUMENT_ID] as string,
      fileName: fields[REG.FILE_NAME] as string,
      fileSize: fields[REG.FILE_SIZE] as number,
      mimeType: fields[REG.MIME_TYPE] as string ?? '',
      uploadedAt: fields[REG.UPLOADED_AT] as string,
      uploadedBy: (fields[REG.UPLOADED_BY] as { email: string })?.email ?? '',
      contextId: fields[REG.RECORD_ID] as string,
      contextType: fields[REG.MODULE_TYPE] as IUploadedDocument['contextType'],
      sharepointUrl: (fields[REG.SHAREPOINT_URL] as { Url: string })?.Url ?? '',
      stagingUrl: (fields[REG.STAGING_URL] as { Url: string })?.Url ?? '',
      migratedUrl: (fields[REG.MIGRATED_URL] as { Url: string })?.Url ?? null,
      tombstoneUrl: (fields[REG.TOMBSTONE_URL] as { Url: string })?.Url ?? null,
      migrationStatus: fields[REG.MIGRATION_STATUS] as IUploadedDocument['migrationStatus'],
      conflictResolution: null,
      folderName: fields[REG.FOLDER_NAME] as string,
      displayName: fields[REG.DISPLAY_NAME] as string,
    };
  }
}
