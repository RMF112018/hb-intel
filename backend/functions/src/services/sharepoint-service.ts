export interface ISharePointService {
  createSite(projectCode: string, projectName: string, templateId?: string): Promise<string>;
  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<string>;
  uploadTemplateFiles(siteUrl: string, libraryName: string, templateId?: string): Promise<number>;
  createDataLists(siteUrl: string, listDefinitions: string[]): Promise<{ created: number; total: number }>;
  applyWebParts(siteUrl: string): Promise<void>;
  setPermissions(siteUrl: string, projectCode: string): Promise<void>;
  associateHub(siteUrl: string, hubSiteUrl: string): Promise<void>;
  deleteSite(siteUrl: string): Promise<void>;
  removeHubAssociation(siteUrl: string): Promise<void>;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class MockSharePointService implements ISharePointService {
  async createSite(projectCode: string, projectName: string, _templateId?: string): Promise<string> {
    await delay(100);
    const siteUrl = `https://contoso.sharepoint.com/sites/${projectCode}`;
    console.log(`[MockSP] Created site: ${siteUrl} for "${projectName}"`);
    return siteUrl;
  }

  async createDocumentLibrary(siteUrl: string, libraryName: string): Promise<string> {
    await delay(80);
    const libraryId = `lib-${Date.now()}`;
    console.log(`[MockSP] Created document library "${libraryName}" at ${siteUrl} (${libraryId})`);
    return libraryId;
  }

  async uploadTemplateFiles(siteUrl: string, libraryName: string, _templateId?: string): Promise<number> {
    await delay(120);
    const fileCount = 5;
    console.log(`[MockSP] Uploaded ${fileCount} template files to ${siteUrl}/${libraryName}`);
    return fileCount;
  }

  async createDataLists(siteUrl: string, listDefinitions: string[]): Promise<{ created: number; total: number }> {
    const total = listDefinitions.length;
    for (let i = 0; i < total; i++) {
      await delay(50);
      console.log(`[MockSP] Created list "${listDefinitions[i]}" at ${siteUrl} (${i + 1}/${total})`);
    }
    return { created: total, total };
  }

  async applyWebParts(siteUrl: string): Promise<void> {
    await delay(200);
    console.log(`[MockSP] Applied web parts to ${siteUrl}`);
  }

  async setPermissions(siteUrl: string, projectCode: string): Promise<void> {
    await delay(80);
    console.log(`[MockSP] Set permissions for ${projectCode} at ${siteUrl}`);
  }

  async associateHub(siteUrl: string, hubSiteUrl: string): Promise<void> {
    await delay(60);
    console.log(`[MockSP] Associated ${siteUrl} with hub ${hubSiteUrl}`);
  }

  async deleteSite(siteUrl: string): Promise<void> {
    await delay(100);
    console.log(`[MockSP] Deleted site: ${siteUrl}`);
  }

  async removeHubAssociation(siteUrl: string): Promise<void> {
    await delay(40);
    console.log(`[MockSP] Removed hub association for ${siteUrl}`);
  }
}
