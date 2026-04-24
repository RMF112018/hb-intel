import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { FoleonIframeHost } from '../FoleonIframeHost.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';

const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

function postMessageFrom(
  origin: string,
  data: unknown,
  source: MessageEventSource | null,
): void {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { origin, data, source }));
  });
}

function mountHost(): {
  iframe: HTMLIFrameElement;
  source: MessageEventSource | null;
} {
  const { container } = render(
    <FoleonIframeHost
      src="https://viewer.us.foleon.com/published/abc/"
      title="Foleon publication"
      policy={policy}
    />,
  );
  const iframe = container.querySelector('iframe') as HTMLIFrameElement;
  return { iframe, source: iframe.contentWindow as MessageEventSource | null };
}

afterEach(() => cleanup());

describe('FoleonIframeHost iframe element hardening', () => {
  it('renders iframe with sandbox, allow, referrerPolicy, and loading attributes', () => {
    const { iframe } = mountHost();
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('sandbox')).toBe(
      'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-top-navigation-by-user-activation',
    );
    expect(iframe.getAttribute('allow')).toBe('fullscreen; clipboard-write');
    expect(iframe.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin');
    expect(iframe.getAttribute('loading')).toBe('lazy');
  });

  it('renders an accessible iframe title', () => {
    const { iframe } = mountHost();
    expect(iframe.getAttribute('title')).toBe('Foleon publication');
  });
});

describe('FoleonIframeHost postMessage handling', () => {
  it('updates iframe height on a valid set-height message from the iframe contentWindow', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 1200 }, source);
    expect(iframe.style.height).toBe('1200px');
  });

  it('ignores messages from a non-allowlisted origin', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://attacker.example.com', { type: 'set-height', height: 1200 }, source);
    expect(iframe.style.height).toBe('600px');
  });

  it('ignores messages whose source is not the iframe contentWindow', () => {
    const { iframe } = mountHost();
    // Right origin, wrong source — a same-origin attacker frame should not control height.
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 1200 }, window);
    expect(iframe.style.height).toBe('600px');
  });

  it('ignores set-height messages below the minimum bound', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 10 }, source);
    expect(iframe.style.height).toBe('600px');
  });

  it('ignores set-height messages above the maximum bound', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 999999 }, source);
    expect(iframe.style.height).toBe('600px');
  });

  it('ignores set-height messages with non-finite height', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: Number.NaN }, source);
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: Infinity }, source);
    expect(iframe.style.height).toBe('600px');
  });

  it('ignores messages with non-numeric height', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: '1200' }, source);
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: true }, source);
    expect(iframe.style.height).toBe('600px');
  });

  it('ignores messages with unexpected payload shapes', () => {
    const { iframe, source } = mountHost();
    postMessageFrom('https://viewer.us.foleon.com', 'malicious-string', source);
    postMessageFrom('https://viewer.us.foleon.com', null, source);
    postMessageFrom('https://viewer.us.foleon.com', 42, source);
    postMessageFrom('https://viewer.us.foleon.com', [{ type: 'set-height', height: 1200 }], source);
    postMessageFrom('https://viewer.us.foleon.com', { type: 'unknown', payload: 42 }, source);
    expect(iframe.style.height).toBe('600px');
  });
});
