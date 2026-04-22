import { describe, expect, it } from 'vitest';
import { uploadToSafetyChecklistUploads } from './uploadToSafetyChecklistUploads.js';
import type { SpHttpClient } from './spHttp.js';

describe('uploadToSafetyChecklistUploads (W1 G1 write-seam reachability)', () => {
  it('POSTs to /sites/Safety/_api and returns ItemId + checksum', async () => {
    const calls: Array<{ method: string; url: string; body: unknown }> = [];
    const client: SpHttpClient = {
      get: async (url) => {
        calls.push({ method: 'GET', url, body: undefined });
        return {
          ok: true,
          status: 200,
          json: async () => ({ Id: 99 }),
          text: async () => '',
        } as unknown as Response;
      },
      post: async (url, body) => {
        calls.push({ method: 'POST', url, body });
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ServerRelativeUrl: '/sites/Safety/SafetyChecklistUploads/weekly.xlsx',
            ListItemAllFields: { Id: 88 },
          }),
          text: async () => '',
        } as unknown as Response;
      },
    };

    const bytes = new Uint8Array([1, 2, 3, 4, 5]).buffer;
    const result = await uploadToSafetyChecklistUploads(client, bytes, {
      fileName: 'weekly.xlsx',
    });

    expect(result.sourceUploadItemId).toBe(88);
    expect(result.sourceUploadWebUrl).toContain('/sites/Safety');
    expect(result.checksum).toMatch(/^[0-9a-f]{64}$/);

    const uploadPost = calls.find((c) => c.method === 'POST');
    expect(uploadPost?.url).toContain('/sites/Safety/_api/web/getFolderByServerRelativeUrl');
    expect(uploadPost?.url).toContain('Files/add');
    expect(uploadPost?.url).toContain("url='weekly.xlsx'");
  });
});
