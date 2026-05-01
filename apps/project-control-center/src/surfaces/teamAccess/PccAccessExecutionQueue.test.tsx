import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE,
  type ITeamAccessRequestPreview,
} from '@hbc/models/pcc';
import {
  EXECUTION_QUEUE_SECTION_IDS,
  EXECUTION_QUEUE_SECTION_LABELS,
  EXECUTION_QUEUE_SECTION_TONES,
  PccAccessExecutionQueue,
} from './PccAccessExecutionQueue';

const QUEUE_FILE = resolve(__dirname, 'PccAccessExecutionQueue.tsx');

const records = SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.requestPreviewRecords;
const approvedPendingRecord = records.find(
  (record) => record.requestStatus === 'approved-pending-execution',
) as ITeamAccessRequestPreview;

describe('PccAccessExecutionQueue — section structure', () => {
  afterEach(() => {
    cleanup();
  });

  it.each(EXECUTION_QUEUE_SECTION_IDS)(
    'renders section %s with canonical visible label and tone attribute',
    (sectionId) => {
      const { container } = render(
        <PccAccessExecutionQueue records={records} laneExecutionStatus="backend-gated-later" />,
      );
      const section = container.querySelector(
        `[data-pcc-execution-queue-section="${sectionId}"]`,
      );
      expect(section).not.toBeNull();
      const expectedTone = EXECUTION_QUEUE_SECTION_TONES[sectionId];
      expect(section?.getAttribute('data-pcc-execution-queue-section-tone')).toBe(expectedTone);
      const expectedLabel = EXECUTION_QUEUE_SECTION_LABELS[sectionId];
      expect(section?.textContent).toContain(expectedLabel);
      expect(
        section?.querySelector(`[data-pcc-execution-queue-section-label="${expectedLabel}"]`),
      ).not.toBeNull();
    },
  );

  it('renders sections in canonical order', () => {
    const { container } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="backend-gated-later" />,
    );
    const sections = Array.from(
      container.querySelectorAll('[data-pcc-execution-queue-section]'),
    );
    const ids = sections.map((node) =>
      node.getAttribute('data-pcc-execution-queue-section'),
    );
    expect(ids).toEqual([...EXECUTION_QUEUE_SECTION_IDS]);
  });
});

describe('PccAccessExecutionQueue — pending-manual-it derivation', () => {
  afterEach(() => {
    cleanup();
  });

  it('lists approved-pending-execution records with canonical helper copy', () => {
    const { container } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="backend-gated-later" />,
    );
    const section = container.querySelector(
      '[data-pcc-execution-queue-section="pending-manual-it"]',
    );
    expect(section).not.toBeNull();
    const list = section?.querySelector(
      '[data-pcc-execution-queue-section-list="pending-manual-it"]',
    );
    expect(list).not.toBeNull();
    const row = section?.querySelector(
      `[data-pcc-execution-queue-row="${approvedPendingRecord.requestId}"]`,
    );
    expect(row).not.toBeNull();
    expect(row?.textContent).toContain(approvedPendingRecord.requestedUserLabel);
    const helper = row?.querySelector('[data-pcc-execution-queue-row-helper]');
    expect(helper?.textContent).toContain('Approved — Pending Execution');
    expect(helper?.textContent).toContain('Manual IT handled');
  });

  it('renders preview/empty state when there are no approved-pending-execution records', () => {
    const { container } = render(
      <PccAccessExecutionQueue
        records={records.filter(
          (record) => record.requestStatus !== 'approved-pending-execution',
        )}
        laneExecutionStatus="manual-it-handled"
      />,
    );
    const section = container.querySelector(
      '[data-pcc-execution-queue-section="pending-manual-it"]',
    );
    expect(section).not.toBeNull();
    expect(
      section?.querySelector('[data-pcc-execution-queue-section-list="pending-manual-it"]'),
    ).toBeNull();
    expect(section?.querySelector('[data-pcc-state="unavailable-fixture"]')).not.toBeNull();
  });
});

describe('PccAccessExecutionQueue — completed-manual derivation', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders preview/empty state when fixture has no completed-manual records (does not synthesize execution)', () => {
    const { container } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="backend-gated-later" />,
    );
    const section = container.querySelector(
      '[data-pcc-execution-queue-section="completed-manual"]',
    );
    expect(section).not.toBeNull();
    expect(
      section?.querySelector('[data-pcc-execution-queue-section-list="completed-manual"]'),
    ).toBeNull();
    expect(section?.querySelector('[data-pcc-state="unavailable-fixture"]')).not.toBeNull();
  });

  it('lists completed-manual records when present', () => {
    const completedRecord: ITeamAccessRequestPreview = {
      requestId: 'fixture-completed-manual',
      requestedUserLabel: 'User Echo',
      requestedPersona: 'project-team-member',
      requestedPermissionTemplateLabel: 'PM-Standard-Template',
      businessJustification: 'Preview record for completed-manual.',
      requestStatus: 'completed-manual',
      requestStatusLabel: 'Completed (manual)',
      requestedByLabel: 'User Alpha',
    };
    const { container } = render(
      <PccAccessExecutionQueue
        records={[...records, completedRecord]}
        laneExecutionStatus="manual-it-handled"
      />,
    );
    const section = container.querySelector(
      '[data-pcc-execution-queue-section="completed-manual"]',
    );
    expect(section).not.toBeNull();
    const row = section?.querySelector(
      '[data-pcc-execution-queue-row="fixture-completed-manual"]',
    );
    expect(row).not.toBeNull();
    expect(row?.querySelector('[data-pcc-execution-queue-row-helper]')?.textContent).toContain(
      'Manual IT handled',
    );
  });
});

describe('PccAccessExecutionQueue — backend-gated-later + preview-only sections', () => {
  afterEach(() => {
    cleanup();
  });

  it('backend-gated-later section reflects the lane status only (no synthetic records)', () => {
    const { container: gatedContainer } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="backend-gated-later" />,
    );
    const gatedSection = gatedContainer.querySelector(
      '[data-pcc-execution-queue-section="backend-gated-later"]',
    );
    expect(gatedSection).not.toBeNull();
    expect(
      gatedSection?.querySelector('[data-pcc-execution-queue-section-note="lane-deferred"]'),
    ).not.toBeNull();
    expect(gatedSection?.querySelector('[data-pcc-execution-queue-section-list]')).toBeNull();

    cleanup();

    const { container: nonGatedContainer } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="manual-it-handled" />,
    );
    const nonGatedSection = nonGatedContainer.querySelector(
      '[data-pcc-execution-queue-section="backend-gated-later"]',
    );
    expect(nonGatedSection).not.toBeNull();
    expect(
      nonGatedSection?.querySelector('[data-pcc-execution-queue-section-note="lane-deferred"]'),
    ).toBeNull();
    expect(
      nonGatedSection?.querySelector('[data-pcc-state="unavailable-fixture"]'),
    ).not.toBeNull();
  });

  it('preview-only section is posture/context-only and never synthesizes records', () => {
    const { container } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="preview-only" />,
    );
    const section = container.querySelector(
      '[data-pcc-execution-queue-section="preview-only"]',
    );
    expect(section).not.toBeNull();
    const note = section?.querySelector(
      '[data-pcc-execution-queue-section-note="preview-context"]',
    );
    expect(note).not.toBeNull();
    expect(note?.getAttribute('data-pcc-execution-queue-section-active')).toBe('true');
    expect(section?.querySelector('[data-pcc-execution-queue-section-list]')).toBeNull();
  });
});

describe('PccAccessExecutionQueue — inertness', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders no anchors, no buttons, no href attributes', () => {
    const { container } = render(
      <PccAccessExecutionQueue records={records} laneExecutionStatus="backend-gated-later" />,
    );
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[href]')).toBeNull();
  });
});

describe('PccAccessExecutionQueue — source-level guard', () => {
  function stripCommentsOnly(src: string): string {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      const next = src[i + 1];
      if (ch === '/' && next === '/') {
        while (i < n && src[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '/' && next === '*') {
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
        i += 2;
        continue;
      }
      out += ch ?? '';
      i += 1;
    }
    return out;
  }

  function stripCommentsAndStrings(src: string): string {
    let out = '';
    let i = 0;
    const n = src.length;
    while (i < n) {
      const ch = src[i];
      const next = src[i + 1];
      if (ch === '/' && next === '/') {
        while (i < n && src[i] !== '\n') i += 1;
        continue;
      }
      if (ch === '/' && next === '*') {
        i += 2;
        while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
        i += 2;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        const quote = ch;
        i += 1;
        while (i < n && src[i] !== quote) {
          if (src[i] === '\\') i += 2;
          else i += 1;
        }
        i += 1;
        continue;
      }
      out += ch ?? '';
      i += 1;
    }
    return out;
  }

  const FORBIDDEN_IMPORT_PATH_TOKENS: readonly string[] = [
    '@pnp/sp',
    '@pnp/graph',
    '@microsoft/sp-pnp-js',
    '@microsoft/sp-http',
    '@hbc/auth/spfx',
    'msgraph',
    'graph.microsoft.com',
    'procore',
  ];

  const FORBIDDEN_EXECUTABLE_TOKENS: readonly string[] = [
    'fetch(',
    'IPccReadModelClient',
    'pccReadModelClient',
    'createPccReadModelClient',
    'pccBackendReadModelClient',
    'createPccBackendReadModelClient',
    'pccFixtureReadModelClient',
    'createPccFixtureReadModelClient',
    'resolvePccReadModelConfig',
    'MSGraphClient',
    'GraphServiceClient',
    'sp.web',
    '_api/web',
    'ProcoreClient',
    'DocumentCrunchClient',
    'AdobeSignClient',
  ];

  const raw = readFileSync(QUEUE_FILE, 'utf8');
  const commentsOnly = stripCommentsOnly(raw);
  const commentsAndStringsStripped = stripCommentsAndStrings(raw);

  it.each(FORBIDDEN_IMPORT_PATH_TOKENS)(
    'PccAccessExecutionQueue.tsx (comments-only stripped) does not contain forbidden import-path token %s',
    (token) => {
      expect(commentsOnly.includes(token)).toBe(false);
    },
  );

  it.each(FORBIDDEN_EXECUTABLE_TOKENS)(
    'PccAccessExecutionQueue.tsx (comments+strings stripped) does not contain forbidden executable token %s',
    (token) => {
      expect(commentsAndStringsStripped.includes(token)).toBe(false);
    },
  );

  it('PccAccessExecutionQueueProps interface declares no executable callback props', () => {
    const interfaceMatch = raw.match(
      /export\s+interface\s+PccAccessExecutionQueueProps\s*\{([\s\S]*?)\}/,
    );
    expect(interfaceMatch).not.toBeNull();
    const body = interfaceMatch?.[1] ?? '';
    const callbackMatches = body.match(/\bon[A-Z]\w*\??\s*:/g) ?? [];
    expect(callbackMatches).toEqual([]);
  });
});
