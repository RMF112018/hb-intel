// SharePoint REST field-creation helper.
//
// Two-call documented contract per
//   https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest
// and the Fields REST reference. Resolves the list GUID, POSTs `SP.Field`
// with Title = internalName so SharePoint derives the desired InternalName,
// then MERGE-renames Title to the display name. App-only OAuth bearer auth;
// no X-RequestDigest required.
//
// Replaces the prior `/fields/add` + `SP.FieldCreationInformation` pattern,
// which is not a SharePoint REST v1 endpoint and failed live with HTTP 404.

import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';

export function fieldTypeKindFor(type: IFieldDefinition['type']): number {
  if (type === 'Text') return 2;
  if (type === 'MultiLineText') return 3;
  throw new Error(
    `sharepoint-field-rest-contract: unsupported IFieldDefinition.type='${type as string}'. ` +
      `Extend fieldTypeKindFor before adding such fields to the descriptor.`,
  );
}

export interface IListIdRequest {
  readonly url: string;
  readonly init: RequestInit;
}

export function buildListIdRequest(
  siteUrl: string,
  listTitle: string,
  token: string,
): IListIdRequest {
  const url =
    `${siteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(listTitle)}')` + `?$select=Id`;
  return {
    url,
    init: {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json;odata=nometadata',
      },
    },
  };
}

export interface IFieldCreateRequest {
  readonly url: string;
  readonly body: string;
}

export function buildFieldCreateRequest(
  siteUrl: string,
  listGuid: string,
  field: IFieldDefinition,
): IFieldCreateRequest {
  const url = `${siteUrl}/_api/web/lists(guid'${listGuid}')/Fields`;
  const body = JSON.stringify({
    __metadata: { type: 'SP.Field' },
    Title: field.internalName,
    FieldTypeKind: fieldTypeKindFor(field.type),
    Required: field.required ?? false,
    StaticName: field.internalName,
  });
  return { url, body };
}

export interface IFieldRenameRequest {
  readonly url: string;
  readonly body: string;
  readonly headers: Record<string, string>;
}

export function buildFieldRenameRequest(
  siteUrl: string,
  listGuid: string,
  fieldGuid: string,
  displayName: string,
  token: string,
): IFieldRenameRequest {
  const url = `${siteUrl}/_api/web/lists(guid'${listGuid}')/Fields(guid'${fieldGuid}')`;
  const body = JSON.stringify({
    __metadata: { type: 'SP.Field' },
    Title: displayName,
  });
  return {
    url,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=verbose',
      'X-HTTP-Method': 'MERGE',
      'IF-MATCH': '*',
    },
  };
}

export interface IRestFieldDeps {
  readonly fetchImpl: typeof fetch;
  readonly tokenResolver: () => Promise<string>;
  readonly errorPrefix: string;
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.length > 400 ? `${text.slice(0, 400)}…` : text;
  } catch {
    return '<no body>';
  }
}

export async function resolveListId(
  deps: IRestFieldDeps,
  siteUrl: string,
  listTitle: string,
): Promise<string> {
  const token = await deps.tokenResolver();
  const { url, init } = buildListIdRequest(siteUrl, listTitle, token);
  const response = await deps.fetchImpl(url, init);
  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new Error(
      `${deps.errorPrefix}: list id lookup failed for '${listTitle}' — HTTP ${response.status}: ${body}`,
    );
  }
  const payload = (await response.json()) as { Id?: unknown };
  if (typeof payload.Id !== 'string' || payload.Id.length === 0) {
    throw new Error(
      `${deps.errorPrefix}: list id lookup for '${listTitle}' returned no Id in response payload.`,
    );
  }
  return payload.Id;
}

export interface ICreateFieldResult {
  readonly fieldGuid: string;
}

export async function createFieldViaRest(
  deps: IRestFieldDeps,
  siteUrl: string,
  listGuid: string,
  listTitle: string,
  field: IFieldDefinition,
): Promise<ICreateFieldResult> {
  const createToken = await deps.tokenResolver();
  const create = buildFieldCreateRequest(siteUrl, listGuid, field);
  const createResponse = await deps.fetchImpl(create.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${createToken}`,
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=verbose',
    },
    body: create.body,
  });
  if (!createResponse.ok) {
    const errBody = await readErrorBody(createResponse);
    throw new Error(
      `${deps.errorPrefix}: field create failed for '${listTitle}'.'${field.internalName}' — HTTP ${createResponse.status}: ${errBody}`,
    );
  }
  const createPayload = (await createResponse.json()) as { Id?: unknown };
  if (typeof createPayload.Id !== 'string' || createPayload.Id.length === 0) {
    throw new Error(
      `${deps.errorPrefix}: field create for '${listTitle}'.'${field.internalName}' returned no Id in response payload.`,
    );
  }
  const fieldGuid = createPayload.Id;

  const renameToken = await deps.tokenResolver();
  const rename = buildFieldRenameRequest(
    siteUrl,
    listGuid,
    fieldGuid,
    field.displayName,
    renameToken,
  );
  const renameResponse = await deps.fetchImpl(rename.url, {
    method: 'POST',
    headers: rename.headers,
    body: rename.body,
  });
  if (!renameResponse.ok) {
    const errBody = await readErrorBody(renameResponse);
    throw new Error(
      `${deps.errorPrefix}: field rename failed for '${listTitle}'.'${field.internalName}' (display name to '${field.displayName}') — HTTP ${renameResponse.status}: ${errBody}`,
    );
  }
  return { fieldGuid };
}
