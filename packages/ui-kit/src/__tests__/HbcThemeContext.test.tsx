// @vitest-environment happy-dom
import * as React from 'react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { HbcThemeProvider } from '../HbcAppShell/HbcThemeContext.js';
import { useHbcTheme } from '../theme/useHbcTheme.js';
import type { UseHbcThemeReturn } from '../theme/useHbcTheme.js';

type ReactActGlobal = typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

function ThemeProbe({ onRead }: { onRead: (value: UseHbcThemeReturn) => void }): React.ReactNode {
  onRead(useHbcTheme());
  return null;
}

describe('HbcThemeContext', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as ReactActGlobal).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    document.documentElement.removeAttribute('data-hbc-app');

    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        }),
      });
    }

    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
    (globalThis as ReactActGlobal).IS_REACT_ACT_ENVIRONMENT = false;
  });

  it('renders children through HbcThemeProvider', () => {
    act(() => {
      root.render(
        <HbcThemeProvider>
          <div data-testid="content">context-ready</div>
        </HbcThemeProvider>,
      );
    });

    expect(host.textContent).toContain('context-ready');
  });

  it('defaults to office mode and propagates toggle to sibling consumers', () => {
    let left: UseHbcThemeReturn | undefined;
    let right: UseHbcThemeReturn | undefined;

    function Harness(): React.ReactNode {
      const { toggleFieldMode } = useHbcTheme();
      return (
        <>
          <ThemeProbe onRead={(value) => {
            left = value;
          }} />
          <ThemeProbe onRead={(value) => {
            right = value;
          }} />
          <button type="button" onClick={toggleFieldMode}>toggle</button>
        </>
      );
    }

    act(() => {
      root.render(
        <HbcThemeProvider>
          <Harness />
        </HbcThemeProvider>,
      );
    });

    expect(left?.isFieldMode).toBe(false);
    expect(right?.isFieldMode).toBe(false);
    expect(left).toBe(right);

    const toggleButton = host.querySelector('button');
    expect(toggleButton).not.toBeNull();

    act(() => {
      toggleButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(left?.isFieldMode).toBe(true);
    expect(right?.isFieldMode).toBe(true);
    expect(left).toBe(right);
  });

  it('throws a descriptive error when useHbcTheme is called outside provider', () => {
    function BrokenConsumer(): React.ReactNode {
      useHbcTheme();
      return null;
    }

    expect(() => renderToString(<BrokenConsumer />)).toThrow(/HbcThemeProvider/);
  });
});
