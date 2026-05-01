import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  TEAM_ACCESS_EXECUTION_STATUSES,
  TEAM_ACCESS_MANAGER_PERSONAS,
  type TeamAccessExecutionStatus,
} from '@hbc/models/pcc';
import {
  LANE_EXECUTION_STATUS_TONES,
  PccExecutionStatusPanel,
} from './PccExecutionStatusPanel';
import { EXECUTION_STATUS_LABELS, NO_PERMISSION_CHANGE_NOTICE } from './teamAccessAdapter';

const PANEL_FILE = resolve(__dirname, 'PccExecutionStatusPanel.tsx');

const baseProps = {
  managerPersonas: TEAM_ACCESS_MANAGER_PERSONAS,
  auditPreviewLabel: 'Audit preview: assignment and approval events are preview-only.',
} as const;

describe('PccExecutionStatusPanel — execution status rendering', () => {
  afterEach(() => {
    cleanup();
  });

  it.each(TEAM_ACCESS_EXECUTION_STATUSES)(
    'renders canonical label and tone for %s',
    (status) => {
      const expectedLabel = EXECUTION_STATUS_LABELS[status];
      const expectedTone = LANE_EXECUTION_STATUS_TONES[status];
      const { container } = render(
        <PccExecutionStatusPanel
          {...baseProps}
          executionStatus={status}
          executionStatusLabel="Fixture-Label"
        />,
      );
      const statusNode = container.querySelector(`[data-pcc-execution-status="${status}"]`);
      expect(statusNode).not.toBeNull();
      expect(statusNode?.getAttribute('data-pcc-execution-status-tone')).toBe(expectedTone);
      expect(statusNode?.getAttribute('data-pcc-execution-status-label')).toBe(expectedLabel);
      expect(statusNode?.textContent).toContain(expectedLabel);
    },
  );

  it('renders the canonical title-case labels Preview Only / Manual IT handled / Backend-Gated Later', () => {
    const renderedLabels: string[] = [];
    for (const status of TEAM_ACCESS_EXECUTION_STATUSES) {
      const { container } = render(
        <PccExecutionStatusPanel
          {...baseProps}
          executionStatus={status as TeamAccessExecutionStatus}
          executionStatusLabel="Fixture-Label"
        />,
      );
      const node = container.querySelector(`[data-pcc-execution-status="${status}"]`);
      const label = node?.getAttribute('data-pcc-execution-status-label') ?? '';
      renderedLabels.push(label);
      cleanup();
    }
    expect(renderedLabels).toEqual(['Preview Only', 'Manual IT handled', 'Backend-Gated Later']);
  });

  it('passes through the fixture executionStatusLabel for parity', () => {
    const { container } = render(
      <PccExecutionStatusPanel
        {...baseProps}
        executionStatus="backend-gated-later"
        executionStatusLabel="backend-gated-later"
      />,
    );
    const passthrough = container.querySelector('[data-pcc-execution-status-fixture-label]');
    expect(passthrough?.textContent).toContain('backend-gated-later');
  });
});

describe('PccExecutionStatusPanel — manager personas (shared model values only)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders one chip per shared TEAM_ACCESS_MANAGER_PERSONAS value', () => {
    const { container } = render(
      <PccExecutionStatusPanel
        {...baseProps}
        executionStatus="backend-gated-later"
        executionStatusLabel="backend-gated-later"
      />,
    );
    const chipsWrapper = container.querySelector('[data-pcc-manager-personas]');
    expect(chipsWrapper?.getAttribute('data-pcc-manager-personas')).toBe(
      String(TEAM_ACCESS_MANAGER_PERSONAS.length),
    );

    const chips = Array.from(container.querySelectorAll('[data-pcc-manager-persona]'));
    const renderedPersonas = chips.map((node) => node.getAttribute('data-pcc-manager-persona'));
    expect(renderedPersonas).toEqual([...TEAM_ACCESS_MANAGER_PERSONAS]);

    for (const persona of TEAM_ACCESS_MANAGER_PERSONAS) {
      const chip = container.querySelector(`[data-pcc-manager-persona="${persona}"]`);
      expect(chip?.textContent).toBe(persona);
    }
  });
});

describe('PccExecutionStatusPanel — audit preview + no-permission-change notice', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the provided audit preview label and the canonical no-permission-change notice', () => {
    const { container } = render(
      <PccExecutionStatusPanel
        {...baseProps}
        executionStatus="backend-gated-later"
        executionStatusLabel="backend-gated-later"
      />,
    );
    expect(
      container.querySelector('[data-pcc-audit-preview-label]')?.textContent,
    ).toBe(baseProps.auditPreviewLabel);
    expect(
      container.querySelector('[data-pcc-no-permission-change-notice]')?.textContent,
    ).toBe(NO_PERMISSION_CHANGE_NOTICE);
  });
});

describe('PccExecutionStatusPanel — inertness', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders no anchors, no buttons, no href attributes', () => {
    const { container } = render(
      <PccExecutionStatusPanel
        {...baseProps}
        executionStatus="backend-gated-later"
        executionStatusLabel="backend-gated-later"
      />,
    );
    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[href]')).toBeNull();
  });
});

describe('PccExecutionStatusPanel — source-level guard', () => {
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

  const raw = readFileSync(PANEL_FILE, 'utf8');
  const commentsOnly = stripCommentsOnly(raw);
  const commentsAndStringsStripped = stripCommentsAndStrings(raw);

  it.each(FORBIDDEN_IMPORT_PATH_TOKENS)(
    'PccExecutionStatusPanel.tsx (comments-only stripped) does not contain forbidden import-path token %s',
    (token) => {
      expect(commentsOnly.includes(token)).toBe(false);
    },
  );

  it.each(FORBIDDEN_EXECUTABLE_TOKENS)(
    'PccExecutionStatusPanel.tsx (comments+strings stripped) does not contain forbidden executable token %s',
    (token) => {
      expect(commentsAndStringsStripped.includes(token)).toBe(false);
    },
  );

  it('PccExecutionStatusPanelProps interface declares no executable callback props', () => {
    const interfaceMatch = raw.match(
      /export\s+interface\s+PccExecutionStatusPanelProps\s*\{([\s\S]*?)\}/,
    );
    expect(interfaceMatch).not.toBeNull();
    const body = interfaceMatch?.[1] ?? '';
    const callbackMatches = body.match(/\bon[A-Z]\w*\??\s*:/g) ?? [];
    expect(callbackMatches).toEqual([]);
  });
});
