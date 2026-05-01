import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE } from '@hbc/models/pcc';
import { PccAccessReviewControls } from './PccAccessReviewControls';

const REVIEW_FILE = resolve(__dirname, 'PccAccessReviewControls.tsx');
const [pendingReviewRecord] =
  SAMPLE_TEAM_ACCESS_PERMISSION_REQUEST_LANE.requestPreviewRecords;

describe('PccAccessReviewControls — canReview=false (unauthorized)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the unauthorized-persona PccPreviewState and no Approve/Reject buttons', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={false} />,
    );

    const wrapper = container.querySelector('[data-pcc-access-review-controls]');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.getAttribute('data-pcc-access-review-controls')).toBe('unauthorized');
    expect(container.querySelector('[data-pcc-state="unauthorized-persona"]')).not.toBeNull();

    expect(container.querySelector('[data-pcc-review-action="approve"]')).toBeNull();
    expect(container.querySelector('[data-pcc-review-action="reject"]')).toBeNull();
  });
});

describe('PccAccessReviewControls — canReview=true (review preview)', () => {
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

  it('renders Approve/Reject buttons with the visible "(preview only)" suffix', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={true} />,
    );

    const approve = container.querySelector(
      '[data-pcc-review-action="approve"]',
    ) as HTMLButtonElement | null;
    const reject = container.querySelector(
      '[data-pcc-review-action="reject"]',
    ) as HTMLButtonElement | null;
    expect(approve).not.toBeNull();
    expect(reject).not.toBeNull();
    expect(approve?.textContent).toContain('(preview only)');
    expect(reject?.textContent).toContain('(preview only)');
    expect(approve?.getAttribute('aria-label')).toContain('(preview only)');
    expect(reject?.getAttribute('aria-label')).toContain('(preview only)');

    expect(container.textContent).toContain('Buttons update local UI only');
  });

  it('renders the helper copy and the no-permission-change notice in this action context', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={true} />,
    );
    expect(container.textContent).toContain('execute no permission change');
    expect(
      container.querySelector('[data-pcc-no-permission-change-notice]'),
    ).not.toBeNull();
    expect(container.textContent).toContain('No permission change has been executed');
  });

  it('clicking Approve updates the visible decision-preview line to "Approved"', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={true} />,
    );
    const approve = container.querySelector(
      '[data-pcc-review-action="approve"]',
    ) as HTMLButtonElement | null;
    expect(approve).not.toBeNull();

    const beforeLine = container.querySelector('[data-pcc-review-decision-preview]');
    expect(beforeLine?.getAttribute('data-pcc-review-decision-preview')).toBe('none');
    expect(beforeLine?.textContent).toContain('(none)');

    fireEvent.click(approve as HTMLButtonElement);

    const afterLine = container.querySelector('[data-pcc-review-decision-preview]');
    expect(afterLine?.getAttribute('data-pcc-review-decision-preview')).toBe('approved');
    expect(afterLine?.textContent).toContain('Approved');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('clicking Reject updates the visible decision-preview line to "Rejected"', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={true} />,
    );
    const reject = container.querySelector(
      '[data-pcc-review-action="reject"]',
    ) as HTMLButtonElement | null;
    expect(reject).not.toBeNull();

    fireEvent.click(reject as HTMLButtonElement);

    const line = container.querySelector('[data-pcc-review-decision-preview]');
    expect(line?.getAttribute('data-pcc-review-decision-preview')).toBe('rejected');
    expect(line?.textContent).toContain('Rejected');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('typing in the comment textarea updates local state without invoking fetch', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={true} />,
    );
    const textarea = container.querySelector(
      '[data-pcc-review-comment="local"]',
    ) as HTMLTextAreaElement | null;
    expect(textarea).not.toBeNull();

    fireEvent.change(textarea as HTMLTextAreaElement, {
      target: { value: 'Looks good (preview)' },
    });
    expect((textarea as HTMLTextAreaElement).value).toBe('Looks good (preview)');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('decision changes do not remove the no-permission-change notice', () => {
    const { container } = render(
      <PccAccessReviewControls request={pendingReviewRecord} canReview={true} />,
    );
    const approve = container.querySelector(
      '[data-pcc-review-action="approve"]',
    ) as HTMLButtonElement | null;
    fireEvent.click(approve as HTMLButtonElement);
    expect(
      container.querySelector('[data-pcc-no-permission-change-notice]'),
    ).not.toBeNull();
  });
});

/**
 * Source-level guard with the split scanning strategy:
 *  - comments-only stripping for forbidden import-path strings;
 *  - comments+strings stripping for executable tokens / callback-prop pattern.
 */
describe('PccAccessReviewControls — source-level guard', () => {
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

  const raw = readFileSync(REVIEW_FILE, 'utf8');
  const commentsOnly = stripCommentsOnly(raw);
  const commentsAndStringsStripped = stripCommentsAndStrings(raw);

  it.each(FORBIDDEN_IMPORT_PATH_TOKENS)(
    'PccAccessReviewControls.tsx (comments-only stripped) does not contain forbidden import-path token %s',
    (token) => {
      expect(commentsOnly.includes(token)).toBe(false);
    },
  );

  it.each(FORBIDDEN_EXECUTABLE_TOKENS)(
    'PccAccessReviewControls.tsx (comments+strings stripped) does not contain forbidden executable token %s',
    (token) => {
      expect(commentsAndStringsStripped.includes(token)).toBe(false);
    },
  );

  it('PccAccessReviewControlsProps interface declares no executable callback props', () => {
    const interfaceMatch = raw.match(
      /export\s+interface\s+PccAccessReviewControlsProps\s*\{([\s\S]*?)\}/,
    );
    expect(interfaceMatch).not.toBeNull();
    const body = interfaceMatch?.[1] ?? '';
    const callbackMatches = body.match(/\bon[A-Z]\w*\??\s*:/g) ?? [];
    expect(callbackMatches).toEqual([]);
  });
});
