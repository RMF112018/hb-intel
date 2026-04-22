import { describe, expect, it } from 'vitest';
import { adaptSpfxHttpClient } from '../spfxHttpAdapter.js';

interface RecordedPost {
  url: string;
  headers?: Record<string, string>;
  body?: BodyInit;
}

describe('adaptSpfxHttpClient', () => {
  it('hydrates a request digest for target web POST writes', async () => {
    const posts: RecordedPost[] = [];
    const spfxContext = {
      spHttpClient: {
        get: async () =>
          ({
            ok: true,
            status: 200,
            json: async () => ({}),
          }) as unknown as Response,
        post: async (_url: string, _config: unknown, options?: Record<string, unknown>) => {
          posts.push({
            url: _url,
            headers: options?.headers as Record<string, string> | undefined,
            body: options?.body as BodyInit | undefined,
          });
          if (_url.endsWith('/_api/contextinfo')) {
            return {
              ok: true,
              status: 200,
              json: async () => ({ FormDigestValue: 'DIGEST-123' }),
            } as unknown as Response;
          }
          return {
            ok: true,
            status: 200,
            json: async () => ({ Id: 1 }),
          } as unknown as Response;
        },
      },
    };
    const client = adaptSpfxHttpClient(spfxContext);
    expect(client).not.toBeNull();
    await client!.post(
      'https://hedrickbrotherscom.sharepoint.com/sites/Safety/_api/web/lists(guid\'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6\')/RootFolder/Files/add(url=\'x.xlsx\',overwrite=true)',
      new Uint8Array([1]).buffer,
      { headers: { Accept: 'application/json;odata=nometadata' } },
    );
    expect(posts.length).toBe(2);
    expect(posts[0]?.url).toBe('https://hedrickbrotherscom.sharepoint.com/sites/Safety/_api/contextinfo');
    expect(posts[1]?.headers?.['X-RequestDigest']).toBe('DIGEST-123');
  });
});
