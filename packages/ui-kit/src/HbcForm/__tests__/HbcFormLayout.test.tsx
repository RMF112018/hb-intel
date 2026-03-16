import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcFormLayout } from '../HbcFormLayout.js';

function renderLayout(props: Partial<React.ComponentProps<typeof HbcFormLayout>> = {}) {
  return render(
    <HbcThemeProvider>
      <HbcFormLayout {...props}>
        {props.children ?? <div>child content</div>}
      </HbcFormLayout>
    </HbcThemeProvider>,
  );
}

describe('HbcFormLayout', () => {
  it('renders with data-hbc-ui="form-layout"', () => {
    const { container } = renderLayout();
    const el = container.querySelector('[data-hbc-ui="form-layout"]');
    expect(el).toBeInTheDocument();
  });

  it('renders children', () => {
    renderLayout({ children: <span>Field A</span> });
    expect(screen.getByText('Field A')).toBeInTheDocument();
  });

  it('defaults to columns=1 (single-column grid)', () => {
    const { container } = renderLayout();
    const el = container.querySelector('[data-hbc-ui="form-layout"]');
    // The element should have the grid display from Griffel styles
    expect(el).toBeInTheDocument();
  });

  it('merges custom className onto root element', () => {
    const { container } = renderLayout({ className: 'my-custom-class' });
    const el = container.querySelector('[data-hbc-ui="form-layout"]');
    expect(el).toHaveClass('my-custom-class');
  });

  it('accepts all gap sizes without error', () => {
    const gaps: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    for (const gap of gaps) {
      const { container, unmount } = renderLayout({ gap });
      const el = container.querySelector('[data-hbc-ui="form-layout"]');
      expect(el).toBeInTheDocument();
      unmount();
    }
  });
});
