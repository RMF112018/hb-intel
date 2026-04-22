import { afterEach, describe, expect, it } from 'vitest';
import { downloadUploadedWorkbook } from './downloadUploadedWorkbook.js';
import type { SpHttpClient } from './spHttp.js';
import {
  configureSafetyListGuids,
  resetSafetyListGuidOverlay,
} from '../../lists/guidConfig.js';

const UPLOAD_GUID = '99999999-9999-9999-9999-999999999999';

describe('downloadUploadedWorkbook (W1 G1 replay-path reachability)', () => {
  afterEach(() => resetSafetyListGuidOverlay());

  it('reads the uploaded workbook bytes via /File/$value when GUID is configured', async () => {
    configureSafetyListGuids({ SafetyChecklistUploads: UPLOAD_GUID });
    const bytes = new Uint8Array([9, 8, 7]).buffer;
    const calls: string[] = [];
    const client: SpHttpClient = {
      get: async (url) => {
        calls.push(url);
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => bytes,
        } as unknown as Response;
      },
      post: async () => {
        throw new Error('no POST expected');
      },
    };

    const result = await downloadUploadedWorkbook(client, 42);
    expect(result.sourceUploadItemId).toBe(42);
    expect(new Uint8Array(result.bytes)).toEqual(new Uint8Array([9, 8, 7]));
    expect(calls[0]).toContain(`/sites/Safety/_api/web/lists(guid'${UPLOAD_GUID}')/items(42)/File/$value`);
  });

  it('falls back to title binding when upload-library GUID is unconfigured', async () => {
    const bytes = new Uint8Array([1, 2]).buffer;
    const calls: string[] = [];
    const client: SpHttpClient = {
      get: async (url) => {
        calls.push(url);
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => bytes,
        } as unknown as Response;
      },
      post: async () => {
        throw new Error('no POST expected');
      },
    };
    const result = await downloadUploadedWorkbook(client, 7);
    expect(result.bytes.byteLength).toBe(2);
    expect(calls[0]).toContain("getbytitle('Safety Checklist Uploads')");
  });
});
