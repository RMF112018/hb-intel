import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { FoleonIframeHost } from '../FoleonIframeHost.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';

const policy = createFoleonOriginPolicy(['https://viewer.us.foleon.com']);

function postMessageFrom(origin: string, data: unknown): void {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { origin, data }));
  });
}

afterEach(() => cleanup());

describe('FoleonIframeHost postMessage handling', () => {
  it('updates iframe height on a valid set-height message', () => {
    const { container } = render(
      <FoleonIframeHost
        src="https://viewer.us.foleon.com/published/abc/"
        title="Foleon publication"
        policy={policy}
      />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 1200 });
    expect(iframe?.style.height).toBe('1200px');
  });

  it('ignores messages from a non-allowlisted origin', () => {
    const { container } = render(
      <FoleonIframeHost
        src="https://viewer.us.foleon.com/published/abc/"
        title="Foleon publication"
        policy={policy}
      />,
    );
    const iframe = container.querySelector('iframe');
    const initialHeight = iframe?.style.height;
    postMessageFrom('https://attacker.example.com', { type: 'set-height', height: 1200 });
    expect(iframe?.style.height).toBe(initialHeight);
  });

  it('ignores set-height messages below the minimum bound', () => {
    const { container } = render(
      <FoleonIframeHost
        src="https://viewer.us.foleon.com/published/abc/"
        title="Foleon publication"
        policy={policy}
      />,
    );
    const iframe = container.querySelector('iframe');
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 10 });
    expect(iframe?.style.height).toBe('600px');
  });

  it('ignores set-height messages above the maximum bound', () => {
    const { container } = render(
      <FoleonIframeHost
        src="https://viewer.us.foleon.com/published/abc/"
        title="Foleon publication"
        policy={policy}
      />,
    );
    const iframe = container.querySelector('iframe');
    postMessageFrom('https://viewer.us.foleon.com', { type: 'set-height', height: 999999 });
    expect(iframe?.style.height).toBe('600px');
  });

  it('ignores messages with unexpected shape', () => {
    const { container } = render(
      <FoleonIframeHost
        src="https://viewer.us.foleon.com/published/abc/"
        title="Foleon publication"
        policy={policy}
      />,
    );
    const iframe = container.querySelector('iframe');
    postMessageFrom('https://viewer.us.foleon.com', 'malicious-string');
    postMessageFrom('https://viewer.us.foleon.com', null);
    postMessageFrom('https://viewer.us.foleon.com', { type: 'unknown', payload: 42 });
    expect(iframe?.style.height).toBe('600px');
  });
});
