/**
 * Generic SharePoint REST helpers. Dry-run aware.
 */
import type { RunContext } from './types.js';
import { logDry } from './logging.js';

function escapeOdataString(value: string): string {
  return value.replace(/'/g, "''");
}

export function listEndpoint(listTitle: string): string {
  return `web/lists/getbytitle('${encodeURIComponent(escapeOdataString(listTitle))}')`;
}

interface SpRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'MERGE';
  body?: unknown;
  headers?: Record<string, string>;
  accept?: string;
}

export async function spFetch<T = unknown>(
  ctx: RunContext,
  path: string,
  opts: SpRequestOptions = {},
): Promise<T> {
  const url = path.startsWith('http') ? path : `${ctx.config.siteUrl}/_api/${path.replace(/^\/+/, '')}`;
  const token = await ctx.getToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: opts.accept ?? 'application/json;odata=nometadata',
    ...(opts.body ? { 'Content-Type': 'application/json;odata=nometadata' } : {}),
    ...opts.headers,
  };
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${opts.method ?? 'GET'} ${url} → ${res.status} ${res.statusText}\n${text.slice(0, 1500)}`);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('json')) return undefined as T;
  return (await res.json()) as T;
}

export async function ensureCurrentUserId(ctx: RunContext): Promise<number> {
  if (ctx.currentUserId !== undefined) return ctx.currentUserId;
  const resp = await spFetch<{ Id: number }>(ctx, 'web/currentuser');
  ctx.currentUserId = resp.Id;
  return resp.Id;
}

export async function spCreateItem(
  ctx: RunContext,
  listTitle: string,
  body: Record<string, unknown>,
): Promise<{ Id: number } & Record<string, unknown>> {
  const endpoint = `${listEndpoint(listTitle)}/items`;
  if (ctx.dryRun) {
    const fakeId = Math.floor(Math.random() * 1_000_000) + 1;
    logDry(ctx, `POST ${endpoint}`, body);
    return { Id: fakeId, ...body } as { Id: number } & Record<string, unknown>;
  }
  return spFetch<{ Id: number } & Record<string, unknown>>(ctx, endpoint, { method: 'POST', body });
}

export async function spPatchItem(
  ctx: RunContext,
  listTitle: string,
  itemId: number,
  body: Record<string, unknown>,
): Promise<void> {
  const endpoint = `${listEndpoint(listTitle)}/items(${itemId})`;
  if (ctx.dryRun) { logDry(ctx, `PATCH ${endpoint}`, body); return; }
  await spFetch(ctx, endpoint, { method: 'PATCH', body, headers: { 'If-Match': '*', 'X-HTTP-Method': 'MERGE' } });
}

export async function spGetItem<T = Record<string, unknown>>(
  ctx: RunContext,
  listTitle: string,
  itemId: number,
  selectFields: string[] = [],
): Promise<T> {
  const sel = selectFields.length ? `?$select=${selectFields.join(',')}` : '';
  const endpoint = `${listEndpoint(listTitle)}/items(${itemId})${sel}`;
  if (ctx.dryRun) { logDry(ctx, `GET ${endpoint}`); return { Id: itemId, __dryRun: true } as unknown as T; }
  return spFetch<T>(ctx, endpoint);
}

export async function spQueryItems<T = { Id: number } & Record<string, unknown>>(
  ctx: RunContext,
  listTitle: string,
  filter: string,
  selectFields: string[] = ['Id'],
  top = 500,
): Promise<T[]> {
  const sel = `?$select=${selectFields.join(',')}&$filter=${encodeURIComponent(filter)}&$top=${top}`;
  const endpoint = `${listEndpoint(listTitle)}/items${sel}`;
  if (ctx.dryRun) { logDry(ctx, `GET ${endpoint}`); return []; }
  const resp = await spFetch<{ value: T[] }>(ctx, endpoint);
  return resp.value ?? [];
}

export async function spDeleteItem(
  ctx: RunContext,
  listTitle: string,
  itemId: number,
): Promise<void> {
  const endpoint = `${listEndpoint(listTitle)}/items(${itemId})`;
  if (ctx.dryRun) { logDry(ctx, `DELETE ${endpoint}`); return; }
  await spFetch(ctx, endpoint, { method: 'DELETE', headers: { 'If-Match': '*' } });
}
