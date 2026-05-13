import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  MY_WORK_READ_MODEL_MODES,
  MY_WORK_READ_MODEL_ROUTE_PATHS,
  MY_WORK_READ_MODEL_SOURCE_STATUSES,
  MY_WORK_READ_MODEL_WARNING_CODES,
  type MyWorkActorSummary,
  type MyWorkAdobeSignActionQueueHomeProjection,
  type MyWorkHomeReadModel,
  type MyWorkHomeSummary,
  type MyWorkReadModelEnvelope,
  type MyWorkReadModelResponseMap,
  type MyWorkReadModelSourceStatus,
  type MyWorkReadModelWarning,
  type MyWorkReadModelWarningCode,
  type MyWorkSourceReadinessItem,
} from './MyWorkReadModels.js';

const here = dirname(fileURLToPath(import.meta.url));
const moduleSource = readFileSync(join(here, 'MyWorkReadModels.ts'), 'utf8');
const moduleSourceCode = moduleSource.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

describe('My Work read models — mode vocabulary', () => {
  it('exposes exactly the two B04 read-model modes', () => {
    expect(MY_WORK_READ_MODEL_MODES).toEqual(['fixture', 'backend']);
    expect(MY_WORK_READ_MODEL_MODES).toHaveLength(2);
  });

  it('does not include legacy or PCC-drifted mode names', () => {
    for (const forbidden of ['mock', 'local', 'production', 'live']) {
      expect((MY_WORK_READ_MODEL_MODES as readonly string[]).includes(forbidden)).toBe(false);
    }
  });
});

describe('My Work read models — source-status vocabulary', () => {
  it('exposes exactly the seven B04 envelope source statuses in order', () => {
    expect(MY_WORK_READ_MODEL_SOURCE_STATUSES).toEqual([
      'available',
      'partial',
      'configuration-required',
      'authorization-required',
      'principal-unresolved',
      'source-unavailable',
      'backend-unavailable',
    ]);
    expect(MY_WORK_READ_MODEL_SOURCE_STATUSES).toHaveLength(7);
  });

  it('does not include PCC-style statuses absent from B04', () => {
    for (const forbidden of ['stale', 'unauthorized', 'forbidden', 'missing-config']) {
      expect((MY_WORK_READ_MODEL_SOURCE_STATUSES as readonly string[]).includes(forbidden)).toBe(
        false,
      );
    }
  });
});

describe('My Work read models — warning-code vocabulary', () => {
  it('exposes exactly the ten B04 warning codes in order', () => {
    expect(MY_WORK_READ_MODEL_WARNING_CODES).toEqual([
      'partial-source-data',
      'configuration-required',
      'authorization-required',
      'principal-unresolved',
      'source-unavailable',
      'backend-unavailable',
      'stale-cache-used',
      'result-set-truncated',
      'source-open-url-omitted',
      'unsupported-source-status-filtered',
    ]);
    expect(MY_WORK_READ_MODEL_WARNING_CODES).toHaveLength(10);
  });
});

describe('My Work read models — route registry', () => {
  it('exposes exactly the two B04 read-model route keys', () => {
    expect(Object.keys(MY_WORK_READ_MODEL_ROUTE_PATHS)).toEqual([
      'home',
      'adobe-sign-action-queue',
    ]);
  });

  it('maps each route key to its exact B04 path', () => {
    expect(MY_WORK_READ_MODEL_ROUTE_PATHS).toEqual({
      home: 'my-work/me/home',
      'adobe-sign-action-queue': 'my-work/me/adobe-sign/action-queue',
    });
  });
});

describe('My Work read models — envelope shape', () => {
  it('accepts a fully populated envelope for a home read model', () => {
    const warning: MyWorkReadModelWarning = {
      code: 'partial-source-data',
      message: 'Adobe Sign returned a partial result set.',
    };
    const projection: MyWorkAdobeSignActionQueueHomeProjection = {
      summary: {
        countBasis: 'returned-items',
        totalActionItemCount: 0,
        signatureCount: 0,
        approvalCount: 0,
        acceptanceCount: 0,
        acknowledgementCount: 0,
        formFillingCount: 0,
        delegationCount: 0,
        expiringSoonCount: 0,
      },
      previewItems: [],
      previewItemLimit: 5,
    };
    const home: MyWorkHomeReadModel = {
      actor: {
        displayName: 'Test Actor',
        principalName: 'actor@example.com',
      },
      summary: { totalActionItemCount: 0 },
      sourceReadiness: [
        {
          sourceSystem: 'adobe-sign',
          sourceStatus: 'available',
          warnings: [],
        },
      ],
      adobeSignActionQueue: projection,
    };
    const envelope: MyWorkReadModelEnvelope<MyWorkHomeReadModel> = {
      mode: 'backend',
      sourceStatus: 'partial',
      readOnly: true,
      warnings: [warning],
      generatedAtUtc: '2026-05-13T10:00:00.000Z',
      data: home,
    };
    expect(envelope.readOnly).toBe(true);
    expect(envelope.mode).toBe('backend');
    expect(envelope.sourceStatus).toBe('partial');
    expect(envelope.data.adobeSignActionQueue.previewItemLimit).toBe(5);
    expect(envelope.warnings[0]?.code).toBe('partial-source-data');
  });

  it('accepts a fixture-mode envelope with an available source status', () => {
    const envelope: MyWorkReadModelEnvelope<{ readonly placeholder: true }> = {
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      generatedAtUtc: '2026-05-13T10:00:00.000Z',
      data: { placeholder: true },
    };
    expect(envelope.mode).toBe('fixture');
    expect(envelope.warnings).toHaveLength(0);
  });

  it('accepts warnings whose codes come from the B04 vocabulary', () => {
    for (const code of MY_WORK_READ_MODEL_WARNING_CODES) {
      const typedCode: MyWorkReadModelWarningCode = code;
      const warning: MyWorkReadModelWarning = { code: typedCode };
      expect(warning.code).toBe(code);
    }
  });
});

describe('My Work read models — actor, home summary, and source readiness DTOs', () => {
  it('accepts an actor summary with required and optional fields', () => {
    const actor: MyWorkActorSummary = {
      displayName: 'Alex Operator',
      principalName: 'alex@hb.example.com',
      hbcUserId: 'hbc-user-1',
    };
    expect(actor.displayName).toBe('Alex Operator');
    expect(actor.hbcUserId).toBe('hbc-user-1');
  });

  it('accepts an actor summary without the optional hbcUserId field', () => {
    const actor: MyWorkActorSummary = {
      displayName: 'Anon',
      principalName: 'anon@hb.example.com',
    };
    expect(actor.hbcUserId).toBeUndefined();
  });

  it('accepts a home summary with the total action item count', () => {
    const summary: MyWorkHomeSummary = { totalActionItemCount: 3 };
    expect(summary.totalActionItemCount).toBe(3);
  });

  it('accepts a source-readiness item for every B04 source status', () => {
    for (const status of MY_WORK_READ_MODEL_SOURCE_STATUSES) {
      const typedStatus: MyWorkReadModelSourceStatus = status;
      const readiness: MyWorkSourceReadinessItem = {
        sourceSystem: 'adobe-sign',
        sourceStatus: typedStatus,
        warnings: [],
      };
      expect(readiness.sourceStatus).toBe(status);
    }
  });
});

describe('My Work read models — response map', () => {
  it('keys the response map by exactly the two B04 route keys', () => {
    const map: MyWorkReadModelResponseMap = {
      home: {
        mode: 'fixture',
        sourceStatus: 'available',
        readOnly: true,
        warnings: [],
        generatedAtUtc: '2026-05-13T10:00:00.000Z',
        data: {
          actor: { displayName: 'A', principalName: 'a@example.com' },
          summary: { totalActionItemCount: 0 },
          sourceReadiness: [],
          adobeSignActionQueue: {
            summary: {
              countBasis: 'returned-items',
              totalActionItemCount: 0,
              signatureCount: 0,
              approvalCount: 0,
              acceptanceCount: 0,
              acknowledgementCount: 0,
              formFillingCount: 0,
              delegationCount: 0,
              expiringSoonCount: 0,
            },
            previewItems: [],
            previewItemLimit: 5,
          },
        },
      },
      'adobe-sign-action-queue': {
        mode: 'fixture',
        sourceStatus: 'available',
        readOnly: true,
        warnings: [],
        generatedAtUtc: '2026-05-13T10:00:00.000Z',
        data: {
          moduleId: 'adobe-sign-action-queue',
          summary: {
            countBasis: 'returned-items',
            totalActionItemCount: 0,
            signatureCount: 0,
            approvalCount: 0,
            acceptanceCount: 0,
            acknowledgementCount: 0,
            formFillingCount: 0,
            delegationCount: 0,
            expiringSoonCount: 0,
          },
          items: [],
          pagination: { pageSize: 25, hasMore: false },
          freshness: {
            state: 'fresh',
            generatedAtUtc: '2026-05-13T10:00:00.000Z',
          },
        },
      },
    };
    expect(Object.keys(map)).toEqual(['home', 'adobe-sign-action-queue']);
    expect(map.home.data.adobeSignActionQueue.previewItemLimit).toBe(5);
    expect(map['adobe-sign-action-queue'].data.moduleId).toBe('adobe-sign-action-queue');
  });
});

describe('My Work read models — contract purity', () => {
  it('does not import runtime fetch, OAuth, or provider modules', () => {
    const forbidden = [
      'fetch(',
      'axios',
      'msal',
      '@pnp/',
      'pnpjs',
      'oauth',
      'AcquireToken',
      'getToken',
    ];
    for (const needle of forbidden) {
      expect(moduleSourceCode.toLowerCase()).not.toContain(needle.toLowerCase());
    }
  });

  it('does not import from app, backend, or feature-package surfaces', () => {
    const forbiddenPaths = [
      "from 'apps/",
      "from 'backend/",
      "from 'packages/features/",
      "from '@hbc/my-work-feed",
      "from '@hbc/sharepoint-docs",
      "from '@hbc/bic-next-move",
      "from '@hbc/complexity",
    ];
    for (const needle of forbiddenPaths) {
      expect(moduleSourceCode).not.toContain(needle);
    }
  });

  it('imports only type-only references from the AdobeSignActionQueue contract sibling', () => {
    expect(moduleSourceCode).toContain(
      "import type {\n  MyWorkAdobeSignActionQueueItem,\n  MyWorkAdobeSignActionQueueReadModel,\n  MyWorkAdobeSignActionQueueSummary,\n} from './AdobeSignActionQueue.js';",
    );
  });
});
