import { describe, expect, it, vi } from 'vitest';
import type { IFieldDefinition } from '../backend/functions/src/services/sharepoint-service.js';
import {
  buildFieldCreateRequest,
  buildFieldRenameRequest,
  buildListIdRequest,
  createFieldViaRest,
  fieldTypeKindFor,
  resolveListId,
} from './sharepoint-field-rest-contract';

const SITE = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';
const TOKEN = 'fake.token';
const LIST_GUID = '11111111-1111-1111-1111-111111111111';
const FIELD_GUID = '22222222-2222-2222-2222-222222222222';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function textResponse(text: string, status: number): Response {
  return new Response(text, { status, headers: { 'Content-Type': 'text/plain' } });
}

describe('fieldTypeKindFor', () => {
  it('maps Text to 2 and MultiLineText to 3', () => {
    expect(fieldTypeKindFor('Text')).toBe(2);
    expect(fieldTypeKindFor('MultiLineText')).toBe(3);
  });

  it('throws for unsupported types', () => {
    expect(() => fieldTypeKindFor('Bogus' as IFieldDefinition['type'])).toThrow(
      /unsupported IFieldDefinition\.type/,
    );
  });
});

describe('buildListIdRequest', () => {
  it('GETs the title-addressed list with $select=Id and the bearer token', () => {
    const { url, init } = buildListIdRequest(SITE, 'Projects', TOKEN);
    expect(url).toBe(`${SITE}/_api/web/lists/getByTitle('Projects')?$select=Id`);
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
    expect((init.headers as Record<string, string>).Accept).toBe(
      'application/json;odata=nometadata',
    );
  });

  it('URI-encodes list titles containing spaces', () => {
    const { url } = buildListIdRequest(SITE, 'Legacy Project Fallback Registry', TOKEN);
    expect(url).toContain("getByTitle('Legacy%20Project%20Fallback%20Registry')");
  });
});

describe('buildFieldCreateRequest', () => {
  it('targets the GUID-addressed /Fields collection with a flat SP.Field body', () => {
    const { url, body } = buildFieldCreateRequest(SITE, LIST_GUID, {
      internalName: 'leadEstimatorUpns',
      displayName: 'Lead Estimator Upns',
      type: 'MultiLineText',
    });
    expect(url).toBe(`${SITE}/_api/web/lists(guid'${LIST_GUID}')/Fields`);
    expect(JSON.parse(body)).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'leadEstimatorUpns',
      FieldTypeKind: 3,
      Required: false,
      StaticName: 'leadEstimatorUpns',
    });
  });

  it('emits FieldTypeKind 2 for Text and keeps StaticName = internalName', () => {
    const { body } = buildFieldCreateRequest(SITE, LIST_GUID, {
      internalName: 'procoreProject',
      displayName: 'Procore Project',
      type: 'Text',
    });
    expect(JSON.parse(body)).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'procoreProject',
      FieldTypeKind: 2,
      Required: false,
      StaticName: 'procoreProject',
    });
  });

  it('honors required:true on the body', () => {
    const { body } = buildFieldCreateRequest(SITE, LIST_GUID, {
      internalName: 'mandatory',
      displayName: 'Mandatory',
      type: 'Text',
      required: true,
    });
    expect(JSON.parse(body).Required).toBe(true);
  });

  it('never emits the malformed /fields/add path, SP.FieldCreationInformation, or parameters wrapper', () => {
    const { url, body } = buildFieldCreateRequest(SITE, LIST_GUID, {
      internalName: 'leadEstimatorUpns',
      displayName: 'Lead Estimator Upns',
      type: 'MultiLineText',
    });
    expect(url).not.toMatch(/\/fields\/add($|\?)/i);
    expect(body).not.toContain('SP.FieldCreationInformation');
    expect(body).not.toMatch(/"parameters"\s*:\s*\{/);
    expect(body).not.toContain('InternalName');
  });
});

describe('buildFieldRenameRequest', () => {
  it('returns a GUID-addressed Fields(guid) URL, MERGE headers, and a Title-only body', () => {
    const { url, body, headers } = buildFieldRenameRequest(
      SITE,
      LIST_GUID,
      FIELD_GUID,
      'Lead Estimator Upns',
      TOKEN,
    );
    expect(url).toBe(`${SITE}/_api/web/lists(guid'${LIST_GUID}')/Fields(guid'${FIELD_GUID}')`);
    expect(JSON.parse(body)).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'Lead Estimator Upns',
    });
    expect(headers.Authorization).toBe(`Bearer ${TOKEN}`);
    expect(headers['X-HTTP-Method']).toBe('MERGE');
    expect(headers['IF-MATCH']).toBe('*');
    expect(headers['Content-Type']).toBe('application/json;odata=verbose');
  });
});

describe('resolveListId', () => {
  function makeDeps(fetchImpl: typeof fetch) {
    return {
      fetchImpl,
      tokenResolver: vi.fn(async () => TOKEN),
      errorPrefix: 'test',
    };
  }

  it('returns the list Id from a 200 payload', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ Id: LIST_GUID })) as unknown as typeof fetch;
    const result = await resolveListId(makeDeps(fetchImpl), SITE, 'Projects');
    expect(result).toBe(LIST_GUID);
  });

  it('throws on non-OK with HTTP code in the message', async () => {
    const fetchImpl = vi.fn(async () => textResponse('Forbidden', 403)) as unknown as typeof fetch;
    await expect(resolveListId(makeDeps(fetchImpl), SITE, 'Projects')).rejects.toThrow(/HTTP 403/);
  });

  it('throws when the response payload omits Id', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({})) as unknown as typeof fetch;
    await expect(resolveListId(makeDeps(fetchImpl), SITE, 'Projects')).rejects.toThrow(
      /returned no Id/,
    );
  });
});

describe('createFieldViaRest', () => {
  function makeDeps(fetchImpl: typeof fetch) {
    return {
      fetchImpl,
      tokenResolver: vi.fn(async () => TOKEN),
      errorPrefix: 'test',
    };
  }

  it('POSTs SP.Field create then MERGE-renames Title to displayName', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: FIELD_GUID }, 201))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await createFieldViaRest(makeDeps(fetchImpl), SITE, LIST_GUID, 'Projects', {
      internalName: 'leadEstimatorUpns',
      displayName: 'Lead Estimator Upns',
      type: 'MultiLineText',
    });
    expect(result.fieldGuid).toBe(FIELD_GUID);

    const [createUrl, createInit] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(createUrl).toBe(`${SITE}/_api/web/lists(guid'${LIST_GUID}')/Fields`);
    expect(createInit.method).toBe('POST');
    const createBody = JSON.parse(String(createInit.body));
    expect(createBody).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'leadEstimatorUpns',
      FieldTypeKind: 3,
      Required: false,
      StaticName: 'leadEstimatorUpns',
    });

    const [renameUrl, renameInit] = fetchImpl.mock.calls[1] as [string, RequestInit];
    expect(renameUrl).toBe(
      `${SITE}/_api/web/lists(guid'${LIST_GUID}')/Fields(guid'${FIELD_GUID}')`,
    );
    expect((renameInit.headers as Record<string, string>)['X-HTTP-Method']).toBe('MERGE');
    expect((renameInit.headers as Record<string, string>)['IF-MATCH']).toBe('*');
    const renameBody = JSON.parse(String(renameInit.body));
    expect(renameBody).toEqual({
      __metadata: { type: 'SP.Field' },
      Title: 'Lead Estimator Upns',
    });

    const allUrls = fetchImpl.mock.calls.map((c) => c[0] as string).join('\n');
    const allBodies = fetchImpl.mock.calls
      .map((c) => String((c[1] as RequestInit).body ?? ''))
      .join('\n');
    expect(allUrls).not.toMatch(/\/fields\/add($|\?)/i);
    expect(allBodies).not.toContain('SP.FieldCreationInformation');
    expect(allBodies).not.toMatch(/"parameters"\s*:\s*\{/);
  });

  it('throws with stage=create wording when the POST returns non-OK', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(textResponse('column already exists', 400));
    await expect(
      createFieldViaRest(makeDeps(fetchImpl), SITE, LIST_GUID, 'Projects', {
        internalName: 'leadEstimatorUpns',
        displayName: 'Lead Estimator Upns',
        type: 'MultiLineText',
      }),
    ).rejects.toThrow(/field create failed.*HTTP 400/);
  });

  it('throws with stage=rename wording when the MERGE returns non-OK', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ Id: FIELD_GUID }, 201))
      .mockResolvedValueOnce(textResponse('conflict', 409));
    await expect(
      createFieldViaRest(makeDeps(fetchImpl), SITE, LIST_GUID, 'Projects', {
        internalName: 'leadEstimatorUpns',
        displayName: 'Lead Estimator Upns',
        type: 'MultiLineText',
      }),
    ).rejects.toThrow(/field rename failed.*HTTP 409/);
  });

  it('throws when the create response omits the new field Id', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(jsonResponse({}, 201));
    await expect(
      createFieldViaRest(makeDeps(fetchImpl), SITE, LIST_GUID, 'Projects', {
        internalName: 'leadEstimatorUpns',
        displayName: 'Lead Estimator Upns',
        type: 'MultiLineText',
      }),
    ).rejects.toThrow(/returned no Id/);
  });
});
