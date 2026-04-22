import { describe, expect, it } from 'vitest';
import {
  SafetyUploadError,
  uploadToSafetyChecklistUploads,
} from './uploadToSafetyChecklistUploads.js';
import type { SpHttpClient } from './spHttp.js';
import { configureSafetyListGuids, resetSafetyListGuidOverlay } from '../../lists/guidConfig.js';

describe('uploadToSafetyChecklistUploads (W1 G1 write-seam reachability)', () => {
  it('POSTs to /sites/Safety/_api and returns ItemId + checksum', async () => {
    resetSafetyListGuidOverlay();
    configureSafetyListGuids({
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
    });
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
    expect(uploadPost?.url).toContain("/sites/Safety/_api/web/lists(guid'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6')/RootFolder/Files/add");
    expect(uploadPost?.url).toContain("url='weekly.xlsx'");
  });

  it('classifies 403 upload failure as permission denied', async () => {
    resetSafetyListGuidOverlay();
    configureSafetyListGuids({
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
    });
    const client: SpHttpClient = {
      get: async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({}),
          text: async () => '',
        }) as unknown as Response,
      post: async () =>
        ({
          ok: false,
          status: 403,
          json: async () => ({}),
          text: async () => 'access denied',
        }) as unknown as Response,
    };
    let caught: unknown;
    try {
      await uploadToSafetyChecklistUploads(client, new Uint8Array([1]).buffer, { fileName: 'x.xlsx' });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SafetyUploadError);
    const uploadError = caught as SafetyUploadError;
    expect(uploadError.kind).toBe('permission');
    expect(uploadError.stage).toBe('upload-post');
    expect(uploadError.status).toBe(403);
  });

  it('classifies metadata lookup failure after successful upload', async () => {
    resetSafetyListGuidOverlay();
    configureSafetyListGuids({
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
    });
    const client: SpHttpClient = {
      get: async () =>
        ({
          ok: false,
          status: 500,
          json: async () => ({}),
          text: async () => '',
        }) as unknown as Response,
      post: async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({ ServerRelativeUrl: '/sites/Safety/Safety%20Checklist%20Uploads/x.xlsx' }),
          text: async () => '',
        }) as unknown as Response,
    };
    let caught: unknown;
    try {
      await uploadToSafetyChecklistUploads(client, new Uint8Array([1]).buffer, { fileName: 'x.xlsx' });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(SafetyUploadError);
    const uploadError = caught as SafetyUploadError;
    expect(uploadError.kind).toBe('metadata-lookup');
    expect(uploadError.stage).toBe('list-item-lookup');
    expect(uploadError.status).toBe(500);
  });
});
