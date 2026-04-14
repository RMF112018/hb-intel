/**
 * Non-destructive child-write proof for the publisher.
 *
 * The team-member and media writers replaced the previous
 * delete-all → recreate-all sequence with a keyed-sync strategy:
 *   1. Fetch existing rows by `ArticleId`, including the child key.
 *   2. MERGE on key match; POST otherwise.
 *   3. Delete only the rows whose key is NOT in the incoming set,
 *      and only AFTER every write succeeds.
 *
 * The tests below pin that contract and prove a mid-write failure
 * leaves the prior tenant rows intact (no silent zero-row state).
 */
import { describe, expect, it, vi } from 'vitest';
import {
  createSharePointMediaWriter,
  createSharePointTeamMembersWriter,
} from './publisherWriters';
import type {
  PublisherMediaRow,
  PublisherTeamMemberRow,
} from './publisherContracts';

interface RecordedRequest {
  readonly url: string;
  readonly method: string;
  readonly httpMethodHeader?: string;
  readonly body?: unknown;
}

function makeFetch(handler: (req: { url: string; init: RequestInit }) => Promise<Response>) {
  const calls: RecordedRequest[] = [];
  const impl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const i = init ?? {};
    const headers = (i.headers as Record<string, string>) ?? {};
    calls.push({
      url,
      method: i.method ?? 'GET',
      httpMethodHeader: headers['X-HTTP-Method'],
      body:
        typeof i.body === 'string' && i.body.length > 0
          ? JSON.parse(i.body)
          : undefined,
    });
    return handler({ url, init: i });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

function ok(payload: unknown = {}): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fail(status = 500): Response {
  return new Response('boom', { status });
}

const HOST = 'https://example.com/sites/HBCentral';

const ARTICLE_ID = 'art-001';

function teamRow(id: string): PublisherTeamMemberRow {
  return {
    ArticleId: ARTICLE_ID,
    TeamMemberId: id,
    Title: id,
    PersonPrincipal: `${id}@example.com`,
    DisplayName: id,
  };
}

function mediaRow(id: string): PublisherMediaRow {
  return {
    ArticleId: ARTICLE_ID,
    MediaId: id,
    Title: id,
    MediaRole: 'gallery',
    ImageAsset: `https://img.example/${id}.jpg`,
    AltText: `${id} alt`,
  };
}

describe('createSharePointTeamMembersWriter — keyed-sync semantics', () => {
  it('MERGEs existing rows by TeamMemberId, POSTs new rows, and deletes only orphans', async () => {
    const { impl, calls } = makeFetch(async ({ url, init }) => {
      // GET existing items.
      if (init.method === 'GET' && url.includes('/items?')) {
        return ok({
          value: [
            { Id: 11, TeamMemberId: 'tm-keep' },
            { Id: 12, TeamMemberId: 'tm-update' },
            { Id: 13, TeamMemberId: 'tm-orphan' },
          ],
        });
      }
      // POSTs (POST = create; POST + X-HTTP-Method MERGE = update;
      // POST + X-HTTP-Method DELETE = delete).
      if (init.method === 'POST') {
        const headers = (init.headers as Record<string, string>) ?? {};
        const httpVerb = headers['X-HTTP-Method'];
        if (httpVerb === 'DELETE') return ok({});
        if (httpVerb === 'MERGE') return ok({});
        // Plain POST = new item create.
        return ok({ Id: 99 });
      }
      return ok({});
    });
    const writer = createSharePointTeamMembersWriter({
      descriptor: {
        key: 'teamMembers',
        displayName: 'HB Article Team Members',
        hostSiteUrl: HOST as never,
        mvpFields: [],
      },
      fetchImpl: impl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest'),
    });
    const result = await writer.replaceAllForArticle(ARTICLE_ID, [
      teamRow('tm-keep'),
      teamRow('tm-update'),
      teamRow('tm-new'),
    ]);
    expect(result).toEqual({ created: 1, updated: 2, deleted: 1, written: 3 });

    // Verb breakdown — proves no delete-all and the deletion runs
    // last (after the writes).
    const verbs = calls.map((c) =>
      c.method === 'GET' ? 'GET' : c.httpMethodHeader ?? 'POST',
    );
    const writeIdx = verbs.findIndex((v) => v === 'MERGE' || v === 'POST');
    const deleteIdx = verbs.indexOf('DELETE');
    expect(writeIdx).toBeGreaterThan(-1);
    expect(deleteIdx).toBeGreaterThan(writeIdx);
    expect(verbs.filter((v) => v === 'DELETE')).toHaveLength(1);
    expect(verbs.filter((v) => v === 'MERGE')).toHaveLength(2);
    expect(verbs.filter((v) => v === 'POST')).toHaveLength(1);
  });

  it('throws and performs ZERO deletes when a MERGE fails mid-write — prior rows stay intact', async () => {
    let mergeCount = 0;
    const { impl, calls } = makeFetch(async ({ url, init }) => {
      if (init.method === 'GET' && url.includes('/items?')) {
        return ok({
          value: [
            { Id: 21, TeamMemberId: 'tm-a' },
            { Id: 22, TeamMemberId: 'tm-b' },
            { Id: 23, TeamMemberId: 'tm-orphan' },
          ],
        });
      }
      if (init.method === 'POST') {
        const headers = (init.headers as Record<string, string>) ?? {};
        const httpVerb = headers['X-HTTP-Method'];
        if (httpVerb === 'MERGE') {
          mergeCount += 1;
          // Second MERGE blows up.
          return mergeCount === 2 ? fail(500) : ok({});
        }
        return ok({});
      }
      return ok({});
    });
    const writer = createSharePointTeamMembersWriter({
      descriptor: {
        key: 'teamMembers',
        displayName: 'HB Article Team Members',
        hostSiteUrl: HOST as never,
        mvpFields: [],
      },
      fetchImpl: impl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest'),
    });
    await expect(
      writer.replaceAllForArticle(ARTICLE_ID, [teamRow('tm-a'), teamRow('tm-b')]),
    ).rejects.toThrow(/MERGE failed/);
    // Critical: NO DELETE call was issued. The orphan row is still
    // on the server; the article never enters a zero-rows state.
    const deleteCalls = calls.filter(
      (c) => c.method === 'POST' && c.httpMethodHeader === 'DELETE',
    );
    expect(deleteCalls).toHaveLength(0);
  });
});

describe('createSharePointMediaWriter — keyed-sync semantics', () => {
  it('MERGEs by MediaId, POSTs new media, and deletes only orphans after writes succeed', async () => {
    const { impl, calls } = makeFetch(async ({ url, init }) => {
      if (init.method === 'GET' && url.includes('/items?')) {
        return ok({
          value: [
            { Id: 31, MediaId: 'm-1' },
            { Id: 32, MediaId: 'm-orphan' },
          ],
        });
      }
      if (init.method === 'POST') {
        const headers = (init.headers as Record<string, string>) ?? {};
        const httpVerb = headers['X-HTTP-Method'];
        if (httpVerb === 'DELETE') return ok({});
        if (httpVerb === 'MERGE') return ok({});
        return ok({ Id: 50 });
      }
      return ok({});
    });
    const writer = createSharePointMediaWriter({
      descriptor: {
        key: 'media',
        displayName: 'HB Article Media',
        hostSiteUrl: HOST as never,
        mvpFields: [],
      },
      fetchImpl: impl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest'),
    });
    const result = await writer.replaceAllForArticle(ARTICLE_ID, [
      mediaRow('m-1'),
      mediaRow('m-2'),
    ]);
    expect(result).toEqual({ created: 1, updated: 1, deleted: 1, written: 2 });

    const verbs = calls.map((c) =>
      c.method === 'GET' ? 'GET' : c.httpMethodHeader ?? 'POST',
    );
    const lastWriteIdx = Math.max(
      verbs.lastIndexOf('MERGE'),
      verbs.lastIndexOf('POST'),
    );
    const deleteIdx = verbs.indexOf('DELETE');
    expect(deleteIdx).toBeGreaterThan(lastWriteIdx);
  });

  it('throws and performs ZERO deletes when a POST for a new media row fails', async () => {
    const { impl, calls } = makeFetch(async ({ url, init }) => {
      if (init.method === 'GET' && url.includes('/items?')) {
        return ok({
          value: [
            { Id: 41, MediaId: 'm-existing' },
            { Id: 42, MediaId: 'm-other' },
          ],
        });
      }
      if (init.method === 'POST') {
        const headers = (init.headers as Record<string, string>) ?? {};
        const httpVerb = headers['X-HTTP-Method'];
        if (httpVerb === 'MERGE') return ok({});
        if (httpVerb === 'DELETE') return ok({});
        // Plain POST (new row) fails.
        return fail(500);
      }
      return ok({});
    });
    const writer = createSharePointMediaWriter({
      descriptor: {
        key: 'media',
        displayName: 'HB Article Media',
        hostSiteUrl: HOST as never,
        mvpFields: [],
      },
      fetchImpl: impl,
      fetchRequestDigestImpl: vi.fn(async () => 'digest'),
    });
    await expect(
      writer.replaceAllForArticle(ARTICLE_ID, [
        mediaRow('m-existing'),
        mediaRow('m-new'),
      ]),
    ).rejects.toThrow(/POST failed/);
    const deleteCalls = calls.filter(
      (c) => c.method === 'POST' && c.httpMethodHeader === 'DELETE',
    );
    expect(deleteCalls).toHaveLength(0);
  });
});
