import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PccAccessRequestForm } from './PccAccessRequestForm';

const FORM_FILE = resolve(__dirname, 'PccAccessRequestForm.tsx');

const baseProps = {
  introText: 'Request intake preview only. Submission is deferred.',
  requestAccessButtonLabel: 'Request access (preview-only)',
  requestChangeButtonLabel: 'Request role/permission change (preview-only)',
  requestAccessEnabled: true,
  requestChangeEnabled: true,
  deferredTitle: 'Request submission is deferred',
  deferredDescription:
    'Local form state is preview-only. Persistence and approval execution remain manual / IT-handled or backend-gated later.',
} as const;

describe('PccAccessRequestForm — render + visible copy', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the intro text, button labels, and deferred-state copy', () => {
    const { container } = render(<PccAccessRequestForm {...baseProps} />);

    const form = container.querySelector('[data-pcc-access-request-form]');
    expect(form).not.toBeNull();
    expect(container.textContent).toContain(baseProps.introText);
    expect(container.textContent).toContain(baseProps.requestAccessButtonLabel);
    expect(container.textContent).toContain(baseProps.requestChangeButtonLabel);
    expect(container.textContent).toContain(baseProps.deferredTitle);
    expect(container.textContent).toContain(baseProps.deferredDescription);
  });
});

describe('PccAccessRequestForm — submit prevention and disabled state', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let originalFetch: typeof globalThis.fetch | undefined;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchSpy = vi.fn();
    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      writable: true,
      value: fetchSpy,
    });
  });

  afterEach(() => {
    cleanup();
    if (originalFetch === undefined) {
      Reflect.deleteProperty(globalThis as unknown as Record<string, unknown>, 'fetch');
    } else {
      Object.defineProperty(globalThis, 'fetch', {
        configurable: true,
        writable: true,
        value: originalFetch,
      });
    }
  });

  it('preventDefault is invoked on submit and no fetch occurs (fireEvent.submit)', () => {
    const { container } = render(<PccAccessRequestForm {...baseProps} />);
    const form = container.querySelector(
      'form[data-pcc-access-request-form]',
    ) as HTMLFormElement | null;
    expect(form).not.toBeNull();

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    fireEvent(form as HTMLFormElement, submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the access submit button disabled when requestAccessEnabled=false', () => {
    const { container } = render(
      <PccAccessRequestForm {...baseProps} requestAccessEnabled={false} />,
    );
    const submitButton = container.querySelector(
      `button[type="submit"][aria-label="${baseProps.requestAccessButtonLabel}"]`,
    ) as HTMLButtonElement | null;
    expect(submitButton).not.toBeNull();
    expect(submitButton?.disabled).toBe(true);
    expect(submitButton?.hasAttribute('disabled')).toBe(true);
  });

  it('keeps the change button disabled when requestChangeEnabled=false', () => {
    const { container } = render(
      <PccAccessRequestForm {...baseProps} requestChangeEnabled={false} />,
    );
    const changeButton = container.querySelector(
      `button[type="button"][aria-label="${baseProps.requestChangeButtonLabel}"]`,
    ) as HTMLButtonElement | null;
    expect(changeButton).not.toBeNull();
    expect(changeButton?.disabled).toBe(true);
    expect(changeButton?.hasAttribute('disabled')).toBe(true);
  });
});

/**
 * Source-level guard: the access-request form must remain free of any
 * runtime, network, or permission-execution surface. Comments and string
 * literals are stripped so legitimate prose cannot trip the scan.
 */
describe('PccAccessRequestForm — source-level guard', () => {
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

  const FORBIDDEN_TOKENS: readonly string[] = [
    'fetch(',
    'IPccReadModelClient',
    'pccReadModelClient',
    'createPccReadModelClient',
    'pccBackendReadModelClient',
    'createPccBackendReadModelClient',
    'pccFixtureReadModelClient',
    'createPccFixtureReadModelClient',
    'resolvePccReadModelConfig',
    '@pnp/sp',
    '@pnp/graph',
    '@microsoft/sp-pnp-js',
    '@microsoft/sp-http',
    '@hbc/auth/spfx',
    'msgraph',
    'graph.microsoft.com',
    'procore',
    'MSGraphClient',
    'GraphServiceClient',
    'sp.web',
    '_api/web',
    'ProcoreClient',
    'DocumentCrunchClient',
    'AdobeSignClient',
  ];

  const raw = readFileSync(FORM_FILE, 'utf8');
  const stripped = stripCommentsAndStrings(raw);

  it.each(FORBIDDEN_TOKENS)(
    'PccAccessRequestForm.tsx source does not contain forbidden token %s',
    (token) => {
      expect(stripped.includes(token)).toBe(false);
    },
  );

  it('PccAccessRequestFormProps interface declares no executable callback props', () => {
    const interfaceMatch = raw.match(
      /export\s+interface\s+PccAccessRequestFormProps\s*\{([\s\S]*?)\}/,
    );
    expect(interfaceMatch).not.toBeNull();
    const body = interfaceMatch?.[1] ?? '';
    const callbackMatches = body.match(/\bon[A-Z]\w*\??\s*:/g) ?? [];
    expect(callbackMatches).toEqual([]);
  });
});
