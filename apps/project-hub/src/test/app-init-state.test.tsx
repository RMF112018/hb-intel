import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../App.js';

describe('App initialization gate', () => {
  it('renders smart empty state when SPFx project context is unresolved', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: () => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });

    const html = renderToString(
      <App
        initState={{
          status: 'not-found',
          siteUrl: 'https://tenant.sharepoint.com/sites/unknown',
          message: 'Project Hub could not match this SharePoint site to a canonical project registry record.',
        }}
      />,
    );

    expect(html).toContain('Project context unavailable');
    expect(html).not.toContain('Project Name');
  });
});
